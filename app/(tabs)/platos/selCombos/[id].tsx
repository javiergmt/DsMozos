// Se arman y se dan a seleccionar los Combos con sus secciones
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { mostrarDialogo } from '../../../../components/Dialogo'
import React, { useEffect, useRef, useState } from 'react'
import { HeaderMesa } from '../../../../components/HeaderTitulo'
import { useLoginStore } from '../../../store/useLoginStore'
import { comboDetType, comboPostType, comboSecType, combosGustosType, gustosType, mesaDetType, platosType } from '../../../ApiFront/Types/BDTypes'
import { getComboDet, getComboSec, getGustos, getPlato_Precio } from '../../../ApiFront/Gets/GetDatos'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Colors from '../../../../constants/Colors'
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { getFechaHoraActual, getHoraActual } from '../../../Funciones/deConversion'
import { showToast } from '../../../Funciones/deInfo'
import HojaGustos from '../../../../components/HojaGustos'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tapHandlerName } from 'react-native-gesture-handler/lib/typescript/handlers/TapGestureHandler'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";


type Gustos ={
  idSeccion: number;
  idPlato: number;
  idGusto: number;
  descGusto: string;
  cant:number;
  idPlatoRel:number;
}

const selCombos = () => {
  const {id} = useLocalSearchParams() // id es lo que recibe
  const { urlBase ,getUltItem,ultMesa,ultDetalle,mesaDet,
          setUltDetalle,setMesaDet,getUltDescTam,BaseDatos,comensales,
          ultRubro,ultRubSub,totMesa,setTotMesa} = useLoginStore()
  const [item, setItem] = useState<platosType>( getUltItem() )
  const [comboSec, setComboSec] = useState( [] as comboSecType[]) 
  const [comboDet, setComboDet] = useState( [] as comboDetType[][])  
  const [cantMax, setCantMax] = useState(0)  
  const [cantPlatos, setCantPlatos] = useState(0)  
  const [ultSeccion, setUltSeccion] = useState(0)
  const [ultPlato, setUltPlato] = useState(0)
  const [isOk, setIsOk] = useState(false)
  const [salir, setSalir] = useState(false)
  const [isGustos, setIsGustos] = useState(false)
  const [gustos, setGustos] = useState( [] as gustosType[])
  const [combosGustos, setCombosGustos] = useState( [] as Gustos[])
  const [cantGustos, setCantGustos] = useState(0)
  const [cantMaxGustos, setCantMaxGustos] = useState(0)
  const [autocompletar, setAutocompletar] = useState(false)
  const [unicoPlato, setUnicoPlato] = useState('')
  // SafeArea
  const { bottom, top, right, left } = useSafeAreaInsets();

  const handleConfirmar = async () => {
    
    const detalleGustos = (idPlato:number,idSeccion:number)  => {
      let detg = [] as combosGustosType[]
      combosGustos.forEach((g) => {      
        if (g.idPlato == idPlato && g.idSeccion == idSeccion) {
         
          detg.push({
            idSeccion: g.idSeccion, 
            idPlato: g.idPlato, 
            idGusto: g.idGusto, 
            descripcion: g.descGusto,
            idPlatoRel: g.idPlatoRel,})
        }                
      })
      //console.log('Gustos:',detg)
      return detg 
    }

    const hora = getHoraActual()
    const platopcio = await getPlato_Precio(item.idPlato, 0, ultMesa.idSector, hora, urlBase,BaseDatos)
    const detcombo = [] as comboPostType[]
    let detalle = ''  
    const fechaHora = getFechaHoraActual()   
    comboDet.forEach(async (cd) => {
        
        cd.forEach((d) => {
          let detgustos = [] as combosGustosType[]
          //console.log('Gustos',d.idPlato,detgustos,detgustos.filter( (g) => {g.idPlato == d.idPlato}))
          if (d.selected) {

            if (d.idTipoConsumo == 'CV') { 
              detgustos = detalleGustos(d.idPlato,d.idSeccion)
              //console.log('Gustos:', d.idPlato, detgustos          
            } 
           
            detcombo.push(
             
              { idSeccion: d.idSeccion,
                idPlato: d.idPlato, 
                procesado: true,
                cocinado: false,                 
                cant: d.cantidad ? d.cantidad : 1,
                idTamanio: d.idTamanio,
                tamanio: d.tamanio,
                obs: '',
                fechaHora: fechaHora,
                comanda: true,
                descripcion: d.descripcion,
                idSectorExped: d.idSectorExped, 
                impCentralizada: d.impCentralizada,              
                combosGustos: detgustos.length > 0 ? detgustos : [],    
                       
              })           
              detalle = detalle + d.descripcion + ','   
          }        
        }) // Fin del forEach        
    })
    setTotMesa(totMesa + (platopcio ? platopcio[0].pcioUnit : 0) )
    let ndet = 1
    const det:mesaDetType = { 
        nroMesa: ultMesa.nroMesa,
        idPlato: item.idPlato,
        idDetalle: ultDetalle + ndet,
        cant: 1,
        pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
        importe: (platopcio ? platopcio[0].pcioUnit : 0),
        descripcion: item.descripcion,
        obs: '',
        esEntrada: false,
        cocido: '',
        idTamanio: 0,
        descTam: getUltDescTam(),
        idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
        impCentralizada: (platopcio ? platopcio[0].impCentralizada : 0),
        gustos: [],
        combos: detcombo,
        idTipoConsumo: 'CB',
        detalles: detalle
    } 
    mesaDet.push(det)
    setMesaDet(mesaDet)

    console.log('combosGustos:',combosGustos)
    combosGustos.forEach(async (g) => {
      
      if (g.idPlatoRel > 0) {
        const platopcio = await getPlato_Precio(g.idPlatoRel, 0, ultMesa.idSector, hora, urlBase,BaseDatos)
        ndet = ndet + 1
        const det:mesaDetType = { 
          nroMesa: ultMesa.nroMesa,
          idPlato: g.idPlatoRel,
          idDetalle: ultDetalle + ndet,
          cant: 1,
          pcioUnit: (platopcio ? platopcio[0].pcioUnit : 0),
          importe: (platopcio ? platopcio[0].pcioUnit : 0),
          descripcion: g.descGusto,
          obs: '',
          esEntrada: false,
          cocido: '',
          idTamanio: 0,
          descTam: '',
          idSectorExped: (platopcio ? platopcio[0].idSectorExped : 0),
          gustos: [],  
          idTipoConsumo: 'CD',
          impCentralizada: (platopcio ? platopcio[0].impCentralizada : 0),
          detalles:''
        } 
        mesaDet.push(det)
        setMesaDet(mesaDet)
      }
    })
    
    setUltDetalle(ultDetalle+ndet+1)
    //showToast('Combo Agregado!!')
    showMessage({
      message: "Combo Agregado!!",
      description: "El Combo fue agregado a la Comanda",
      type: "success",
      duration: 3000,
    });
    setTimeout(() => setSalir(true),
    1000
    )
 
  }

  // Control de cada seccion que se selecciona
  const handleSecciones = (id:number,cmax:number,auto:boolean,descCorta:string) => {
    console.log('Seccion:',id,cmax,auto,descCorta)
    setUltSeccion(id)
    setCantMax(cmax) 
    setIsOk(true)  
    if (auto) {
      setAutocompletar(true)
      setUnicoPlato(descCorta)
      
    } else {
      setAutocompletar(false)
      setUnicoPlato('')
      
    }

  }

  // Maximo 1: seleccion simple, elegir un gusto reemplaza al anterior del mismo plato/seccion
  const handleGustoUnico = (id:number,descrip:string,idPlatoRel:number) => {
      setCombosGustos([
        ...combosGustos.filter((g) => !(g.idSeccion == ultSeccion && g.idPlato == ultPlato)),
        {idSeccion:ultSeccion,idPlato:ultPlato,idGusto:id,descGusto:descrip,cant:1,idPlatoRel:idPlatoRel}
      ])
      setCantGustos(1)
  }

  // Control de los gustos de un Plato seleccionado
  const handleGustosInc = (cantg:number,inc:number, id:number,descrip:string,idPlatoRel:number) => {
      let cant = cantGustos + inc
      let noEsta = true       
      
      combosGustos.forEach((m) => {
        if (m.idGusto == id) {
          m.cant = 1
          noEsta = false
        }
       })
      if (noEsta) {
          setCombosGustos([...combosGustos,{idSeccion:ultSeccion,idPlato:ultPlato,idGusto:id,descGusto:descrip,cant:1,idPlatoRel:idPlatoRel}])
      }
        setCantGustos(cant)
        if (cant > cantMaxGustos) {
         mostrarDialogo('Atención','No puede seleccionar más de '+cantMaxGustos.toString()+' Variedades')
      } 
        
      //console.log('MesaGustos:',mesaGustos)
  }

 
  // Control de la seleccion de platos de cada seccion
  const handlePress = (isChecked:boolean, idSeccion:number,idPlato:number,idTipoConsumo:string,cantGustos:number ) => {
    const loadGustos = async () => {
      const result = await getGustos(idPlato,urlBase,BaseDatos);
      setGustos(result); 
      setUltPlato(idPlato)   
      setCantMaxGustos(cantGustos)  
    };    
    
    comboDet.forEach((cd) => {
      const csel = cd.filter (d => d.idSeccion == idSeccion && d.selected == true).length 
      if (csel+1 > cantMax && isChecked) {
        setIsOk(false)
        mostrarDialogo('Atención','No puede seleccionar más de '+cantMax+' platos')
      } else {
        setIsOk(true)
        cd.filter (d => d.idSeccion == idSeccion).forEach((d) => {
             d.cantidad = 0
             if (d.idPlato == idPlato) {
                 d.selected = isChecked
                 d.cantidad = 1
             }
        })
        // Si es consumo variable cargo los gustos
        if (idTipoConsumo == 'CV') {
          setCantGustos(0)
          setCantMaxGustos(0)
          setIsGustos(isChecked)
          loadGustos()
        }  
      }  
    })       
  } 

   const handleSeccionPress = (cantg:number,inc:number,idSeccion:number,idPlato:number,idTipoConsumo:string,cantGustos:number ) => {
    console.log('Cantidad Plato:',cantPlatos,inc,cantMax)
    
    const loadGustos = async () => {
      const result = await getGustos(idPlato,urlBase,BaseDatos);
      setGustos(result); 
      setUltPlato(idPlato)   
      setCantMaxGustos(cantGustos)  
    };
    let cant = 0;
    comboDet.forEach((cd) => {
      
      cd.filter (d => d.idSeccion == idSeccion).forEach((d) => {
            //console.log(d)
             cant = cant + (d.cantidad ? d.cantidad : 0);
            
      })
    })

    if (cant + inc > cantMax ) {
      setIsOk(false)
      mostrarDialogo('Atención','No puede seleccionar más de '+cantMax+' platos')      
    } else {
      comboDet.forEach((cd) => {      
        cd.filter (d => d.idSeccion == idSeccion).forEach((d) => {
 
             if (d.idPlato == idPlato) {
                 d.selected = true
                 d.cantidad = cantg 
             }
             setCantPlatos(cant)
             if (idTipoConsumo == 'CV' && cantg == 1) {
                setCantGustos(0)
                setCantMaxGustos(0)
                setIsGustos(true)
                loadGustos()
              }  
        })
           })
      setIsOk(true)
    }
  } 

  const handleConfirmarGustos = () => {
    setCantGustos(0)
    setIsGustos(false)
    
  }

  useEffect(() => {
    
      const it = getUltItem()
  
      setItem(it)
      console.log('Traigo Item:',it)
      setComboDet(null)
      const load = async () => {
        const result = await getComboSec(it.idPlato,urlBase,BaseDatos);
        return result
      } 
    
      load().then((res) => {
        setComboSec(res)
        let sec = [] as comboDetType[][]
        res.map (async (s) => {
          //const seccion = await cargaSeccion(s.idSeccion,urlBase,BaseDatos,0,0,0) 
         
          const seccion = await getComboDet(s.idSeccion,urlBase,BaseDatos);
          // console.log('Carga Seccion:',seccion)
          if (seccion.length > 1) {  
            seccion.forEach((r) => {              
              r.selected = false
              r.cantidad = 0
            }) 
          } else {
            if ( s.autocompletar == true ) {
              seccion[0].selected = true 
            } else {
              seccion[0].selected = false
            }  
          }
          console.log('Seccion:',seccion)    
          sec.push(seccion)
        })
        setComboDet(sec)
      })
 
  },[] )

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
  <View style={styles.container}>
    <Stack.Screen options={{headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} />, headerTitleAlign: 'center'}} />

    {/* Encabezado */}
    <View style={styles.containerTitulo}>
       <Text style={styles.seccion}>Armar combo</Text>
       <View style={styles.tituloFila}>
         <Text style={styles.tituloText} numberOfLines={2}>{item.descripcion}</Text>
         {isOk ? (
          <TouchableOpacity style={styles.btConfirmarCombo} onPress={handleConfirmar} activeOpacity={0.7}>
            <Ionicons name="checkmark" size={22} color="white" />
            <Text style={styles.btText}>Confirmar</Text>
          </TouchableOpacity>
         ) : null }
       </View>
    </View>

    {/* Despliego las Secciones de Combos */}
    { comboSec ? (
    <View style={styles.seccionesBarra}>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.containerScrollh}>
      { comboSec.map((s) => {
         const sel = ultSeccion == s.idSeccion
         return (
         <TouchableOpacity
           key={s.idSeccion}
           disabled={isGustos}
           activeOpacity={0.7}
           onPress={() => handleSecciones(s.idSeccion,s.cantMax,s.autocompletar,s.descCorta)}
           style={[styles.card, sel ? styles.cardSel : null, isGustos ? styles.cardDeshabilitada : null]}
         >
            <Text style={[styles.heading, sel ? styles.headingSel : null]}>{s.descripcion}</Text>
            <View style={[styles.badge, sel ? styles.badgeSel : null]}>
              <Text style={styles.badgeText}>{s.cantMax}</Text>
            </View>
         </TouchableOpacity>
         )
      })}
    </ScrollView >
    </View>
    ) : null }

    {/* Despliego los Platos de la seccion*/}

      <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.containerScrollv} >

      { ultSeccion == 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="layers-outline" size={44} color={Colors.backbotones} />
          <Text style={styles.vacioText}>Seleccione una sección del combo</Text>
        </View>
      ) : null }

      {comboDet && autocompletar ? (
        <View style={styles.checkboxContainer}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.colorazulboton} />
          <Text style={styles.checkbox}>{unicoPlato}</Text>
        </View>
      ) : null }

      {/* Si la cantidad maxima es igual a 1 , uso checkbox */}
      {comboDet && !autocompletar && cantMax == 1 ? comboDet.map((cd) => (
        cd.filter (d => d.idSeccion == ultSeccion).map((d) => (

        <View style={styles.checkboxContainer} key={d.idPlato} >
          <BouncyCheckbox
            size={25}
            fillColor={Colors.colorcheckbox}
            isChecked={d.selected}
            text={d.descripcion +' '+d.tamanio}
            textStyle={styles.checkboxText}
            innerIconStyle={{ borderWidth: 2 }}
            onPress={(isChecked: boolean) => {handlePress(isChecked, d.idSeccion,d.idPlato,d.idTipoConsumo,d.cantGustos)}}
          />
        </View>
        ))
        )) : null
      }

      {/* Si la cantidad maxima es mayor a 1 debo permitir seleccionar varios platos */}
      {comboDet && !autocompletar && cantMax > 1 ? comboDet.map((cd) => (
        cd.filter (d => d.idSeccion == ultSeccion).map((d) => (
        <View style={styles.checkboxContainer} key={d.idPlato}>
            <Text style={styles.text} numberOfLines={2}>{d.descripcion +' '+d.tamanio}</Text>
            <InputSpinner
              value={d.cantidad ? d.cantidad : 0}
              editable={false}
              max={cantMax}
              skin ="clean"
              style={styles.spinner}
              color={Colors.colorcheckbox}
              onIncrease={(value) => { handleSeccionPress(value as number,1,d.idSeccion,d.idPlato,d.idTipoConsumo,d.cantGustos) }}
              onDecrease={(value) => { handleSeccionPress(value as number,-1,d.idSeccion,d.idPlato,d.idTipoConsumo,d.cantGustos) }}
            />
        </View>
        ))
      )) : null
      }

      </ScrollView>
      </View>



    <HojaGustos
      visible={isGustos}
      gustos={gustos}
      cantGustos={cantGustos}
      cantMax={cantMaxGustos}
      esSeleccionado={(id) => combosGustos.some((c) => c.idGusto == id && c.idSeccion == ultSeccion && c.idPlato == ultPlato && c.cant > 0)}
      onUnico={(g) => handleGustoUnico(g.idGusto,g.descGusto,g.idPlatoRel)}
      onInc={(valor,inc,g) => handleGustosInc(valor,inc,g.idGusto,g.descGusto,g.idPlatoRel)}
      onConfirmar={handleConfirmarGustos}
    />

    { salir ? <Redirect href={`platos/${ultRubSub}`} /> : null }

    <FlashMessage position="top" />
  </View>
  </GestureHandlerRootView>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerTitulo: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  seccion: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.itemsviejos,
  },
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  tituloText: {
    flex: 1,
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.colorazulboton,
  },
  btConfirmarCombo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.colorfondoBoton,
  },

  // --- Secciones ---
  seccionesBarra: {
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  containerScrollh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingLeft: 16,
    paddingRight: 6,
    borderRadius: 20,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1,
    borderColor: Colors.backbotones,
  },
  cardSel: {
    backgroundColor: Colors.colorcheckbox,
    borderColor: Colors.colorcheckbox,
  },
  cardDeshabilitada: {
    opacity: 0.5,
  },
  heading: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.itemsviejos,
  },
  headingSel: {
    color: 'white',
    fontWeight: 'bold',
  },
  badge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backbotones,
  },
  badgeSel: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },

  // --- Platos de la seccion ---
  containerScrollv: {
    padding: 12,
    gap: 8,
  },
  vacio: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 40,
  },
  vacioText: {
    fontSize: 16,
    color: Colors.itemsviejos,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderLeftWidth: 4,
    borderLeftColor: Colors.colorborderubro,
  },
  checkbox: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: 'white',
  },
  checkboxText: {
    fontSize: 17,
    color: 'white',
    textDecorationLine: 'none',
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
});

export default selCombos
