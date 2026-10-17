// Apariencia comun de todos los BottomSheet de la app
// Uso: <BottomSheet {...sheetTheme} ref=... snapPoints=... >
// Va en /constants (fuera de /app) para que expo-router no lo tome como ruta

import React from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import Colors from './Colors'

// Fondo oscurecido detras del sheet.
// pressBehavior 'none': tocar el fondo NO cierra el sheet (se mantiene el comportamiento original)
const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.55}
    pressBehavior="none"
  />
)

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.colorBackModal,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.backbotones,
  },
})

// Alturas del sheet en pixeles: porcentaje del alto actual, con un minimo para que el
// contenido entre en horizontal (tablets). Nunca supera el 90% del alto. Se recalcula al rotar.
export const useSnapPoints = (porcentajes: number[], minimos: number[]) => {
  const { height } = useWindowDimensions()
  return porcentajes.map((pct, i) =>
    Math.round(Math.min(height * 0.9, Math.max(height * pct / 100, minimos[i] ?? 0)))
  )
}

export const sheetTheme = {
  backgroundStyle: styles.background,
  handleIndicatorStyle: styles.handleIndicator,
  backdropComponent: renderBackdrop,
}

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

export default sheetTheme
