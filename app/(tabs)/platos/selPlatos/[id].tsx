// Se muestran los platos del Rubros,Subrubros,Favoritos,Todos
// Aca se seleccionan los platos

import { View, Text, StyleSheet, ListRenderItem, TouchableOpacity, FlatList, TextInput, ScrollView, ActivityIndicator } from 'react-native'
import { useGrilla } from '../../../../constants/Dispositivo'
import React, { useEffect, useRef, useState } from 'react'
import { HeaderMesa } from '../../../../components/HeaderTitulo'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { getPlato_Precio, getPlatos } from '../../../ApiFront/Gets/GetDatos'
import { useLoginStore } from '../../../store/useLoginStore'
import { platosType, rubrosSubType } from '../../../ApiFront/Types/BDTypes'
import { capitalize, getHoraActual, hyphenatedText, vclToCssRgb } from '../../../Funciones/deConversion'
import { Ionicons } from '@expo/vector-icons';
import { showToast } from '../../../Funciones/deInfo'
import Colors from '../../../../constants/Colors'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { sheetTheme, useSnapPoints } from '../../../../constants/SheetTheme'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context'
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage} from "react-native-flash-message";

const rubSub = (id:any,rubros:rubrosSubType[]) => {
    const pos = id.indexOf('-')
    const cadena = 'x'
    // Si empieza con @ es una cadena
    if (id.charAt(0) == '@') {
      return { desc:'Busqueda' ,rub: 0, sub: 0, cadena: id.slice(1),tipo:'B' }
    }
    if (pos > 0) {
        // Es un subrubro
        
        const rub = id.slice(0,pos)
        const sub = id.slice(pos+1) 
        const subr = rubros.filter((r) => r.idRubro == rub).map((r) => { return r.subrubros})
        const desc =  subr[0].filter((s) => s.idSubRubro == sub).map((r) => { return capitalize(r.descripcion)})
         
        return { desc ,rub , sub, cadena ,tipo: rub==-1 ? 'F' : 'S'}
    } else {
         // Es un rubro
         const desc = rubros.filter((r) => r.idRubro == id).map((r) => { return capitalize(r.descripcion)})
         const rub = id
         const sub = 0
         return { desc , rub , sub , cadena ,tipo: rub==-1 ? 'F' : 'R'}
    }
    
}

const selPlatos = () => {
  // Ancho de boton segun el ancho actual (se recalcula al rotar)
  const anchoBoton = useGrilla(110)
  const {id} = useLocalSearchParams() as { id: string } // id es lo que recibe
  const [platos, setPlatos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)  
  const { urlBase,setUltItem,ultMesa,mozo,mesaDet,setMesaDet,setUltRubro,setUltRubSub,
          ultDetalle,setUltDetalle, origDetalle,Rubros,BaseDatos,
          comensales,dispId,tipoListaPlatos,setTotMesa,totMesa } = useLoginStore();
  const { desc, rub, sub , cadena , tipo} = rubSub(id,Rubros)
  const [selTam, setSelTam ] = useState(false)
  const [selGusto, setSelGusto ] = useState(false)
  const [selectCombo, setSelectCombo ] = useState(false)
  const [descRubro, setDescRubro] = useState(desc)
  const [pedirCant, setPedirCant] = useState(false)
  const [cantItem, setCantItem] = useState(1)
  const [itemSel, setItemSel] = useState<platosType>()
  const [text, onChangeText] = useState('');
  const [esEntSel, setEsEntSel] = useState(false)

   // Control del bottomSheet
  const sheetRef = useRef<BottomSheet>(null); 
  const snapPoints = useSnapPoints([60, 50], [400, 380]);
  const [verPlatos, setVerPlatos ] = useState(1) // 0: Renglones, 1: Botones

  const AgregaModifItem = (item:platosType) => {
    // Agrego el item a la mesa
    sheetRef.current?.close()
    let estaEnMesa = false
   
    mesaDet.forEach((m) => {
      if (m.idPlato == item.idPlato && m.idDetalle > origDetalle && m.obs == text) {
        m.cant = m.cant + cantItem
        m.importe = m.cant * m.pcioUnit
        estaEnMesa = true
        setTotMesa(totMesa + m.pcioUnit * cantItem)
      }
    })
    if (!estaEnMesa) {
      const hora = getHoraActual()
      const platoprecio = getPlato_Precio(item.idPlato,0,ultMesa.idSector,hora,urlBase,BaseDatos)
      platoprecio.then((res) => { 
        console.log(hora,'PlatoPrecio:',res)
      setTotMesa(totMesa + res[0].pcioUnit * cantItem)
      const det = { 
      nroMesa: ultMesa.nroMesa,
      idPlato: item.idPlato,
      idDetalle: ultDetalle + 1,
      cant: cantItem,
      pcioUnit: (res ? res[0].pcioUnit : 0) ,
      importe: (res ? res[0].pcioUnit * cantItem: 0) ,
      descripcion: item.descripcion,
      obs: text,
      esEntrada: esEntSel,
      cocido: '',
      idTamanio: 0,
      descTam: '',
      idSectorExped: (res ? res[0].idSectorExped : 0),
      gustos: [],
      idTipoConsumo: item.idTipoConsumo,
      impCentralizada: (res ? res[0].impCentralizada : 0),
      detalles: ''
      }
      mesaDet.push(det)
      setUltDetalle(ultDetalle+1)
      setEsEntSel(false)
      onChangeText('')
      })
    }  
    setMesaDet(mesaDet)
    console.log('MesaDet:',mesaDet)
    //showToast('Plato Agregado!!')
    showMessage({
      message: "Plato Agregado!!",
      description: "El Plato se ha agregado a la mesa",
      type: "success",
    });
    setPedirCant(false)
    setCantItem(1)
  }

  const handleCantidad = (cant) => {
    if (cantItem + cant >= 1) {
      setCantItem(cantItem + cant) 
    } 
    
  }

  const handleCancelar = () => {
    sheetRef.current?.close()
    setCantItem(1)
    setPedirCant(false)
  }

  const handleItem = (item:platosType) => {
    setUltItem(item)  
    setUltRubro(Number(id));
    console.log('ultdetalle',ultDetalle)
    if ( item.idTipoConsumo == 'CV' ) {
      if ( !item.tamanioUnico ) {
        // Selecciona el tamaño
        setSelTam(true)    
      }
      // Selecciona el gusto
      setUltRubSub(id);
      setSelGusto(true)
      return
    }
    if ( item.idTipoConsumo == 'CB' ) {
      // Arma el combo
      setSelectCombo(true)
      return
    }
    if ( !item.tamanioUnico ) {
      // Selecciona el tamaño
      setSelTam(true)    
      return
    }
    setPedirCant(true)
    setItemSel(item)
    
  }
  
  // Indica si el plato requiere un paso extra (variedad, combo o modificador)
  const subtituloItem = (item:platosType) => {
    if (item.idTipoConsumo == 'CV') return 'Seleccionar Variedad'
    if (item.idTipoConsumo == 'CB') return 'Armar Combo'
    if (!item.tamanioUnico) return 'Seleccionar Modificador'
    return ''
  }

  const renderItemRenglones: ListRenderItem<any> = ({ item }) => {
    const sub = subtituloItem(item)
    return (
      <TouchableOpacity style={styles.renglonContainer} onPress={() => handleItem(item)} activeOpacity={0.7}>
        <View style={styles.renglonTextos}>
          <Text style={styles.itemName} numberOfLines={2}>{capitalize(item.descripcion)}</Text>
          {sub != '' ? <Text style={styles.itemPcio}>{sub}</Text> : null}
        </View>
        <View style={[styles.itemIcon, sub != '' ? styles.itemIconPaso : null]}>
          <Ionicons name={sub != '' ? 'chevron-forward' : 'add'} size={22} color="white" />
        </View>
      </TouchableOpacity>
    );
  }

    useEffect(() => {
      sheetRef.current?.snapToIndex(-1);
      const load = async () => {
        //console.log('Busco Platos:',tipo,cadena,rub,sub,urlBase)
        setCargando(true)
        const result = await getPlatos(tipo,cadena,rub,sub,dispId,urlBase,BaseDatos)
        setPlatos(result)
        setCargando(false)
      }
      load()
      //setUltRubro(Number(rub));
    }, [rub , sub, cadena ,tipo] )

    return (
     <>
      <Stack.Screen options={
        {headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} />, headerTitleAlign: 'center'}
        } />
      <GestureHandlerRootView style={styles.container}>

        { selTam ? <Redirect href="platos/selTam" /> : null }
        { selGusto ? <Redirect href={`/(tabs)/platos/selGustos/0`} /> : null }
        { selectCombo ? <Redirect href= {`/(tabs)/platos/selCombos/0`}/> : null }

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.seccion}>{tipo == 'B' ? 'Resultado de búsqueda' : 'Platos'}</Text>
          <View style={styles.headerFila}>
            <Text style={styles.titulo} numberOfLines={1}>{tipo == 'B' ? cadena : descRubro}</Text>
            {platos.length > 0 ? <Text style={styles.contador}>{platos.length}</Text> : null}
          </View>
        </View>

        { cargando ? (
          <View style={styles.vacio}>
            <ActivityIndicator size="large" color={Colors.colorazulboton} />
          </View>
        ) : null }

        { !cargando && platos.length == 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="restaurant-outline" size={44} color={Colors.backbotones} />
            <Text style={styles.vacioText}>No hay platos para mostrar</Text>
          </View>
        ) : null }

        { (!selTam && !selGusto) && platos.length > 0 ? (
        <View style={styles.container}>

          { tipoListaPlatos == "L" ? (
          <FlatList
            data={platos}
            renderItem={renderItemRenglones}
            keyExtractor={(item) => item.idPlato.toString()}
            contentContainerStyle={styles.lista}
          />
          ) : null }

          { tipoListaPlatos == "B" ? (
            <ScrollView contentContainerStyle={styles.container_rubros}>
                {platos.map((p) => {
                  const conPaso = subtituloItem(p) != ''
                  return (
                    <TouchableOpacity
                      key={p.idPlato}
                      onPress={() => handleItem(p)}
                      activeOpacity={0.7}
                      style={[styles.containerImage, { width: anchoBoton, height: anchoBoton * 0.85, backgroundColor: p.colorFondo=='' ? '#ffffffaa' : vclToCssRgb(p.colorFondo)}]}
                    >
                      <Text style={styles.text} numberOfLines={3} adjustsFontSizeToFit>
                        {hyphenatedText(capitalize(p.descCorta))}
                      </Text>
                      {conPaso ? (
                        <View style={styles.botonPaso}>
                          <Ionicons name="chevron-forward" size={12} color="white" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
          ) : null }
        </View>
        ) : null }

        { pedirCant ? (
        <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}

        //onClose={() => AgregaModifItem(itemSel)}
        onClose={() => handleCancelar()}
        {...sheetTheme}
          >
          <BottomSheetView style={styles.sheet}>
          <Text style={styles.bottomText} numberOfLines={2}>{itemSel.descCorta}</Text>

          {/* Cantidad */}
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperBt} onPress={() => handleCantidad(-1)} activeOpacity={0.7}>
              <Ionicons name="remove" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.stepperCant}>{cantItem}</Text>
            <TouchableOpacity style={styles.stepperBt} onPress={() => handleCantidad(+1)} activeOpacity={0.7}>
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Observaciones */}
          <View style={styles.inputContainer}>
            <Ionicons name="create-outline" size={20} color={Colors.backbotones} />
            <TextInput
              style={styles.input}
              onChangeText={onChangeText}
              value={text}
              placeholder='Observaciones'
              placeholderTextColor={Colors.backbotones}
            />
          </View>

          {/* Es Entrada */}
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
            <Text style={[styles.iteminput, esEntSel ? styles.iteminputOn : null]}>Es Entrada</Text>
          </TouchableOpacity>

          <View style={styles.bottombutton} >
            <TouchableOpacity style={styles.btCancelar} onPress={() => handleCancelar()} activeOpacity={0.7}>
              <Text style={styles.btText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btConfirmar} onPress={() => AgregaModifItem(itemSel)} activeOpacity={0.7}>
              <Ionicons name="checkmark" size={22} color="white" />
              <Text style={styles.btText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          </BottomSheetView>
        </BottomSheet>
        ) : null }

        <FlashMessage position="top" />
      </GestureHandlerRootView>
     </>

    )
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // --- Encabezado ---
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  seccion: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.itemsviejos,
  },
  titulo: {
    flexShrink: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.colorazulboton,
    marginTop: 2,
  },
  contador: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: Colors.colorFondoCuenta,
  },
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  vacioText: {
    fontSize: 16,
    color: Colors.itemsviejos,
  },

  // --- Lista en renglones ---
  lista: {
    padding: 12,
    gap: 8,
  },
  renglonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderLeftWidth: 4,
    borderLeftColor: Colors.colorborderubro,
  },
  renglonTextos: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  itemPcio: {
    fontSize: 13,
    color: Colors.colorazulboton,
    marginTop: 2,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  itemIconPaso: {
    backgroundColor: Colors.backbotones,
  },

  // --- Botones ---
  container_rubros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    padding: 12,
    gap: 10,
  },
  containerImage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.colorborderubro,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  botonPaso: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // --- BottomSheet cantidad ---
  sheet: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  bottomText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  stepperBt: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  stepperCant: {
    minWidth: 60,
    textAlign: 'center',
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
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
  iteminput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.colorcheckbox,
  },
  iteminputOn: {
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
  btText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default selPlatos
