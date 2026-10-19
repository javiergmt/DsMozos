import React, { useCallback, useEffect, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import InputSpinner from 'react-native-input-spinner'
import Colors from '../constants/Colors'
import FilaGustoUnico from './FilaGustoUnico'
import { gustosType } from '../app/ApiFront/Types/BDTypes'

type Props = {
  visible: boolean
  gustos: gustosType[]
  cantGustos: number
  cantMax: number
  esSeleccionado: (idGusto: number) => boolean
  onUnico: (g: gustosType) => void
  onInc: (valor: number, inc: number, g: gustosType) => void
  onConfirmar: () => void
}

const ALTO_FOOTER = 84

// Hoja de seleccion de gustos (fondo blanco). Es obligatoria: no se cierra tocando afuera ni arrastrando.
// Con maximo 1 se elige con seleccion simple, con mas se usa el contador por gusto.
// Requiere BottomSheetModalProvider en el layout raiz.
export default function HojaGustos({ visible, gustos, cantGustos, cantMax, esSeleccionado, onUnico, onInc, onConfirmar }: Props) {
  const ref = useRef<BottomSheetModal>(null)
  const { height } = useWindowDimensions()
  const excedido = cantGustos > cantMax
  const okSel = cantGustos > 0 && !excedido

  useEffect(() => {
    if (visible) ref.current?.present()
    else ref.current?.dismiss()
  }, [visible])

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} pressBehavior="none" />
  ), [])

  const renderFooter = (props: BottomSheetFooterProps) => (
    <BottomSheetFooter {...props} bottomInset={0}>
      <View style={styles.footer}>
        <View style={[styles.contador, excedido ? styles.contadorError : null]}>
          <Text style={styles.contadorText}>{cantGustos} / {cantMax}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btConfirmar, !okSel ? styles.btDeshabilitado : null]}
          onPress={onConfirmar}
          disabled={!okSel}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={22} color="white" />
          <Text style={styles.btText}>Confirmar Gustos</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  )

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      maxDynamicContentSize={Math.round(height * 0.85)}
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      backgroundStyle={styles.fondo}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Seleccionar Gustos</Text>
        {gustos.map((g) => cantMax == 1 ? (
          <FilaGustoUnico
            key={g.idGusto}
            texto={g.descGusto}
            seleccionado={esSeleccionado(g.idGusto)}
            onPress={() => onUnico(g)}
            style={styles.gusto}
            textStyle={styles.gustoText}
          />
        ) : (
          <View style={styles.gusto} key={g.idGusto}>
            <Text style={styles.gustoText} numberOfLines={2}>{g.descGusto}</Text>
            <InputSpinner
              value={0}
              style={styles.spinner}
              color={Colors.colorcheckbox}
              onIncrease={(value) => onInc(value as number, 1, g)}
              onDecrease={(value) => onInc(value as number, -1, g)}
            />
          </View>
        ))}
      </BottomSheetScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: ALTO_FOOTER + 16,
    gap: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
    textAlign: 'center',
    paddingBottom: 6,
  },
  gusto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
    backgroundColor: '#ffffff',
  },
  gustoText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
  },
  spinner: {
    width: 140,
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: ALTO_FOOTER,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.backbotones,
  },
  contador: {
    height: 48,
    minWidth: 64,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1.5,
    borderColor: Colors.colorcheckbox,
  },
  contadorError: {
    borderColor: Colors.colorBackBoton,
  },
  contadorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  btConfirmar: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  btDeshabilitado: {
    opacity: 0.45,
  },
  btText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
})
