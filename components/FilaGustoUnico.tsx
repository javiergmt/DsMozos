import React from 'react'
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Colors from '../constants/Colors'

type Props = {
  texto: string
  seleccionado: boolean
  onPress: () => void
  style?: StyleProp<ViewStyle>
  textStyle?: object
}

// Fila de seleccion simple (radio): se usa cuando el maximo de gustos es 1
export default function FilaGustoUnico({ texto, seleccionado, onPress, style, textStyle }: Props) {
  return (
    <Pressable onPress={onPress} style={[style, seleccionado ? styles.seleccionada : null]}>
      <Ionicons
        name={seleccionado ? 'radio-button-on' : 'radio-button-off'}
        size={26}
        color={Colors.colorcheckbox}
      />
      <Text style={[textStyle, styles.texto]} numberOfLines={2}>{texto}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  seleccionada: { borderWidth: 1, borderColor: Colors.colorcheckbox },
  texto: { flex: 1 },
})
