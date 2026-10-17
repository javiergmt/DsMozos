import { View, Text, Button, ScrollView, TouchableOpacity,StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { HeaderMesa, HeaderBotonCerrar } from '../../components/HeaderTitulo'
import { Redirect, Stack } from 'expo-router'
import { useLoginStore } from '../store/useLoginStore'
import { getComboDet, getComboSec, getGustos, getInfoComboSec, getInfoGustos, getMesaDet,getPlato_Precio,getPlatos } from '../ApiFront/Gets/GetDatos'
import { mesaDetType,mesaDetPost,platosType, comboSecType, comboDetType,comanda, 
  comboInfoSecType, gustosType, combosGustosType, comboPostType, 
  comandaPlatos,
  comandaGustos} from '../ApiFront/Types/BDTypes'
import Colors from '../../constants/Colors'
import { EliminarMesa, LiberarMesa, AgregarDetalleMulti, CerrarMesa, BorrarRenglon, Comandar, AgregarDetalleMulti_Noimp } from '../ApiFront/Posts/PostDatos'
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { capitalize, getHoraActual } from '../Funciones/deConversion'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { sheetTheme } from '../../constants/SheetTheme'
import InputSpinner from 'react-native-input-spinner'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { encolarYEnviar } from '../../servicios/colaComandas'
import { showToast } from '../Funciones/deInfo'


type Gustos ={
  idSeccion: number;
  idPlato: number;
  idGusto: number;
  descGusto: string;
  cant:number;
  idPlatoRel:number;
}

const cuenta = () => {
  const {mozo,ultMesa,ultDetalle,setUltDetalle,getParam,
    mesaDet,mesaDetGustos,mesaDetModif,urlBase,
    setMesaDet,origDetalle,setOrigDetalle,setUltItem,getUltItem,
    getBaseDatos,BaseDatos, comensales,totMesa,getTotMesa,setTotMesa} = useLoginStore()
  const [cuenta, setCuenta] = useState<mesaDetType[]>([])
  const [verAnt, setVerAnt] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [origDet, setOrigDet] = useState(0)
  const [comandar, setComandar] = useState(false)
  const [itemSel, setItemSel] = useState(0) 
  const [info, setInfo] = useState(false)
  const [text, onChangeText] = useState('')
  const [descSel, setDescSel] = useState('')
  const [esEntSel, setEsEntSel] = useState(false)
  const [salir, setSalir] = useState(false)
  const Param = getParam()
  const [refreshing,setRefreshing] =useState(false)
  const [selectCombo, setSelectCombo] = useState(false)
  const [idDetalle, setIdDetalle] = useState(0)
  // Modif de Combos
  const [item, setItem] = useState<platosType>( getUltItem() )
  const [comboSec, setComboSec] = useState( [] as comboSecType[]) 
  const [comboDet, setComboDet] = useState( [] as comboDetType[][])  
  
  const [cantMax, setCantMax] = useState(0)  
  const [ultSeccion, setUltSeccion] = useState(0)
  const [ultPlato, setUltPlato] = useState(0)
  const [isOk, setIsOk] = useState(false)
  const [autocompletar, setAutocompletar] = useState(false)
  const [unicoPlato, setUnicoPlato] = useState('')
  const [isGustos, setIsGustos] = useState(false)
  const [gustos, setGustos] = useState( [] as gustosType[])
  const [combosGustos, setCombosGustos] = useState( [] as Gustos[])
  const [comandaPlatos, setComandaPlatos] = useState( [] as comandaPlatos[])
  const [cantGustos, setCantGustos] = useState(0)
  const [cantMaxGustos, setCantMaxGustos] = useState(0)
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['80%', '80%'];
  /*
  const [fondo, setFondo] = useState(false)

  const cambiaFondo = () => {
    setFondo(!fondo)
    return fondo
  }  
  */

  // Trae los datos de En_NesaDet
  const traerCuenta = async (url: string, base: string): Promise<mesaDetType[]> => {
    const { cuenta, isError, isPending } = await getMesaDet(ultMesa.nroMesa,url,base)
    return cuenta
  }

  // Cuando se selecciona un item de la cuenta para poner una observacion
  // Antes se carga la observacion que tenia el item
  const handleinfotext = () => { 
    mesaDet.forEach((m) =>{
      if(m.idDetalle == itemSel){
        m.obs = text
        m.esEntrada = esEntSel
      }})
    setInfo(false)
    onChangeText('')
  }

  const handleInfo = () => {  
    if (itemSel != 0) {
      mesaDet.forEach((m) =>{
        if(m.idDetalle == itemSel){
          setDescSel(m.descripcion)
          setEsEntSel(m.esEntrada)
          onChangeText(m.obs) 
        }})
     setInfo(true)
    }  
  }

  // Cierra la mesa e imprime la cuenta
  const handleCerrar = async () => {  
    const res = await CerrarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
    setSalir(true)
    return
  }

  // Comandar la mesa
  const handleComandar = async (ok:boolean) => {
   if (!ok) {
      // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
      if (  ultMesa.ocupada == 'N' ) {
       const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
      } else {
       const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
       
    }
      // No grabo nada y vuelvo a mesas
      
      setComandar(true)
      return
    }

    // La mesa se libera (o elimina) al final, en la cola de comandas, despues de grabar e imprimir:
    // asi nadie la toma mientras la comanda esta pendiente por un corte de conexion.
    
    
    // Grabo la mesa y vuelvo a mesas
    const mDet = mesaDet.filter((m) => m.idDetalle > origDetalle )
    const detalle =[] as mesaDetPost[]
    const comandaGustos = [] as comandaGustos[]
    mDet.forEach((m) => {
        console.log('Comanda:',m)
        const det ={ 
          nroMesa: ultMesa.nroMesa,
          descMesa: ultMesa.descMesa,
          idDetalle: m.idDetalle,          
          idPlato: m.idPlato,
          idTipoConsumo: m.idTipoConsumo,
          cant: m.cant,
          pcioUnit: m.pcioUnit,
          importe: m.importe,
          obs: m.obs,
          idTamanio: m.idTamanio,
          tamanio: m.descTam,
          procesado: true,
          hora: getHoraActual(),
          idMozo: mozo.idMozo,
          nombreMozo: mozo.nombre,
          idUsuario: 0,
          cocinado: true,
          esEntrada: m.esEntrada,
          descripcion: m.descripcion,
          fechaHora: new Date().toISOString(),
          comanda: true, // Siempre es true, para que no se imprima
          idSectorExped: m.idSectorExped,
          impCentralizada: m.impCentralizada,
          gustos: m.idTipoConsumo == 'CV' ? m.gustos : [],
          combos: m.combos,
        }
        
        detalle.push(det)
        if ( (m.idTipoConsumo != 'CB') ) {
          let comandaGustos = [] as comandaGustos[]
          m.gustos.forEach((g) => {
            comandaGustos.push(
              {descripcion : g.descripcion}
            )
          })

          // Agrego los platos a la comanda
          comandaPlatos.push(
          {                            
            cant: m.cant,
            idTipoConsumo: m.idTipoConsumo,
            tamanio: m.descTam,
            obs: m.obs,
            descripcion: m.descripcion,
            idSectorExped: m.idSectorExped, 
            impCentralizada: m.impCentralizada,    
            esEntrada: m.esEntrada,          
            gustos: comandaGustos.length > 0 ? comandaGustos : []                
          })
        } else {
          // Agrego los platos de la seccion de combos a la comanda
          m.combos.forEach((c) => {
            
            let comandaGustos = [] as comandaGustos[]
            c.combosGustos.forEach((g) => {
              if (g.idPlato == c.idPlato) {
              comandaGustos.push(
                {descripcion : g.descripcion}
              )
              }
            })
           
            comandaPlatos.push(
              {                            
                cant: c.cant,
                idTipoConsumo: 'CB',
                tamanio: c.tamanio,
                obs: c.obs,
                descripcion: c.descripcion,
                idSectorExped: c.idSectorExped, 
                impCentralizada: c.impCentralizada,    
                esEntrada: false,          
                gustos: comandaGustos.length > 0 ? comandaGustos : []                
              }) 
             
          })
        }
          
      })

      // Envio por la cola de comandas (servicios/colaComandas.ts): se guarda en el telefono antes
      // de mandar y va por pasos (grabar, imprimir, liberar/eliminar la mesa) con un Id-Comanda,
      // asi un reintento no graba ni imprime dos veces. Si no hay conexion queda pendiente y se
      // envia sola cuando vuelve; la mesa queda tomada hasta entonces.
      const comandaImprimir: comanda | null = comandaPlatos.length > 0
        ? { nroMesa: ultMesa.nroMesa,
            descMesa: ultMesa.descMesa,
            idMozo: mozo.idMozo,
            nombreMozo: mozo.nombre,
            comensales: ultMesa.cantPersonas > 0 ? ultMesa.cantPersonas : comensales,
            fechaHora: new Date().toISOString(),
            platos: [...comandaPlatos] }
        : null
      // Desbloquear la mesa o eliminarla si no tiene detalle (mismo criterio que antes)
      const alFinal = ( ( origDetalle == ultDetalle) && ultDetalle == 0 && ultMesa.ocupada == 'N' ) ? 'eliminar' : 'liberar'
      // comandaPlatos se acumula con push: se vacia para que un reintento no duplique los platos
      comandaPlatos.splice(0, comandaPlatos.length)

      const resultado = await encolarYEnviar({ url: urlBase, base: BaseDatos, nroMesa: ultMesa.nroMesa,
                                               descMesa: ultMesa.descMesa, nombreMozo: mozo.nombre,
                                               detalle, comanda: comandaImprimir, alFinal })
      if (typeof resultado == 'object') {
        // Error de la API (no de red): no se grabo nada; el mozo sigue en la cuenta para reintentar
        Alert.alert('No se pudo grabar la comanda', `${resultado.error}\n\nRevisá la cuenta y volvé a comandar.`)
        return
      }
      if (resultado == 'pendiente') {
        Alert.alert('Sin conexión', `La comanda de la mesa ${ultMesa.nroMesa} quedó guardada en el teléfono y se va a enviar sola cuando vuelva la conexión. La mesa queda tomada hasta entonces.`)
      } else {
        showToast('Comanda enviada')
      }

      mesaDet.splice(0,mesaDet.length)
      mesaDetGustos.splice(0,mesaDetGustos.length)
      mesaDetModif.splice(0,mesaDetModif.length) 
  
      setComandar(true)  
      /*
      showMessage({
        message: "Plato con Modif Agregado!!",
        description: "El Plato fue agregado a la Comanda",
        type: "success",
     
      });
      setTimeout(() => setComandar(true),
      1000
      ) 
      */  
  }  

  const handleVerAnt = () => {  
    setVerAnt(!verAnt)
  }

  const handleSelec = async (c:mesaDetType) => {
    if (!info) {
      setItemSel(c.idDetalle) 
    }
    // Si selecciono un combo que ya fue comandado, se permite modificarlo
    // Si el combo no fue comandado se elimina
    if ( (c.idTipoConsumo == "CB") && (c.idDetalle > origDetalle) ) {
      const mDet = mesaDet.filter((m) => m.idDetalle != c.idDetalle)
      setMesaDet(mDet)
      setCuenta(mDet)
      return
    }
    if ( (c.idTipoConsumo == "CB") && (c.idDetalle <= origDetalle) ) {
      const plato = await getPlatos('C',c.idPlato.toString(),'0','0','0',urlBase,BaseDatos)
    
      setUltItem(plato[0])
      setIdDetalle(c.idDetalle)
      const it = plato[0]
       
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
            
            const infoSecc = await getInfoComboSec(ultMesa.nroMesa,c.idDetalle,0,urlBase,BaseDatos)
            const seccion = await getComboDet(s.idSeccion,urlBase,BaseDatos);
            // console.log('Carga Seccion:',seccion)
            if (seccion.length > 0) {  
                seccion.forEach((r) => {
                  r.selected = false
                  infoSecc.forEach((i) => {
                      if (i.idSeccion == r.idSeccion && i.idPlato == r.idPlato) {
                        r.selected = true
                        r.comandado = false
                      }
                  })
                }) 
            }
            sec.push(seccion)
          })
          
          setIdDetalle(c.idDetalle)
          setComboDet(sec)
        
      })
      setSelectCombo(true) 
    }  
    return
  }

  const handleBorrar = () => {
    // Borrar el item seleccionado
    if (itemSel != 0) {
      const mDet = mesaDet.filter((m) => m.idDetalle != itemSel)
      setMesaDet(mDet)
      setCuenta(mDet)
    }
  }

  const handleSalir = async () => {
    // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
    if (  ultMesa.ocupada == 'N' ) {
      const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
     } else {
      const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
     }
     setSalir(true)
  }   

  const handleCantidad = (cant:number) => {
    // Cambiar la cantidad del item seleccionado
    if (itemSel != 0) {
    mesaDet.forEach((m) =>{
       if(m.idDetalle == itemSel){
          if (m.cant + cant <= 0) {
              m.cant = 0
              m.importe = 0
              const mDet = mesaDet.filter((m) => m.idDetalle != itemSel)
              setMesaDet(mDet)
              setCuenta(mDet)
              return
          } else {    
              m.cant = m.cant + cant
              m.importe = m.cant * m.pcioUnit
              setTotMesa(totMesa + (m.cant * m.pcioUnit))
              setMesaDet(mesaDet)
              setCuenta(mesaDet)
              return
          }          
       }
    })
    
    }
  
  }

  // -------------------------------------------------------------------------------------
  // Modif. Combos
  const handleSecciones = async (id:number,cmax:number,auto:boolean,descCorta:string) => {
    // Seleccionar la seccion de combos
    console.log('Seccion:',id,cmax,auto,descCorta)
    setUltSeccion(id)
    setCantMax(cmax)   
    if (auto) {
      setAutocompletar(true)
      setUnicoPlato(descCorta)
      setIsOk(true)
    } else {
      setAutocompletar(false)
      setUnicoPlato('')
      setIsOk(false)
    }
    return
  }   

  const handlePress = (isChecked:boolean, idSeccion:number,idPlato:number,idTipoConsumo:string,cantGustos:number ) => {
      const loadGustos = async () => {
        const result = await getGustos(idPlato,urlBase,BaseDatos);
        setGustos(result); 
        setUltPlato(idPlato)   
        setCantMaxGustos(cantGustos)  
      };    
      
      comboDet.forEach((cd) => {
        const csel = cd.filter (d => d.idSeccion == idSeccion && d.selected == true).length 
       
          setIsOk(true)
          cd.filter (d => d.idSeccion == idSeccion).forEach((d) => {
               if (d.idPlato == idPlato) {
                   d.selected = isChecked
                   d.comandado = true
               }
          })
          
          if (csel+1 > cantMax && isChecked) {
            setIsOk(false)
            Alert.alert('Atención','No puede seleccionar más de '+cantMax+' platos')
            
          } else {
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
           Alert.alert('Atención','No puede seleccionar más de '+cantMaxGustos.toString()+' Variedades')
        } 
          
        //console.log('MesaGustos:',mesaGustos)
  }
  
    const handleBottomSheet = () => { 
      //console.log('Comensales Grabados:',res)
      if (cantGustos == 0 ) {
        sheetRef.current?.expand()
      }
  }
  
  const handleConfirmarGustos = () => {
      sheetRef.current?.close()
      setCantGustos(0)
      setIsGustos(false)
      
  }  

  const handleModifCombo = async () => {
    // Grabo la mesa y vuelvo a mesas
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
      console.log('Gustos:',detg)
      return detg 
    }
    const hora = getHoraActual()
    // const platopcio = await getPlato_Precio(item.idPlato, 0, ultMesa.idSector, hora, urlBase,BaseDatos)
    const detcombo = [] as comboPostType[]
   
    comboDet.forEach(async (cd) => {
            let detgustos = [] as combosGustosType[]
            let comandaGustos = [] as comandaGustos[]
            cd.forEach((d) => {
              //console.log('Gustos',d.idPlato,detgustos,detgustos.filter( (g) => {g.idPlato == d.idPlato}))
              
              if (d.selected) {
                
                if (d.idTipoConsumo == 'CV') { 
                  detgustos = detalleGustos(d.idPlato,d.idSeccion)
                  detgustos.forEach((g) => {
                    comandaGustos.push(
                      {descripcion : g.descripcion}
                    )
                  })
                  //console.log('Gustos:', d.idPlato, detgustos          
                } 
               
                detcombo.push(
                  { idSeccion: d.idSeccion,
                    idPlato: d.idPlato, 
                    procesado: true,
                    cocinado: false,                 
                    cant: 1,
                    idTamanio: d.idTamanio,
                    tamanio: d.tamanio,
                    obs: '',
                    fechaHora: new Date().toISOString(),
                    comanda: true,
                    descripcion: d.descripcion,
                    idSectorExped: d.idSectorExped, 
                    impCentralizada: d.impCentralizada,              
                    combosGustos: detgustos.length > 0 ? detgustos : []                
                  })   
                  detgustos = [] // Reinicio los gustos para la proxima iteracion
                  if (d.comandado) {  
                  comandaPlatos.push(
                    {                  
                      cant: 1,
                      idTipoConsumo: 'CB',
                      tamanio: d.tamanio,
                      obs: '',
                      descripcion: d.descripcion,
                      idSectorExped: d.idSectorExped, 
                      impCentralizada: d.impCentralizada,    
                      esEntrada: false,          
                      gustos: comandaGustos.length > 0 ? comandaGustos : []                
                    })           
                  }
              }        
            })        
    }) // Fin del forEach
    
    console.log('Detalle Combo:',detcombo)
    const mDet = mesaDet.filter((m) => m.idDetalle == idDetalle)
    //mesaDet[idDetalle].detalles = 'Modif. Combo'
    //console.log('Detalle:',mDet)
    const detalle =[] as mesaDetPost[]
    //mDet.forEach((m) => {
    const det:mesaDetPost ={ 
          nroMesa: ultMesa.nroMesa,
          descMesa: ultMesa.descMesa,
          idDetalle: idDetalle,          
          idPlato: mDet[0].idPlato,
          idTipoConsumo: mDet[0].idTipoConsumo,
          cant: mDet[0].cant,
          pcioUnit: mDet[0].pcioUnit,
          importe: mDet[0].importe,
          obs: "",
          idTamanio: 1,
          tamanio: "",
          procesado: true,
          hora: getHoraActual(),
          idMozo: mozo.idMozo,
          nombreMozo: mozo.nombre,
          idUsuario: 0,
          cocinado: true,
          esEntrada: false,
          descripcion: mDet[0].descripcion,
          fechaHora: new Date().toISOString(),
          comanda: true,
          idSectorExped: 0,
          impCentralizada: 0,
          gustos: [],
          combos: detcombo.length > 0 ? detcombo : [],
         
    }
    detalle.push(det)
    //console.log('Detalle:',detalle[0])
    const res2 = await BorrarRenglon(ultMesa.nroMesa,idDetalle,1,"CB",urlBase,BaseDatos)
    const res1 = await AgregarDetalleMulti_Noimp(detalle,urlBase,BaseDatos)    

    setSelectCombo(false)
   
  } 
   
  useEffect(() => {
    
    if (mesaDet.length == 0) {
      // Es la primera vez que se carga la cuenta
      console.log('Cuenta mesaDet',mesaDet)
      // Traigo la cuenta de la mesa de En_mesadet ( puede ser vacia )
      const cuenta = traerCuenta(urlBase,BaseDatos)
      let total = 0
      cuenta.then((res) => {
        const result = res.length > 0 ? res[res.length-1].idDetalle : 0
        res.forEach((m) => {
          total += m.importe
        })
        setTotMesa(total)

        setMesaDet(res)
        setCuenta(res)       
        setUltDetalle(result)
        setOrigDetalle(result)
        setOrigDet(result)
      })  
 
    } else {
      // Ya se cargo la cuenta
      console.log('Cuenta cargada',mesaDet)
      // Recorro la cuenta y si hay Combos, vuelvo a generar el detalle
        let total = 0
        mesaDet.forEach(async (m) => {
        total += m.importe
        //if (m.idTipoConsumo == 'CB') {
           let det = ''
           const infocb = await getInfoComboSec(ultMesa.nroMesa,m.idDetalle,0,urlBase,BaseDatos)
           if (infocb.length > 0) {
            infocb.forEach((i) => {
              det = det + i.descripcion + ','   
            })  
            m.detalles = det
        //}
          
          
        }
      })
      setTotMesa(total)
      setCuenta(mesaDet)
      console.log('cuenta:',cuenta)
      console.log('total:',total)
    }
   
    //console.log('orig ',origDet)
    
  }, [mesaDet,selectCombo]);

  // Formatea la cantidad: entera sin decimales, fraccionaria con 2
  const fmtCant = (cant:number) => (cant % 1 === 0 ? cant.toString() : cant.toFixed(2))

  const comandados = cuenta.filter((c) => c.idDetalle <= origDet)
  const nuevos = cuenta.filter((c) => c.idDetalle > origDet)
  const haySel = itemSel != 0

  // Renglon de un plato nuevo (todavia no comandado)
  const renglonNuevo = (c:mesaDetType) => {
    const esCombo = c.idTipoConsumo == "CB"
    const sel = !esCombo && c.idDetalle == itemSel
    return (
      <TouchableOpacity
        key={c.idDetalle}
        style={[styles.itemContainer, styles.itemNuevo, sel ? styles.itemSel : null]}
        onPress={()=>handleSelec(c)}
        activeOpacity={0.7}
      >
        {esCombo ? (
          <Ionicons name="trash-outline" size={22} color={Colors.colornjaboton} />
        ) : (
          <Ionicons name={sel ? 'radio-button-on' : 'radio-button-off'} size={22} color={Colors.colorcheckbox} />
        )}
        <View style={styles.cantPill}>
          <Text style={styles.cantText}>{fmtCant(c.cant)}</Text>
        </View>
        <View style={styles.itemTextos}>
          <Text style={styles.item} numberOfLines={2}>
            {capitalize(esCombo ? c.descripcion : c.descripcion+' '+c.descTam)}
          </Text>
          { c.detalles && verAnt ? <Text style={styles.itemDet}>{capitalize(c.detalles)}</Text> : null }
          { c.obs ? <Text style={styles.itemObs}>“{c.obs}”</Text> : null }
          { c.esEntrada ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Entrada</Text>
            </View>
          ) : null }
        </View>
      </TouchableOpacity>
    )
  }

  // Renglon de un plato ya comandado
  const renglonComandado = (c:mesaDetType) => {
    const esCombo = c.idTipoConsumo == "CB"
    const contenido = (
      <>
        <Ionicons
          name={esCombo ? 'create-outline' : 'checkmark-done'}
          size={20}
          color={esCombo ? Colors.colorcheckbox : Colors.itemsviejos}
        />
        <View style={[styles.cantPill, styles.cantPillOrig]}>
          <Text style={styles.cantText}>{fmtCant(c.cant)}</Text>
        </View>
        <View style={styles.itemTextos}>
          <Text style={styles.itemorig} numberOfLines={2}>
            {esCombo ? capitalize(c.descripcion)+" ("+c.idDetalle+")" : capitalize(c.descripcion)}
          </Text>
          { c.detalles ? <Text style={styles.itemDet}>{capitalize(c.detalles)}</Text> : null }
        </View>
      </>
    )
    // Los combos comandados se pueden modificar
    return esCombo ? (
      <TouchableOpacity key={c.idDetalle} style={styles.itemContainer} onPress={()=>handleSelec(c)} activeOpacity={0.7}>
        {contenido}
      </TouchableOpacity>
    ) : (
      <View key={c.idDetalle} style={styles.itemContainer}>{contenido}</View>
    )
  }

  // Boton de la barra de herramientas
  const BotonPie = ({icono, label, onPress, color = 'white', deshabilitado = false}) => (
    <TouchableOpacity
      style={[styles.pieBoton, deshabilitado ? styles.pieBotonDeshab : null]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icono} size={24} color={color} />
      <Text style={styles.pieLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  )

  return (
   <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>

     <Stack.Screen options={{
                              headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} extra={`$${totMesa.toFixed(2)}`} />,
                              headerTitleAlign: 'center',
                              headerStyle: {
                                backgroundColor: Colors.background,
                              },
                              headerTintColor: '#fff',
                              headerTitleStyle: {
                                  fontWeight: 'bold',
                              },
                              headerRight:() => <HeaderBotonCerrar onPress={() => handleSalir()} />
                              }}
                              />

        { salir ? <Redirect href="/mesas" /> : null }

        {/* Encabezado / Resumen */}
        {!selectCombo ? (
        <View style={styles.resumen}>
          <View style={{ flex: 1 }}>
            <Text style={styles.seccion}>Detalle de la cuenta</Text>
            <Text style={styles.resumenSub}>
              {comandados.length} comandados · {nuevos.length} nuevos
            </Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalText}>${totMesa.toFixed(2)}</Text>
          </View>
        </View>
        ) : (
        <View style={styles.resumen}>
          <View style={{ flex: 1 }}>
            <Text style={styles.seccion}>Modificación de combo</Text>
            <Text style={styles.titulo} numberOfLines={2}>{item ? item.descripcion : ''}</Text>
          </View>
        </View>
        )}

        { selectCombo && comboSec ? (
        <View style={styles.seccionesBarra}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.containerScrollh}>
          { comboSec.map((s) => {
            const sel = ultSeccion == s.idSeccion
            return (
            <TouchableOpacity
              key={s.idSeccion}
              style={[styles.card, sel ? styles.cardSel : null]}
              onPress={() => handleSecciones(s.idSeccion,s.cantMax,s.autocompletar,s.descCorta)}
              activeOpacity={0.7}
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

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.lista}>

        { isPending ? (
        <View style={styles.vacio}>
        <ActivityIndicator size="large" color={Colors.colorazulboton}/>
        </View>
        ) : null }

        { !selectCombo && !isPending && cuenta.length == 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="receipt-outline" size={44} color={Colors.backbotones} />
            <Text style={styles.vacioText}>La mesa no tiene platos</Text>
          </View>
        ) : null }

        {/* Platos ya comandados */}
        { !selectCombo && verAnt && comandados.length > 0 ? (
          <>
            <Text style={styles.grupo}>Comandados</Text>
            {comandados.map((c) => renglonComandado(c))}
          </>
        ) : null }

        {/* Platos nuevos */}
        { !selectCombo && nuevos.length > 0 ? (
          <>
            <Text style={styles.grupo}>Nuevos · sin comandar</Text>
            {nuevos.map((c) => renglonNuevo(c))}
          </>
        ) : null }

        {/* Modificacion de combo: platos de la seccion */}
        { selectCombo && ultSeccion == 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="layers-outline" size={44} color={Colors.backbotones} />
            <Text style={styles.vacioText}>Seleccione una sección del combo</Text>
          </View>
        ) : null }

        {comboDet && selectCombo ?
        comboDet.map((cd) => (
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
          ))
        : null }

      </ScrollView>

      {/* Observaciones del plato seleccionado */}
      {info ? (
       <View style={styles.modalFondo}>
       <View style={styles.modalContainer}>
         <Text style={styles.modalTitulo}>Observaciones</Text>
         <Text style={styles.iteminput} numberOfLines={2}>{capitalize(descSel)}</Text>
         <View style={styles.inputContainer}>
           <Ionicons name="create-outline" size={20} color={Colors.backbotones} />
           <TextInput
             style={styles.input}
             onChangeText={onChangeText}
             value={text}
             placeholder='Observaciones'
             placeholderTextColor={Colors.backbotones}
             autoFocus
           />
         </View>
         <TouchableOpacity
           style={[styles.itemSelContainer, esEntSel ? styles.itemSelContainerOn : null]}
           onPress={()=>setEsEntSel(!esEntSel)}
           activeOpacity={0.7}
         >
           <Ionicons
             name={esEntSel ? 'checkmark-circle' : 'ellipse-outline'}
             size={22}
             color={esEntSel ? 'white' : Colors.colorcheckbox}
           />
           <Text style={[styles.entradaText, esEntSel ? styles.entradaTextOn : null]}>Es Entrada</Text>
         </TouchableOpacity>

         <View style={styles.bottombutton} >
           <TouchableOpacity style={styles.btCancelar} onPress={() => { setInfo(false); onChangeText('') }} activeOpacity={0.7}>
             <Text style={styles.btText}>Cancelar</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.btConfirmar} onPress={() => handleinfotext()} activeOpacity={0.7}>
             <Ionicons name="checkmark" size={22} color="white" />
             <Text style={styles.btText}>Confirmar</Text>
           </TouchableOpacity>
         </View>
       </View>
       </View>
      ) : null }

      {/* Barra de herramientas */}
      {!selectCombo ? (
      <View style={styles.pieContainer}>
        { Param[0].mozosCierranMesa && cuenta.length <= origDet && cuenta.length > 0 ? (
          <BotonPie icono="document-text-outline" label="Cerrar" color={Colors.colorazulboton} onPress={() => handleCerrar()} />
        ) : null }
        <BotonPie icono="remove-circle-outline" label="Menos" deshabilitado={!haySel} onPress={()=>handleCantidad(-1)} />
        <BotonPie icono="add-circle-outline" label="Más" deshabilitado={!haySel} onPress={()=>handleCantidad(1)} />
        <BotonPie icono="trash-outline" label="Borrar" deshabilitado={!haySel} onPress={()=>handleBorrar()} />
        <BotonPie icono="create-outline" label="Obs." deshabilitado={!haySel} onPress={()=>handleInfo()} />
        <BotonPie icono={verAnt ? 'eye' : 'eye-off'} label={verAnt ? 'Ocultar' : 'Ver todo'} onPress={() => handleVerAnt()} />
        <TouchableOpacity style={styles.btComandar} onPress={() => handleComandar(true)} activeOpacity={0.7}>
          <Ionicons name="print" size={24} color="white" />
          <Text style={styles.btComandarText}>Comandar</Text>
        </TouchableOpacity>
      </View>
      ) : null }

      { selectCombo && !isGustos ? (
        <View style={[styles.pieContainer, styles.pieCombo]}>
          <TouchableOpacity style={styles.btCancelarCombo} onPress={() =>  setSelectCombo(false)} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="white" />
            <Text style={styles.btText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btConfirmar} onPress={() => handleModifCombo()} activeOpacity={0.7}>
            <Ionicons name="checkmark" size={22} color="white" />
            <Text style={styles.btText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      ) : null }

      {isGustos && selectCombo ? (

      <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            onClose={() => handleBottomSheet()}
            {...sheetTheme}
          >

          <View style={{ flex: 1 }}>

          <View style={styles.sheetHeader}>
              <Text style={styles.valTextSel}>Seleccionar Gustos</Text>
              <View style={styles.sheetBarra}>
                <View style={[styles.contador, cantGustos > cantMaxGustos ? styles.contadorError : null]}>
                  <Text style={styles.contadorText}>{cantGustos} / {cantMaxGustos}</Text>
                </View>
                { cantGustos > 0 && cantGustos <= cantMaxGustos ? (
                <TouchableOpacity style={styles.btConfirmar} onPress={handleConfirmarGustos} activeOpacity={0.7}>
                  <Ionicons name="checkmark" size={22} color="white" />
                  <Text style={styles.btText}>Confirmar Gustos</Text>
                </TouchableOpacity>
                ) : (
                <View style={[styles.btConfirmar, styles.btDeshabilitado]}>
                  <Text style={styles.btText}>Confirmar Gustos</Text>
                </View>
                )}
              </View>
          </View>

          <BottomSheetScrollView contentContainerStyle={styles.containerScrollvSheet}>
          { gustos.map((g) =>
            <View style={styles.gustoContainer} key={g.idGusto}>
                <Text style={styles.gustoText} numberOfLines={2}>{g.descGusto}</Text>
                <InputSpinner
                  value={0}
                  style={styles.spinner}
                  color={Colors.colorcheckbox}
                  onIncrease={(value) => { handleGustosInc(value as number,1,g.idGusto,g.descGusto,g.idPlatoRel)
                  }}
                  onDecrease={(value) => { handleGustosInc(value as number,-1,g.idGusto,g.descGusto,g.idPlatoRel)
                  }}
                />
            </View>
          )}
          </BottomSheetScrollView>

          </View>

        </BottomSheet>

        ) : null }

      { comandar ? <Redirect href={`/mesas`}  /> : null }

    </View>
  </GestureHandlerRootView>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // --- Resumen ---
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
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
  resumenSub: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.colorazulboton,
    marginTop: 2,
  },
  totalBox: {
    alignItems: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.itemsviejos,
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.colorazulboton,
  },

  // --- Lista ---
  lista: {
    padding: 12,
    gap: 8,
  },
  grupo: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.itemsviejos,
    marginTop: 4,
    marginLeft: 2,
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  itemNuevo: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.colorazulboton,
  },
  itemSel: {
    borderColor: Colors.colorcheckbox,
    backgroundColor: 'rgba(80,138,173,0.18)',
  },
  cantPill: {
    minWidth: 40,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  cantPillOrig: {
    backgroundColor: Colors.backbotones,
  },
  cantText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  itemTextos: {
    flex: 1,
    gap: 2,
  },
  item: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.colorazulboton,
  },
  itemorig: {
    fontSize: 17,
    color: Colors.itemsviejos,
  },
  itemDet: {
    fontSize: 14,
    color: Colors.backsombra,
    opacity: 0.8,
  },
  itemObs: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.itemsnuevos,
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: Colors.colorcheckbox,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },

  // --- Barra de herramientas ---
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.colorFondoCuenta,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  pieCombo: {
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pieBoton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  pieBotonDeshab: {
    opacity: 0.35,
  },
  pieLabel: {
    fontSize: 11,
    color: 'white',
  },
  btComandar: {
    flex: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.colorfondoBoton,
  },
  btComandarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },

  // --- Observaciones ---
  modalFondo: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalContainer: {
    gap: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.colorBackModal,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.colorfondoBoton,
  },
  iteminput: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.background,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    height: '100%',
    paddingVertical: 0,
  },
  itemSelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.colorcheckbox,
  },
  itemSelContainerOn: {
    backgroundColor: Colors.colorcheckbox,
  },
  entradaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.colorcheckbox,
  },
  entradaTextOn: {
    color: 'white',
  },
  bottombutton: {
    flexDirection: 'row',
    gap: 12,
  },
  btCancelar: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorBackBoton,
  },
  btCancelarCombo: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colornjaboton,
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

  // --- Modificacion de combo ---
  seccionesBarra: {
    paddingVertical: 10,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderLeftWidth: 4,
    borderLeftColor: Colors.colorborderubro,
  },
  checkboxText: {
    fontSize: 17,
    color: 'white',
    textDecorationLine: 'none',
  },

  // --- BottomSheet gustos ---
  sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  sheetBarra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  valTextSel: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.colorfondoBoton,
    textAlign: "center",
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
  containerScrollvSheet: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  gustoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
  },
  gustoText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
  },
  spinner: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});


export default cuenta
