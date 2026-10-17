// Componentes y estilos comunes para los headers de la app
// Va fuera de /app para que expo-router no lo tome como ruta

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Colors from '../constants/Colors'

// Opciones de header comunes para Stack y Tabs
export const headerTheme = {
  headerStyle: {
    backgroundColor: Colors.background,
  },
  headerShadowVisible: false,
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold' as const,
  },
  headerTitleAlign: 'center' as const,
}

type Props = {
  titulo: string
  subtitulo?: string
  icono?: keyof typeof Ionicons.glyphMap
}

// Titulo en dos lineas: principal + secundaria (opcional)
export const HeaderTitulo = ({ titulo, subtitulo, icono }: Props) => (
  <View style={styles.contenedor}>
    <View style={styles.fila}>
      {icono ? <Ionicons name={icono} size={18} color={Colors.colorazulboton} /> : null}
      <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
    </View>
    {subtitulo ? <Text style={styles.subtitulo} numberOfLines={1}>{subtitulo}</Text> : null}
  </View>
)

// Titulo de las pantallas de una mesa: "Mesa 12 Terraza" / "4 Pers."
export const HeaderMesa = ({ nroMesa, descMesa, comensales, extra }:
  { nroMesa: number, descMesa?: string, comensales: number, extra?: string }) => (
  <HeaderTitulo
    icono="restaurant-outline"
    titulo={`Mesa ${nroMesa} ${descMesa ?? ''}`.trim()}
    subtitulo={`${comensales} Pers.${extra ? ' · ' + extra : ''}`}
  />
)

// Boton redondo para cerrar / salir en headerRight
export const HeaderBotonCerrar = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.btCerrar} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name="close" size={22} color="white" />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    maxWidth: 260,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitulo: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.itemsviejos,
    marginTop: 1,
  },
  btCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: Colors.colorBackBoton,
  },
})
