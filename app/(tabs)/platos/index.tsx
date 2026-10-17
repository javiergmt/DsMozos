// Se muestran los Rubros , Favoritos y Barra de Busqueda
// Aca se cargan las imagenes de los rubros

import { View, Text,  ScrollView, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native'
import { useGrilla } from '../../../constants/Dispositivo'
import React, {  useState } from 'react'
import { HeaderMesa } from '../../../components/HeaderTitulo'
import { Link, Redirect, Stack } from 'expo-router'
import { useLoginStore } from '../../store/useLoginStore'
import Colors from '../../../constants/Colors'
import { hyphenatedText, capitalize } from '../../Funciones/deConversion'
import { Ionicons } from '@expo/vector-icons';
import Imagen from '../../../assets/image';
import { EliminarMesa, LiberarMesa } from '../../ApiFront/Posts/PostDatos'

const retImagen = (iconoApp:string) => {
  const imagen = {
    'sandwich': Imagen.sandwich,
    'cafe': Imagen.cafe,
    'cerveza': Imagen.cerveza,
    'alcohol': Imagen.alcohol,
    'vino': Imagen.vino,
    'lata': Imagen.lata,
    'gaseosa': Imagen.gaseosa,
    'carne': Imagen.carne,
    'batido': Imagen.batido,
    'botellaAgua': Imagen.botellaAgua,
    'cacerola': Imagen.cacerola,
    'cerdo': Imagen.cerdo,
    'chorizo': Imagen.chorizo,
    'coctel': Imagen.coctel,
    'combo': Imagen.combo,
    'desayuno': Imagen.desayuno,
    'empanadas': Imagen.empanadas,
    'ensalada': Imagen.ensalada,
    'gallina': Imagen.gallina,
    'jugos': Imagen.jugos,
    'infusiones': Imagen.infusiones,
    'marisco': Imagen.marisco,
    'medialuna': Imagen.medialuna,
    'muffin': Imagen.muffin,
    'pan': Imagen.pan,
    'papasfritas': Imagen.papasfritas,
    'parrilla': Imagen.parrilla,
    'pescado': Imagen.pescado,
    'pizza': Imagen.pizza,
    'platosCalientes': Imagen.platosCalientes,
    'pollo': Imagen.pollo,
    'quesos': Imagen.quesos,
    'sushi': Imagen.sushi,
    'tragos': Imagen.tragos,
    'wisky': Imagen.wisky,
    'woks': Imagen.woks,
    'vinoBot': Imagen.vinoBot,
    'vaca': Imagen.vaca,
    'tortas': Imagen.tortas,
    'brunch': Imagen.brunch,
    'macaron': Imagen.macaron,
    'cubiertos': Imagen.cubiertos,

  };
  return imagen[iconoApp]
}


const index = () => {
  // Ancho de tarjeta segun el ancho actual (se recalcula al rotar)
  const anchoTile = useGrilla(105)
  //const rubros = useLoginStore( (state) => state.Rubros )
  const {ultMesa,urlBase,mozo,BaseDatos,Rubros,comensales} = useLoginStore()
  const [salir, setSalir] = useState(false)

  const [text, onChangeText] = useState('');

  const handleSalir = async () => {
    // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
    if (  ultMesa.ocupada == 'N' ) {
      const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
     } else {
      const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
     }
     setSalir(true)

  }

  const hayTexto = text.trim() !== ''

  return (
    salir ? <Redirect href='/mesas' /> :
    <View style={styles.container}>
     <Stack.Screen options={
        {headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} />,
         headerTitleAlign: 'center',
        }
        } />

    {/* Barra de busqueda */}
    <View style={styles.buscador}>
      <Ionicons name="search" size={20} color={Colors.colorborderubro} />
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        placeholder='Buscar platos'
        placeholderTextColor='grey'
        returnKeyType="search"
      />
      { hayTexto ? (
        <Link href={`platos/selPlatos/@${text}`} asChild>
          <TouchableOpacity style={styles.btBuscar} activeOpacity={0.7}>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </Link>
      ) : null }
    </View>

    {/* Acciones */}
    <View style={styles.acciones}>
      <TouchableOpacity style={styles.btCerrar} onPress={handleSalir} activeOpacity={0.7}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      <Link href={`/(tabs)/platos/0`} asChild>
        <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
          <Ionicons name="grid" size={16} color={Colors.colorborderubro} />
          <Text style={styles.chipText}>Ver Todos</Text>
        </TouchableOpacity>
      </Link>
      <Link href={`/(tabs)/platos/-1`} asChild>
        <TouchableOpacity style={styles.chip} activeOpacity={0.7}>
          <Ionicons name="heart" size={16} color={Colors.colorborderubro} />
          <Text style={styles.chipText}>Favoritos</Text>
        </TouchableOpacity>
      </Link>
    </View>

    <Text style={styles.seccion}>Rubros</Text>

    <ScrollView contentContainerStyle={styles.container_rubros}>
      {Rubros.filter( r => r.idRubro > 0).map((r) => (
        <Link key={r.idRubro} href={`/(tabs)/platos/${r.idRubro}`} asChild>
          <TouchableOpacity style={{ ...styles.tile, width: anchoTile }} activeOpacity={0.7}>
            <View style={styles.containerImage}>
              { r.iconoApp != '' ?
                  <Image style={styles.itemImage} source={retImagen(r.iconoApp)}/>
                :
                  <Text style={styles.textLetra}>{r.descripcion.charAt(0).toUpperCase()}</Text>
              }
            </View>
            <Text style={styles.text} numberOfLines={2}>{hyphenatedText(capitalize(r.descripcion))}</Text>
          </TouchableOpacity>
        </Link>
       ))}
    </ScrollView>

    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // --- Busqueda ---
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    marginHorizontal: 12,
    marginTop: 12,
    paddingLeft: 14,
    paddingRight: 5,
    gap: 8,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    height: '100%',
    paddingVertical: 0,
    color: 'white',
  },
  btBuscar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },

  // --- Acciones ---
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginTop: 12,
  },
  btCerrar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorBackBoton,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1,
    borderColor: Colors.backbotones,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  seccion: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.itemsviejos,
    marginHorizontal: 14,
    marginTop: 16,
    marginBottom: 4,
  },

  // --- Rubros ---
  container_rubros: {
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
  containerImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorborderubro,
  },
  itemImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
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

export default index
