import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'
import Colors from '../constants/Colors'

export type BotonDialogo = {
  texto: string
  estilo?: 'normal' | 'cancelar' | 'peligro'
  onPress?: () => void
}

type EstadoDialogo = {
  visible: boolean
  titulo: string
  mensaje: string
  botones: BotonDialogo[]
  cerrar: () => void
}

const useDialogoStore = create<EstadoDialogo>((set) => ({
  visible: false,
  titulo: '',
  mensaje: '',
  botones: [],
  cerrar: () => set({ visible: false }),
}))

// Reemplazo de Alert.alert: se puede llamar desde cualquier archivo (no solo componentes)
export function mostrarDialogo(titulo: string, mensaje = '', botones?: BotonDialogo[]) {
  useDialogoStore.setState({
    visible: true,
    titulo,
    mensaje,
    botones: botones && botones.length > 0 ? botones : [{ texto: 'Aceptar' }],
  })
}

// Pregunta Aceptar/Cancelar; resuelve true si el usuario acepta
export function confirmar(titulo: string, mensaje = '', textoAceptar = 'Aceptar', peligro = false): Promise<boolean> {
  return new Promise((resolve) => {
    mostrarDialogo(titulo, mensaje, [
      { texto: 'Cancelar', estilo: 'cancelar', onPress: () => resolve(false) },
      { texto: textoAceptar, estilo: peligro ? 'peligro' : 'normal', onPress: () => resolve(true) },
    ])
  })
}

// Se monta una sola vez en el layout raiz
export function DialogoHost() {
  const { visible, titulo, mensaje, botones, cerrar } = useDialogoStore()

  const presionar = (b: BotonDialogo) => {
    cerrar()
    b.onPress?.()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar} statusBarTranslucent>
      <View style={styles.fondo}>
        <View style={styles.caja}>
          <Text style={styles.titulo}>{titulo}</Text>
          {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
          <View style={styles.botones}>
            {botones.map((b, i) => (
              <Pressable
                key={i}
                onPress={() => presionar(b)}
                style={[
                  styles.boton,
                  b.estilo === 'cancelar' && styles.botonCancelar,
                  b.estilo === 'peligro' && styles.botonPeligro,
                ]}
              >
                <Text style={[styles.textoBoton, b.estilo === 'cancelar' && styles.textoCancelar]}>{b.texto}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  caja: { width: '100%', maxWidth: 420, backgroundColor: Colors.colorFondoCuenta, borderRadius: 14, padding: 20 },
  titulo: { color: Colors.colorletrabotones, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  mensaje: { color: Colors.itemsviejos, fontSize: 15, lineHeight: 21, marginBottom: 16 },
  botones: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' },
  boton: { backgroundColor: Colors.colorfondoBoton, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  botonCancelar: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.backbotones },
  botonPeligro: { backgroundColor: Colors.colornjaboton },
  textoBoton: { color: Colors.colorletrabotones, fontSize: 15, fontWeight: 'bold' },
  textoCancelar: { color: Colors.itemsviejos },
})
