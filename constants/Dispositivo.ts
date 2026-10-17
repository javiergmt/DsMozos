// Deteccion de tablet y bloqueo de orientacion
// Tablets: pueden rotar (vertical u horizontal)
// Celulares: quedan fijos en vertical

import { Dimensions, useWindowDimensions } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'

// Se usa 'screen' (no cambia con la rotacion ni con la barra de estado).
// Criterio estandar: el lado menor de la pantalla >= 600dp es tablet.
const { width, height } = Dimensions.get('screen')
export const esTablet = Math.min(width, height) >= 600

// Ancho de cada tarjeta de una grilla, recalculado al rotar la pantalla
// anchoMin: ancho aproximado deseado por tarjeta; padding: margen total horizontal
export const useGrilla = (anchoMin: number, gap = 10, padding = 24, minColumnas = 3) => {
  const { width } = useWindowDimensions()
  const columnas = Math.max(minColumnas, Math.floor((width - padding) / anchoMin))
  return Math.floor((width - padding - (columnas - 1) * gap) / columnas)
}

export const configurarOrientacion = async () => {
  try {
    if (esTablet) {
      await ScreenOrientation.unlockAsync()
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
  } catch (e) {
    console.log('Error al configurar orientacion:', e)
  }
}
