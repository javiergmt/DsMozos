// Seleciona subrubro o va directamente a los platos del rubro
// Si hay subrubros, luego de seleccionar el mismo se muestran los platos del rubro y subrubro seleccionados

import { View, Text, TouchableOpacity, ScrollView ,StyleSheet} from 'react-native'
import { useGrilla } from '../../../constants/Dispositivo'
import React, { useEffect, useState } from 'react'
import { HeaderMesa } from '../../../components/HeaderTitulo'
import { Link, Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { useLoginStore } from '../../store/useLoginStore'
import Colors from '../../../constants/Colors'
import { capitalize, hyphenatedText } from '../../Funciones/deConversion'


const rubros = () => {
  // Ancho de tarjeta segun el ancho actual (se recalcula al rotar)
  const anchoTile = useGrilla(105)
  const {id} = useLocalSearchParams()
  const { Rubros, ultMesa ,mozo, comensales,setUltRubSub} = useLoginStore()
  const [rubrosfilt, setRubrosFilt] = useState<any[]>([])
  const [subrubros, setSubrubros] = useState<any[]>([])
  const [idRubro, setIdRubro] = useState(99999)
  const [descRubro, setDescRubro] = useState('')
  console.log('Rubro id:',id)

  useEffect(() => {
    if ( id.length > 0) {
       const rubrosfilt = Rubros.filter((r) => r.idRubro.toString() == id)
       setRubrosFilt(rubrosfilt)
       if (rubrosfilt.length > 0) {
        const subrubros = rubrosfilt[0].subrubros
        setSubrubros(subrubros)
        setIdRubro( rubrosfilt[0].idRubro)
        setDescRubro(capitalize(rubrosfilt[0].descripcion))
        setUltRubSub(Array.isArray(id) ? id[0] : id)
       }
    }
  }, [id]);

  return (
    <View style={styles.container}>

      <Stack.Screen options={{headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} />, headerTitleAlign: 'center'}} />

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.seccion}>Subrubros</Text>
        <Text style={styles.titulo} numberOfLines={1}>{descRubro}</Text>
      </View>

      { subrubros.length > 0 ? (
        <ScrollView contentContainerStyle={styles.container_sub}>
        {subrubros.map((r) => (
          <Link key={r.idSubRubro} href={`/(tabs)/platos/${idRubro.toString()+'-'+r.idSubRubro.toString()}`} asChild>
            <TouchableOpacity style={{ ...styles.tile, width: anchoTile }} activeOpacity={0.7}>
              <View style={styles.card}>
                <Text style={styles.textLetra}>{r.descripcion.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.text} numberOfLines={2}>{hyphenatedText(capitalize(r.descripcion))}</Text>
            </TouchableOpacity>
          </Link>
          ))}
        </ScrollView>
      ) : null }

      { subrubros.length == 0 ? <Redirect href={`platos/selPlatos/${id}`} /> : null }

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  seccion: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.itemsviejos,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.colorazulboton,
    marginTop: 2,
  },
  container_sub: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    padding: 12,
    gap: 10,
  },
  tile: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorborderubro,
  },
  textLetra: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  text: {
    marginTop: 8,
    minHeight: 32,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
    textAlign: 'center',
    color: 'white',
  },
})

export default rubros
