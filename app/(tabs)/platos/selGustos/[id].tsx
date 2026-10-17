// Para platos de consumo variable, permite seleccionar los gustos del plato.
// Recibe un parametro id que es el id del modificador seleccionado o 0.
// Es para los casos que un plato de tipo CV tenga modificadores

import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { HeaderMesa } from '../../../../components/HeaderTitulo'
import { useLoginStore } from '../../../store/useLoginStore'
import { getGustos, getPlato_Precio } from '../../../ApiFront/Gets/GetDatos'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { gustosDet, gustosType, mesaDetType, platosType } from '../../../ApiFront/Types/BDTypes'
import { getHoraActual } from '../../../Funciones/deConversion'
import Colors from '../../../../constants/Colors'
import InputSpinner from "react-native-input-spinner";
import FlashMessage from "react-native-flash-message";
import { showMessage } from "react-native-flash-message";



type Gustos ={
  idGusto: number;
  descGusto: string;
  cant:number;
  idPlatoRel:number;
}

const selGustos = () => {
  const {id} = useLocalSearchParams() // id es lo que recibe
  const idTam = Number(id)
  const { urlBase ,getUltItem,setMesaDet,setUltDetalle,getUltDescTam,setUltDescTam,getUltRubro,
          mesaDet,ultMesa,ultDetalle,mozo,BaseDatos,comensales,ultRubSub,totMesa,setTotMesa} = useLoginStore()
  const [item, setItem] = useState<platosType>( getUltItem() )
  const [gustos, setGustos] = useState( [] as gustosType[])
  const [cantGustos, setCantGustos] = useState(0)
  const [cantMaxGustos, setCantMaxGustos] = useState(0)
  const [grabarGustos, setGrabarGustos] = useState(false)
  const [mesaGustos, setMesaGustos] = useState( [] as Gustos[]) 
  const [rubrosub, setRubroSub] = useState("")
  console.log('UltRubroenGustos:',rubrosub)

  const handleGustosInc = (cantg:number,inc:number, id:number,descrip:string,idPlatoRel:number) => {
    let cant = cantGustos + inc
    let noEsta = true       
    mesaGustos.forEach((m) => {
        if (m.idGusto == id) {
          m.cant = cantg
          noEsta = false
        }
    })
    if (noEsta) {
      setMesaGustos([...mesaGustos,{idGusto:id,descGusto:descrip,cant:cantg,idPlatoRel:idPlatoRel}])
    }
      setCantGustos(cant)
      if (cant > cantMaxGustos) {
       //Alert.alert('Atención','No puede seleccionar más de '+cantMaxGustos.toString()+' Variedades')
       showMessage({
              message: "ATENCION !!",
              description: "No puede seleccionar más de "+cantMaxGustos.toString()+" Variedades",
              type: "danger",
              });
    } 
      
    //console.log('MesaGustos:',mesaGustos)
  }

 const handleConfirmar = async () => {
    //console.log('MesaGustos:',mesaGustos)
    const hora = getHoraActual()
    let nDet = 1;
    const platopcio = await getPlato_Precio(item.idPlato, idTam, ultMesa.idSector, hora, urlBase,BaseDatos)
      const detgus = [] as gustosDet[]
      let detalle = ''
      mesaGustos.forEach((m) => {
        if (m.cant > 0) {
          detgus.push({ idGusto: m.idGusto, descripcion: m.cant > 1 ? '('+m.cant+')'+m.descGusto : m.descGusto,idPlatoRel: m.idPlatoRel })
          detalle = detalle + m.descGusto + ','
        }
      })

      //console.log('Gustos:',detgus)
      setTotMesa(totMesa + (platopcio ? platopcio[0].pcioUnit : 0) )
      const det:mesaDetType = { 
      nroMesa: ultMesa.nroMesa,
      idPlato: item.idPlato,
      idDetalle: ultDetalle + nDet,
      cant: 1,
      pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
      importe: (platopcio ? platopcio[0].pcioUnit : 0),
      descripcion: item.descripcion,
      obs: '',
      esEntrada: false,
      cocido: '',
      idTamanio: idTam,
      descTam: getUltDescTam(),
      idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
      gustos: detgus,  
      idTipoConsumo: item.idTipoConsumo,
      impCentralizada:  (platopcio ? platopcio[0].idSectorExped : 0),
      detalles: detalle
      } 
      //console.log('Detalle:',det)
      nDet = nDet + 1;
    
      mesaDet.push(det)
      setMesaDet(mesaDet) 
     
      // Recorro los gustos y si hay platos relacionados los agrego a mesaDet
      mesaGustos.forEach(async (m) =>  {
      if ( (m.cant > 0) && (m.idPlatoRel > 0) ) {
      
        const platopcio = await getPlato_Precio(m.idPlatoRel, 0, ultMesa.idSector, hora, urlBase,BaseDatos)

          //console.log('Plato Rel:',platopcio)
          
          const det:mesaDetType = { 
            nroMesa: ultMesa.nroMesa,
            idPlato: m.idPlatoRel,
            idDetalle: ultDetalle + nDet,
            cant: 1,
            pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
            importe: (platopcio ? platopcio[0].pcioUnit : 0),
            descripcion: m.descGusto,
            obs: '',
            esEntrada: false,
            cocido: '',
            idTamanio: 0,
            descTam: '',
            idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
            gustos: [],  
            idTipoConsumo: 'CD',
            impCentralizada:  (platopcio ? platopcio[0].idSectorExped : 0),
            detalles: ''
            } 
            //console.log('det2',det)

            mesaDet.push(det)
            setMesaDet(mesaDet) 
            nDet = nDet + 1;
            //console.log('Mesadet c/extra',mesaDet)
          
      }
      })  
    
      showMessage({
        message: "Plato con gustos Agregado!!",
        description: "El Plato fue agregado a la Comanda",
        type: "success",
   
      });
    setUltDetalle(ultDetalle+nDet+1)
    setRubroSub(ultRubSub)
    setUltDescTam('')
    setTimeout(() => setGrabarGustos(true),
      1000
    )
    
    //showToast('Plato con gustos Agregado!!')
  
  }

  useEffect(() => {
    const it = getUltItem()
    setItem(it)
    console.log('Traigo Item:',it)
    setCantMaxGustos(it.cantgustos)
    const load = async () => {
      const result = await getGustos(it.idPlato,urlBase,BaseDatos);
      if (result.length > 9) {
        setGustos([...result,{idGusto:0,descGusto:'Seleccione',idPlato:0,idPlatoRel:0}]);
      } else {
        setGustos(result);
      }
    };
    load();
   
  },[item] )
 
  const seleccionOk = cantGustos > 0 && cantGustos <= cantMaxGustos
  const excedido = cantGustos > cantMaxGustos

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
     <Stack.Screen options={{headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} />, headerTitleAlign: 'center'}} />

       {/* Encabezado */}
       <View style={styles.header}>
        <Text style={styles.seccion}>Seleccionar variedades</Text>
        <Text style={styles.tituloText} numberOfLines={2}>{item.descripcion}</Text>
       </View>

       {/* Estado de la seleccion + Confirmar */}
       <View style={styles.barra}>
         <View style={[styles.contador, excedido ? styles.contadorError : null]}>
           <Text style={styles.contadorText}>{cantGustos} / {item.cantgustos}</Text>
         </View>
         { !grabarGustos && seleccionOk ? (
          <TouchableOpacity style={styles.btConfirmar} onPress={handleConfirmar} activeOpacity={0.7}>
            <Ionicons name="checkmark" size={22} color="white" />
            <Text style={styles.valText}>Confirmar selección</Text>
          </TouchableOpacity>
          ) : (
          <View style={[styles.btConfirmar, styles.btDeshabilitado]}>
            <Text style={styles.valText}>{excedido ? 'Máximo superado' : `Seleccionar - Máx: ${item.cantgustos}`}</Text>
          </View>
          )}
       </View>

       <ScrollView contentContainerStyle={styles.lista}>

          { !grabarGustos && gustos.map((g) => (
          <View style={styles.checkboxContainer} key={g.idGusto}>
              <Text style={styles.text} numberOfLines={2}>{g.descGusto}</Text>
              <InputSpinner
                value={0}
                style={styles.spinner}
                color={Colors.colorcheckbox}
                skin ="clean"
                onIncrease={(value) => { handleGustosInc(value as number,1,g.idGusto,g.descGusto,g.idPlatoRel)
                }}
                onDecrease={(value) => { handleGustosInc(value as number,-1,g.idGusto,g.descGusto,g.idPlatoRel)
                }}
              />
          </View>
         ))}

          { grabarGustos ? <Redirect href={`platos/${ultRubSub}`} /> : null }
        </ScrollView>

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
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
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
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  btDeshabilitado: {
    opacity: 0.45,
  },
  valText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#ffffff",
  },
  lista: {
    padding: 12,
    gap: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderLeftWidth: 4,
    borderLeftColor: Colors.colorborderubro,
  },
	text: {
		flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: 'white',
	},
	spinner: {
		width: 140,
    backgroundColor: 'white',
    borderRadius: 10,
	},
})

export default selGustos
