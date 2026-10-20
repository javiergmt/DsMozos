import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Colors from '../constants/Colors'

type Props = {
  value: number
  onChange: (value: number) => void
  disableIncrease?: boolean
}

export default function SelectorCantidad({ value, onChange, disableIncrease = false }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel="Disminuir cantidad"
        style={[styles.boton, value <= 0 ? styles.botonDeshabilitado : null]}
        onPress={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        activeOpacity={0.7}
      >
        <Ionicons name="remove" size={20} color="white" />
      </TouchableOpacity>
      <Text style={styles.cantidad}>{value}</Text>
      <TouchableOpacity
        accessibilityLabel="Aumentar cantidad"
        style={[styles.boton, disableIncrease ? styles.botonDeshabilitado : null]}
        onPress={() => onChange(value + 1)}
        disabled={disableIncrease}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 4,
    borderRadius: 22,
    backgroundColor: '#173B57',
  },
  boton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.colorcheckbox,
  },
  botonDeshabilitado: {
    opacity: 0.4,
  },
  cantidad: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
})
