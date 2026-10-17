// Cola de comandas: si al comandar no hay conexion con la API, la comanda queda guardada en el
// telefono ("pendiente") y se envia sola cuando vuelve la conexion.
//
// Cada comanda es un "trabajo" con 3 pasos: grabar los renglones (mesa_det_mult_noimp),
// imprimir en cocina (comandar) y liberar/eliminar la mesa. Se guarda ANTES de enviar y se anota
// cada paso cumplido: si se corta en el medio, el reintento sigue desde donde quedo.
//
// Todas las llamadas llevan el header Id-Comanda (idempotencia) con el id del trabajo: si la API
// ya habia procesado un paso (se corto justo despues de procesarlo), no lo repite
// (no graba ni imprime dos veces).
//
// La mesa queda bloqueada en el servidor mientras la comanda esta pendiente (nadie la puede tomar)
// y se libera en el ultimo paso.
//
// Persistencia: la cola vive en memoria (zustand) y se copia a un archivo JSON del telefono
// (expo-file-system), asi sobrevive si se cierra la app.

import * as FileSystem from 'expo-file-system'
import { create } from 'zustand'
import { modificarPlatoPost } from '../app/ApiFront/Posts/ConvDatos'
import { comanda, mesaDetPost } from '../app/ApiFront/Types/BDTypes'
import { fetchConTiempo, SinConexion } from './red'

const ARCHIVO = FileSystem.documentDirectory + 'colaComandas.json'
const TIEMPO_PASO = 15000   // ms por llamada (imprimir puede tardar)

export type Trabajo = {
  id: string,
  creado: string,                 // ISO
  url: string,
  base: string,
  nroMesa: number,
  descMesa: string,
  nombreMozo: string,
  cantRenglones: number,
  renglones: object[],            // ya convertidos con modificarPlatoPost
  comanda: comanda | null,        // null: no hay nada para imprimir
  alFinal: 'liberar' | 'eliminar',
  pasos: { grabado: boolean, impreso: boolean, liberado: boolean },
  error?: string,                 // error de la API (no de red): no se reintenta solo
}

type EstadoCola = {
  trabajos: Trabajo[],
  enviando: boolean,
  servidorOk: boolean | null,     // null: todavia no se sabe
  setServidorOk: (ok: boolean) => void,
}

export const useCola = create<EstadoCola>((set) => ({
  trabajos: [],
  enviando: false,
  servidorOk: null,
  setServidorOk: (ok) => set({ servidorOk: ok }),
}))

const guardar = async (trabajos: Trabajo[]) => {
  useCola.setState({ trabajos })
  try {
    await FileSystem.writeAsStringAsync(ARCHIVO, JSON.stringify(trabajos))
  } catch (e) {
    console.log('Cola: no se pudo guardar', e)
  }
}

const actualizar = async (t: Trabajo) => {
  const lista = useCola.getState().trabajos.map((x) => x.id == t.id ? t : x)
  await guardar(lista)
}

export async function cargarCola() {
  try {
    const info = await FileSystem.getInfoAsync(ARCHIVO)
    if (!info.exists) return
    const crudo = await FileSystem.readAsStringAsync(ARCHIVO)
    useCola.setState({ trabajos: crudo ? JSON.parse(crudo) : [] })
  } catch (e) {
    console.log('Cola: no se pudo leer', e)
  }
}

export const pendientesDeMesa = (nroMesa: number) =>
  useCola.getState().trabajos.filter((t) => t.nroMesa == nroMesa)

const nuevoId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = Math.random() * 16 | 0
    return (ch == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })

// Llamada a la API con el Id-Comanda. Si no hay red (o se agota el tiempo) tira SinConexion.
async function llamar(t: Trabajo, ruta: string, metodo: string, cuerpo: object): Promise<any> {
  let r: Response
  try {
    r = await fetchConTiempo(t.url + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', 'bd': t.base, 'Id-Comanda': t.id },
      body: JSON.stringify(cuerpo),
    }, TIEMPO_PASO)
  } catch (e: any) {
    throw new SinConexion(e?.message ?? 'sin conexion')
  }
  if (r.status >= 500) throw new SinConexion('error ' + r.status)   // API caida o reiniciando
  const texto = await r.text()
  try { return texto ? JSON.parse(texto) : {} } catch { return {} }
}

// Mismo cuerpo que arma Comandar() en PostDatos.ts
const cuerpoComanda = (c: comanda) => ({
  nroMesa: c.nroMesa,
  descMesa: c.descMesa,
  idMozo: c.idMozo,
  nombreMozo: c.nombreMozo,
  comensales: c.comensales,
  // Fecha/hora en que el mozo comandó (se arma al crear la comanda). En un reintento se mantiene
  // la hora original, no la del reenvio.
  fechaHora: c.fechaHora || new Date().toISOString(),
  platos: c.platos,
})

// Ejecuta los pasos que falten. Devuelve true si termino; tira SinConexion si se corto.
async function procesar(t: Trabajo): Promise<boolean> {
  if (!t.pasos.grabado) {
    if (t.cantRenglones > 0) {
      const res = await llamar(t, 'mesa_det_mult_noimp/', 'POST', { mesaDetM: t.renglones })
      if (res?.mensaje != 'commit') {
        t.error = res?.mensaje ? String(res.mensaje) : 'La API no confirmó la grabación'
        await actualizar(t)
        return false
      }
    }
    t.pasos.grabado = true
    await actualizar(t)
  }
  if (!t.pasos.impreso) {
    if (t.comanda && t.comanda.platos?.length > 0) {
      await llamar(t, 'comandar/', 'POST', cuerpoComanda(t.comanda))
    }
    t.pasos.impreso = true
    await actualizar(t)
  }
  if (!t.pasos.liberado) {
    if (t.alFinal == 'eliminar') await llamar(t, 'mesa_borrar/', 'DELETE', { nromesa: t.nroMesa })
    else await llamar(t, 'mesa_desbloquear/', 'POST', { nromesa: t.nroMesa })
    t.pasos.liberado = true
  }
  await guardar(useCola.getState().trabajos.filter((x) => x.id != t.id))
  return true
}

export type ResultadoEnvio = 'enviada' | 'pendiente' | { error: string }

/** Guarda la comanda en la cola y la intenta enviar en el momento. */
export async function encolarYEnviar(datos: {
  url: string, base: string, nroMesa: number, descMesa: string, nombreMozo: string,
  detalle: mesaDetPost[], comanda: comanda | null, alFinal: 'liberar' | 'eliminar',
}): Promise<ResultadoEnvio> {
  const t: Trabajo = {
    id: nuevoId(),
    creado: new Date().toISOString(),
    url: datos.url,
    base: datos.base,
    nroMesa: datos.nroMesa,
    descMesa: datos.descMesa,
    nombreMozo: datos.nombreMozo,
    cantRenglones: datos.detalle.length,
    renglones: datos.detalle.map((d) => modificarPlatoPost(d)),
    comanda: datos.comanda,
    alFinal: datos.alFinal,
    pasos: { grabado: false, impreso: false, liberado: false },
  }
  await guardar([...useCola.getState().trabajos, t])
  try {
    const ok = await procesar(t)
    useCola.getState().setServidorOk(true)
    if (ok) return 'enviada'
    // Error de la API al grabar (no de red): no se grabo nada. Se saca de la cola porque el mozo
    // sigue en la cuenta y puede corregir y volver a comandar; la mesa sigue tomada por el.
    await guardar(useCola.getState().trabajos.filter((x) => x.id != t.id))
    return { error: t.error ?? 'Error' }
  } catch (e) {
    if (e instanceof SinConexion) {
      useCola.getState().setServidorOk(false)
      return 'pendiente'
    }
    throw e
  }
}

/** Reintenta las comandas pendientes (sin error), en orden. Se corta al primer problema de red. */
export async function procesarCola(): Promise<void> {
  if (useCola.getState().enviando) return
  useCola.setState({ enviando: true })
  try {
    for (const t of [...useCola.getState().trabajos]) {
      if (t.error) continue
      await procesar({ ...t, pasos: { ...t.pasos } })
    }
    useCola.getState().setServidorOk(true)
  } catch (e) {
    if (e instanceof SinConexion) useCola.getState().setServidorOk(false)
    else console.log('Cola: error', e)
  } finally {
    useCola.setState({ enviando: false })
  }
}

/** Vuelve a intentar una comanda que habia dado error de la API. */
export async function reintentar(id: string) {
  const t = useCola.getState().trabajos.find((x) => x.id == id)
  if (!t) return
  await actualizar({ ...t, error: undefined })
  await procesarCola()
}

/** Saca la comanda de la cola y, si se puede, desbloquea la mesa (para que no quede tomada). */
export async function descartar(id: string) {
  const t = useCola.getState().trabajos.find((x) => x.id == id)
  await guardar(useCola.getState().trabajos.filter((x) => x.id != id))
  if (t && !t.pasos.liberado) {
    try { await llamar(t, 'mesa_desbloquear/', 'POST', { nromesa: t.nroMesa }) } catch { /* sin red: queda bloqueada */ }
  }
}
