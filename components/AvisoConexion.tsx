// Aviso de conexion arriba de todas las pantallas + chequeo periodico de la API.
// - Sin conexion con el servidor: franja roja "Sin conexion con el servidor · reintentando".
// - Comandas pendientes: dice cuantas hay; se envian solas cuando vuelve la conexion.
// - Comandas con error de la API: tocar la franja abre la lista para reintentar o descartar.

import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, AppState, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLoginStore } from '../app/store/useLoginStore'
import { useCola, cargarCola, procesarCola, reintentar, descartar, Trabajo } from '../servicios/colaComandas'
import { fetchConTiempo } from '../servicios/red'
import Colors from '../constants/Colors'

const CADA = 10000          // ms entre chequeos
const TIEMPO_CHEQUEO = 4000 // ms

// Colores del aviso (de la paleta)
export const colorAviso = (servidorOk: boolean | null, conError: number) =>
  servidorOk === false || conError > 0 ? Colors.colornjaboton : Colors.colorBackBoton

// Chequea la API cada CADA ms y al volver la app a primer plano.
// Si hay conexion y comandas pendientes, las envia.
export function MonitorConexion() {
  const { urlBase, BaseDatos } = useLoginStore()

  useEffect(() => { cargarCola() }, [])

  useEffect(() => {
    if (!urlBase || urlBase.includes('0.0.0.0')) return
    let vivo = true
    const chequear = async () => {
      let ok = false
      try {
        const r = await fetchConTiempo(urlBase + 'mensajes_comanda', { headers: { bd: BaseDatos } }, TIEMPO_CHEQUEO)
        ok = r.ok
      } catch { ok = false }
      if (!vivo) return
      useCola.getState().setServidorOk(ok)
      if (ok && useCola.getState().trabajos.some((t) => !t.error)) procesarCola()
    }
    chequear()
    const intervalo = setInterval(chequear, CADA)
    const sub = AppState.addEventListener('change', (e) => { if (e == 'active') chequear() })
    return () => { vivo = false; clearInterval(intervalo); sub.remove() }
  }, [urlBase, BaseDatos])

  return null
}

const hora = (iso: string) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n == 1 ? uno : varios}`

export default function AvisoConexion() {
  const { trabajos, servidorOk, enviando } = useCola()
  const [abierto, setAbierto] = useState(false)

  const pendientes = trabajos.filter((t) => !t.error).length
  const conError = trabajos.filter((t) => !!t.error).length

  if (servidorOk !== false && pendientes == 0 && conError == 0) return null

  let texto = ''
  let icono: any = 'cloud-upload-outline'
  if (servidorOk === false) {
    icono = 'cloud-offline-outline'
    texto = 'Sin conexión con el servidor · reintentando'
    if (pendientes > 0) texto += '  ·  ' + plural(pendientes, 'comanda pendiente', 'comandas pendientes')
  } else if (conError > 0) {
    icono = 'alert-circle-outline'
    texto = plural(conError, 'comanda no se pudo grabar', 'comandas no se pudieron grabar') + ' · tocá para ver'
  } else {
    texto = enviando ? `Enviando ${plural(pendientes, 'comanda pendiente', 'comandas pendientes')}…`
                     : plural(pendientes, 'comanda pendiente', 'comandas pendientes') + ' de envío'
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => trabajos.length > 0 && setAbierto(true)}
        activeOpacity={0.8}
        style={[estilos.franja, { backgroundColor: colorAviso(servidorOk, conError) }]}
      >
        <Ionicons name={icono} size={18} color="#ffffff" />
        <Text style={estilos.texto} numberOfLines={2}>{texto}</Text>
        {trabajos.length > 0 ? <Ionicons name="chevron-down" size={18} color="#ffffff" /> : null}
      </TouchableOpacity>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <View style={estilos.fondo}>
          <View style={estilos.dialogo}>
            <Text style={estilos.titulo}>Comandas sin enviar</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {trabajos.map((t: Trabajo) => (
                <View key={t.id} style={estilos.fila}>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.mesa}>
                      Mesa {t.nroMesa}{t.descMesa ? ' ' + t.descMesa : ''} · {hora(t.creado)}
                    </Text>
                    <Text style={[estilos.estado, t.error ? estilos.estadoError : null]}>
                      {t.error ? `Error: ${t.error}`
                        : !t.pasos.grabado ? 'Pendiente de grabar'
                        : !t.pasos.impreso ? 'Grabada · falta imprimir en cocina'
                        : 'Falta liberar la mesa'}
                    </Text>
                  </View>
                  {t.error ? (
                    <View style={estilos.acciones}>
                      <TouchableOpacity onPress={() => reintentar(t.id)} style={estilos.accion} activeOpacity={0.7}>
                        <Ionicons name="refresh" size={22} color={Colors.colorfondoBoton} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={estilos.accion}
                        activeOpacity={0.7}
                        onPress={() => Alert.alert('Descartar comanda',
                          `La comanda de la mesa ${t.nroMesa} no se grabó. ¿Descartarla? Vas a tener que cargarla de nuevo.`,
                          [{ text: 'Cancelar', style: 'cancel' },
                           { text: 'Descartar', style: 'destructive', onPress: () => descartar(t.id) }])}
                      >
                        <Ionicons name="trash-outline" size={22} color={Colors.colornjaboton} />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
            <Text style={estilos.ayuda}>
              Las pendientes se envían solas cuando vuelve la conexión. La mesa queda tomada hasta que se envíe.
            </Text>
            <View style={estilos.botones}>
              <TouchableOpacity style={estilos.btCerrar} onPress={() => setAbierto(false)} activeOpacity={0.7}>
                <Text style={estilos.btCerrarText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.btReintentar, enviando ? estilos.btDeshabilitado : null]}
                onPress={() => procesarCola()}
                disabled={enviando}
                activeOpacity={0.7}
              >
                {enviando
                  ? <ActivityIndicator color="white" />
                  : <Ionicons name="refresh" size={20} color="white" />}
                <Text style={estilos.btText}>Reintentar ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const estilos = StyleSheet.create({
  franja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  texto: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  fondo: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dialogo: {
    gap: 12,
    padding: 20,
    borderRadius: 20,
    backgroundColor: Colors.colorBackModal,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.colorfondoBoton,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.backbotones,
  },
  mesa: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.background,
  },
  estado: {
    fontSize: 13,
    marginTop: 2,
    color: Colors.background,
    opacity: 0.75,
  },
  estadoError: {
    color: Colors.colornjaboton,
    opacity: 1,
  },
  acciones: {
    flexDirection: 'row',
    gap: 4,
  },
  accion: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayuda: {
    fontSize: 13,
    color: Colors.background,
    opacity: 0.75,
  },
  botones: {
    flexDirection: 'row',
    gap: 12,
  },
  btCerrar: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.colorfondoBoton,
  },
  btCerrarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
  },
  btReintentar: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  btDeshabilitado: {
    opacity: 0.6,
  },
  btText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
})
