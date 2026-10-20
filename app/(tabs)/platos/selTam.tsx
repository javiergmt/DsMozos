import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useEffect, useState } from 'react'
import { HeaderMesa } from '../../../components/HeaderTitulo'
import { useLoginStore } from '../../store/useLoginStore'
import { platosType, modifType } from '../../ApiFront/Types/BDTypes'
import { getModif, getPlato_Precio } from '../../ApiFront/Gets/GetDatos'
import { Redirect, Stack } from 'expo-router'
import { getHoraActual } from '../../Funciones/deConversion'
import { showToast } from '../../Funciones/deInfo'
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";


const selTam = () => {
  const { urlBase ,getUltItem, getUltSector,mesaDet,mesaDetModif,ultMesa,ultDetalle,ultSector,
    setUltDetalle,setMesaDet,setUltDescTam,BaseDatos,comensales,ultRubro,ultRubSub,totMesa,setTotMesa} = useLoginStore()

  const [item, setItem] = useState<platosType>()
  const [modif, setModif] = useState( [] as modifType[])
  const [grabarTam, setGrabarTam] = useState(false) 
  const [descPlato, setDescPlato] = useState('')
  const [goGustos, setGoGustos] = useState(0)

  const handleConfirmar = (id:number,descrip:string) => {
    if (item.idTipoConsumo == "CV") {
      setGoGustos(id)
      setUltDescTam(descrip)
      return
    } else {
      const hora = getHoraActual()
      const platoprecio = getPlato_Precio(item.idPlato,id,ultMesa.idSector,hora,urlBase,BaseDatos)
        platoprecio.then((res) => {    
        setTotMesa(totMesa + (res ? res[0].pcioUnit : 0))   
        const det = { 
        nroMesa: ultMesa.nroMesa,
        idPlato: item.idPlato,
        idDetalle: ultDetalle + 1,
        cant: 1,
        pcioUnit: (res ? res[0].pcioUnit : 0) ,
        importe: (res ? res[0].pcioUnit : 0) ,
        descripcion: item.descripcion ,
        obs: '',
        esEntrada: false,
        cocido: '',
        idTamanio: id,
        descTam: descrip,
        idSectorExped: (res ? res[0].idSectorExped : 0),
        impCentralizada: (res ? res[0].impCentralizada : 0),
        gustos: [],
        idTipoConsumo: item.idTipoConsumo,
        detalles: '',
        }
        mesaDet.push(det)

        setUltDetalle(ultDetalle+1)
        setMesaDet(mesaDet)
        
        //showToast('Plato con Modif Agregado!!')
        showMessage({
              message: "Plato con Modif Agregado!!",
              description: "El Plato fue agregado a la Comanda",
              type: "success",
           
            });
            setTimeout(() => setGrabarTam(true),
            1000
            )     
      })   
    }
  }

  useEffect(() => {
    const it = getUltItem()
    const sec = getUltSector()
    setItem(it)
    console.log('Traigo Item:',it)
    setDescPlato(it.descripcion)
    
    const load = async () => {
      let result = await getModif(it.idPlato,ultSector,urlBase,BaseDatos);
      if (result.length == 0) {
        result = await getModif(it.idPlato,0,urlBase,BaseDatos);
      }
      const hora = getHoraActual()
      const conPrecios = await Promise.all(result.map(async (m) => {
        const precios = await getPlato_Precio(it.idPlato,m.idTamanio,ultMesa.idSector,hora,urlBase,BaseDatos)
        return {...m, pcioUnit: precios[0]?.pcioUnit ?? 0}
      }))
      setModif(conPrecios);
      console.log('Traigo modif:',sec, conPrecios)
    };
    load();
  
  },[] )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} />, headerTitleAlign: 'center'}} />

       {/* Encabezado */}
       <View style={styles.header}>
        <Text style={styles.seccion}>Seleccionar modificador</Text>
        <Text style={styles.tituloText} numberOfLines={2}>{descPlato}</Text>
       </View>

       {(goGustos != 0) ? <Redirect href={`/(tabs)/platos/selGustos/${goGustos}`} /> : null }

       <ScrollView contentContainerStyle={styles.lista}>
       {!grabarTam && modif.map((m) => (
          <TouchableOpacity
            key={m.idPlato.toString()+m.idTamanio.toString()}
            style={styles.modifContainer}
            onPress={() =>handleConfirmar(m.idTamanio,m.descTam)}
            activeOpacity={0.7}
          >
            <View style={styles.modifIcono}>
              <Ionicons name="resize" size={18} color="white" />
            </View>
            <Text style={styles.modif}>{m.descTam}</Text>
            <Text style={styles.precio}>${Number(m.pcioUnit ?? 0).toFixed(2)}</Text>
            <Ionicons name="chevron-forward" size={22} color={Colors.colorazulboton} />
          </TouchableOpacity>
             ))}
       </ScrollView>

       { grabarTam ? <Redirect href={`platos/${ultRubSub}`} /> : null }

      <FlashMessage position="top" />
    </SafeAreaView>
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
tituloText: {
  fontSize: 24,
  fontWeight: "bold",
  color: Colors.colorazulboton,
  marginTop: 2,
},
lista: {
  padding: 12,
  gap: 8,
},
modifContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  paddingVertical: 14,
  paddingHorizontal: 14,
  borderRadius: 14,
  backgroundColor: Colors.colorFondoCuenta,
  borderLeftWidth: 4,
  borderLeftColor: Colors.colorborderubro,
},
modifIcono: {
  width: 34,
  height: 34,
  borderRadius: 17,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: Colors.colorfondoBoton,
},
modif: {
  flex: 1,
  fontSize: 18,
  fontWeight: '500',
  color: 'white',
},
precio: {
  fontSize: 15,
  fontWeight: 'bold',
  color: Colors.colorazulboton,
},
})

export default selTam
