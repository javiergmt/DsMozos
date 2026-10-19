import React, { useCallback, useEffect, useRef } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import Colors from '../constants/Colors'

type Props = {
  visible: boolean
  // Se llama solo cuando el usuario cierra la hoja arrastrando; no al cerrarla por codigo (visible = false)
  onCerrar?: () => void
  scroll?: boolean
  children: React.ReactNode
}

// Hoja inferior generica (fondo blanco, altura segun el contenido).
// Requiere BottomSheetModalProvider en el layout raiz.
export default function HojaModal({ visible, onCerrar, scroll = false, children }: Props) {
  const ref = useRef<BottomSheetModal>(null)
  const cierreProgramatico = useRef(true)
  const { height } = useWindowDimensions()

  useEffect(() => {
    cierreProgramatico.current = !visible
    if (visible) ref.current?.present()
    else ref.current?.dismiss()
  }, [visible])

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} pressBehavior="none" />
  ), [])

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      maxDynamicContentSize={Math.round(height * 0.9)}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.fondo}
      handleIndicatorStyle={styles.handle}
      onDismiss={() => {
        if (cierreProgramatico.current) return
        cierreProgramatico.current = true
        onCerrar?.()
      }}
    >
      {scroll ? (
        <BottomSheetScrollView contentContainerStyle={styles.contenido}>{children}</BottomSheetScrollView>
      ) : (
        <BottomSheetView style={styles.contenido}>{children}</BottomSheetView>
      )}
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  fondo: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.backbotones,
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
})
