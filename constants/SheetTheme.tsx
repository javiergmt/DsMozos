// Estilos compartidos para el contenido de las hojas (HojaModal)
import { StyleSheet } from 'react-native'
import Colors from './Colors'

// Estilos compartidos para el contenido de los sheets
export const sheetStyles = StyleSheet.create({
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.colorfondoBoton,
  },
  subtitulo: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.background,
    opacity: 0.7,
    marginTop: -10,
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divisorLinea: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.backbotones,
  },
  divisorText: {
    fontSize: 13,
    color: Colors.background,
    opacity: 0.7,
  },
})

