// Busca la PC servidor (ApiRestRs) en la red wifi del local, para cuando cambio su IP.
// Recorre las 254 direcciones de la red del telefono (ej. 192.168.1.1 a .254) en el puerto
// configurado, y se queda con la que responde `mensajes_comanda` con la misma base de datos:
// asi no se confunde con otro equipo que tenga ese puerto abierto.
// (Adaptado de RsMozosDs, que usa `platos_obs`; esta API no tiene ese endpoint.)

import * as Network from 'expo-network'

export type ResultadoBusqueda = {
  ok: boolean,
  url?: string,                           // si ok
  motivo?: 'sinWifi' | 'noEncontrado',    // si no ok
  red?: string,                           // red recorrida, ej. "192.168.1"
}

const TIEMPO_POR_IP = 1500   // ms; las IPs sin equipo no contestan y se cortan por tiempo
const EN_PARALELO = 32

// Responde la API con esta base? (cualquier otra cosa, o nada, es "no")
async function esElServidor(url: string, base: string): Promise<boolean> {
  const control = new AbortController()
  const corte = setTimeout(() => control.abort(), TIEMPO_POR_IP)
  try {
    const r = await fetch(url + 'mensajes_comanda', { headers: { bd: base }, signal: control.signal })
    if (!r.ok) return false
    const datos = await r.json()
    return Array.isArray(datos)
  } catch {
    return false
  } finally {
    clearTimeout(corte)
  }
}

const esIpPrivada = (ip: string) =>
  /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip)

/**
 * @param puerto     puerto de la API (el de la configuracion actual, normalmente 1234)
 * @param base       base de datos configurada (header `bd`)
 * @param ipAnterior IP que tenia guardada (se prueba primero)
 * @param progreso   avisa cuantas direcciones van probadas, de 254
 */
export async function buscarServidor(puerto: string, base: string, ipAnterior: string,
                                     progreso?: (probadas: number) => void): Promise<ResultadoBusqueda> {
  const ipTelefono = await Network.getIpAddressAsync().catch(() => '')
  if (!ipTelefono || !esIpPrivada(ipTelefono)) return { ok: false, motivo: 'sinWifi' }

  const red = ipTelefono.split('.').slice(0, 3).join('.')
  const urlDe = (ip: string) => `http://${ip}:${puerto}/`

  // Primero la IP de antes (puede haber sido una caida momentanea)
  if (ipAnterior && ipAnterior != '0.0.0.0' && await esElServidor(urlDe(ipAnterior), base)) {
    return { ok: true, url: urlDe(ipAnterior) }
  }

  const candidatas: string[] = []
  for (let n = 1; n <= 254; n++) {
    const ip = `${red}.${n}`
    if (ip != ipTelefono && ip != ipAnterior) candidatas.push(ip)
  }

  let probadas = 0
  let encontrada: string | null = null
  for (let i = 0; i < candidatas.length && !encontrada; i += EN_PARALELO) {
    const tanda = candidatas.slice(i, i + EN_PARALELO)
    const resultados = await Promise.all(tanda.map(async (ip) => (await esElServidor(urlDe(ip), base)) ? ip : null))
    encontrada = resultados.find((r) => r != null) ?? null
    probadas += tanda.length
    progreso?.(Math.min(probadas, 254))
  }

  return encontrada ? { ok: true, url: urlDe(encontrada) } : { ok: false, motivo: 'noEncontrado', red }
}
