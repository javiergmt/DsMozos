import { View, Text,  ScrollView, TouchableOpacity, Pressable, StyleSheet, ActivityIndicator, Alert, RefreshControl, TextInput } from 'react-native'
import React, {  useEffect, useRef, useState } from 'react'
import { Link, Redirect} from 'expo-router'
import { mesasType, sectoresType, paramType, ReservasType } from './ApiFront/Types/BDTypes';
import { getMesas, getPlato_Precio, getReservas, getSectores } from './ApiFront/Gets/GetDatos';
import { useLoginStore } from "../app/store/useLoginStore"
import Colors from '../constants/Colors';
import { AbrirMesa, BloquearMesa, ConfCumpReserva, GrabarComensales, LiberarMesa } from './ApiFront/Posts/PostDatos';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { sheetTheme, sheetStyles, useSnapPoints } from '../constants/SheetTheme';
import { useCola, pendientesDeMesa } from '../servicios/colaComandas';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getHoraActual } from './Funciones/deConversion';
import FlashMessage from "react-native-flash-message"
import { showMessage, hideMessage } from "react-native-flash-message";

// Define la forma de la mesa
// 0 = Rectangulo, 1 = Cuadrado, 2 = Rectangulo Redondeado, 3 = Cuadrado Redondeado, 4 = Elipse, 5 = Circulo  
const mesaForma = (forma:number) => {

  switch (forma) {
    case 0:
      return styles.rectangulo;
    case 1:      
      return styles.cuadrado;
    case 3:
      return styles.cuadrado_red;
    case 2:
      return styles.rectangulo_red;
    case 5:
      return styles.circulo;
    case 4:
      return styles.elipse;
    default:
      return styles.cuadrado;
  }
}

// Define el color de la mesa

const mesaColor = (param:paramType[],ocupada:string,cerrada:number,conPostre:boolean,idMozo:number,idMozoSel:number,soloOcupada:boolean, idTipoMozo:number, activa:boolean) => {

  //console.log('mesaColor:',ocupada,cerrada,conPostre,idMozo,idMozoSel,soloOcupada,idTipoMozo)
  if ( activa) {
    if ( (idMozoSel != idMozo && idTipoMozo != 3 && idTipoMozo != 2 ) && ocupada=='S' && cerrada==0) {
      if (soloOcupada) {
        return 'lightblue'
      } else {
      return 'gray'
      }
    } else {
      if (conPostre) {
        return param[0].colorPostre
      } else {
        if (soloOcupada) {
          return 'lightblue'
        } else {
          if (cerrada == 1) {
            return param[0].colorMesaCerrada
          } else {
            if (ocupada == 'N') {
              return param[0].colorMesaNormal
            } else {
              return param[0].colorMesaOcupada
            }
          }
      }  
    }
    }
  } else {  
    return 'lightgray'
  }
    
}

const mesas = () => {
  const [mesas, setMesas] = useState<mesasType[]>([]);
  const [sectores, setSectores] = useState<sectoresType[]>([]);
  const [reservas, setReservas] = useState<ReservasType[]>([]);
  const [sector, setSector] = useState<number>(2);
  const {getUrl,mozo,ultSector,setUltSector,getParam,setUltMesa,
         setOrigDetalle,setUltDetalle,setMesaDet,setComensales,
        getBaseDatos,BaseDatos, mesaDet, dispId, setTotMesa,mesasConDesc} = useLoginStore()
  const urlBase = getUrl()
  const base = getBaseDatos()
  const Param = getParam()
  const [isOk, setIsOk] = useState(false)
  const [isOcup, setIsOcup] = useState('N')
  const [isSoloOcup, setIsSoloOcup] = useState(false)
  const [isPending, setIsPending] = useState(false);  
  const [comensalesOk, setComensalesOk] = useState(!Param[0].pedirCubiertos)
  const [cantComensales, setCantComensales] = useState(1)
  const [idPlatoCub, setIdPlatoCub] = useState(Param[0].idCubiertos)
  const [descripCub, setDescripCub] = useState(Param[0].descripCub)
  const [mesaSeleccionada, setMesaSeleccionada] = useState(0)
  const [tieneReserva, setIsTieneReserva] = useState(false)
  const [date, setDate] = useState(new Date());
  const [refreshing,setRefreshing] =useState(false);
  const [mostrarDescMesa, setMostrarDescMesa] = useState(mesasConDesc)

  // Control del bottomSheet
  const sheetRef = useRef<BottomSheet>(null); 
  const snapPoints = useSnapPoints([45, 70], [320, 420]);

  // Comandas pendientes (para marcar las mesas) y estado de la conexion
  const { trabajos, servidorOk } = useCola()

  // SafeArea
  const { bottom, top, right, left } = useSafeAreaInsets();
 
  // Cargo las mesas del Sector
  const handleMesas = (idSector:number) => {
    const load = async () => {
      const { mesas, isError, isPending }  = await getMesas(idSector,-1,urlBase,base);
      setIsPending(isPending)
      setMesas(mesas);
      setUltSector(idSector);
    };
    setRefreshing(true)
    load();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
 } 

 // Bloqueo la mesa y la abro si esta cerrada 
 const handleMesa = async (mesa:mesasType) => {
 if (!mesa.activa) {
    showMessage({message: 'ATENCION !!',
      description: "La mesa esta Inactiva",
      type: "danger",
    });
    return;
  }
  // Comanda guardada en el telefono sin enviar: la mesa queda tomada hasta que se envie
  if (pendientesDeMesa(mesa.nroMesa).length > 0) {
    showMessage({message: 'Comanda pendiente',
      description: `La mesa ${mesa.nroMesa} tiene una comanda sin enviar. Se libera sola cuando vuelva la conexión.`,
      type: "warning",
    });
    return;
  }
  if (servidorOk === false) {
    showMessage({message: 'Sin conexión',
      description: "Para abrir una mesa hace falta conexión con el servidor.",
      type: "warning",
    });
    return;
  }   
 setTotMesa(0); 
 if ( ( mesa.idMozo == 0 && mesa.ocupada == 'N' && mesa.cerrada == 0) 
    || ( ( mesa.idMozo == mozo.idMozo || mozo.idTipoMozo == 3 || mozo.idTipoMozo == 2 ) && mesa.ocupada == 'S' && mesa.cerrada == 0)
  ) {
      if (mesa.reservada) {
       setIsTieneReserva(true)
        const res = await getReservas(urlBase,base,date.toISOString(),0);
        setReservas(res.filter(r => r.mesa == mesa.nroMesa && !r.cumplida)) ;
              
      }

      const res = await BloquearMesa(mesa.nroMesa,mozo.idMozo,urlBase,base)
      console.log('Mesa Bloqueada',res)
      if (res.mesa != 0) {
        setComensales(mesa.cantPersonas)
        setUltSector(mesa.idSector);
        setUltMesa(
          { nroMesa:mesa.nroMesa,
            idSector:mesa.idSector,
            ocupada:mesa.ocupada,
            idMozo:mesa.idMozo,
            cerrada:mesa.cerrada,
            cantPersonas:mesa.cantPersonas,
            activa:mesa.activa,
            soloOcupada:mesa.soloOcupada,
            descMesa: mesa.descMesa
          });
          setIsOk(true)
          setIsOcup(mesa.ocupada)
          if (mesa.ocupada == 'N') {
            console.log('Creo la mesa')
            const res = await AbrirMesa(mesa.nroMesa,mozo,urlBase,base)
            console.log('Mesa Abierta',res)
            setUltDetalle(0)
            
            
          }
          setMesaSeleccionada(mesa.nroMesa)
      }
  } else {
    if (mesa.cerrada == 1) {
      //Alert.alert('ATENCION !!','Mesa Cerrada ')
      showMessage({
            message: "ATENCION !!",
            description: "La mesa esta cerrada",
            type: "danger",
      });
    } else {
      if (mesa.idMozo != mozo.idMozo ) {
        if (mesa.soloOcupada ) {
          // Registrar la Mesa solo ocupada sin detalle al Mozo que se loguea
       
          const res = await BloquearMesa(mesa.nroMesa,mozo.idMozo,urlBase,base)
          if (res.mesa != 0) {
            setUltSector(mesa.idSector);
            setUltMesa(
              { nroMesa:mesa.nroMesa,
                idSector:mesa.idSector,
                ocupada:mesa.ocupada,
                idMozo:mesa.idMozo,
                cerrada:mesa.cerrada,
                cantPersonas:mesa.cantPersonas,
                activa:mesa.activa,
                soloOcupada:mesa.soloOcupada,
                descMesa: mesa.descMesa
              });
              setIsOk(true)
              setIsOcup(mesa.ocupada)
              setIsSoloOcup(mesa.soloOcupada)
              setMesaSeleccionada(mesa.nroMesa)
              setComensalesOk(true)
              console.log('Mesa Bloqueada',mesa, res)
          }
          
        } else {  
         
          showMessage({
            message: "ATENCION !!",
            description: "Mesa Ocupada por otro Mozo",
            type: "danger",
          });
        }  
      } else {
       
        showMessage({
          message: "ATENCION !!",
          description: "Mesa en Uso",
          type: "danger",
        });
      }
      
    }  
  }
}

// Input de mesa para buscar
const handleBuscarMesa = () => {
  const load = async () => {
      const { mesas, isError, isPending }  = await getMesas(-1,Number(text.trim()),urlBase,base);
      //console.log('Mesa Encontrada:',mesas[0])
      setIsPending(isPending)
      if (mesas.length == 1) {
        
        if (sectores.filter(s => mesas[0].idSector == s.idSector).length == 1) {
          handleMesa(mesas[0])
        }
      }
    };
  // Buscar la mesa en mesas
  load();
  onChangeText('');
}

// Manejo de los Comensales, aumentar o decrementar
const handleComensales = (cant:number) => {
  const cantidad = cantComensales
  if (cantidad + cant > 0) {
    setCantComensales(cantidad + cant) 
  } else{
    setCantComensales(1)
  }
}

// Grabo los comensales en la mesa y el detalle de cubiertos
const handleBottomSheet = async () => { 
  const grabarComens = async () => {
      const res = await GrabarComensales(mesaSeleccionada,cantComensales,urlBase,base)
      setComensales(cantComensales)
      setComensalesOk(true)
  };

  if (cantComensales == 0) {   
    showMessage({
      message: "ATENCION !!",
      description: "Debe ingresar la cantidad de Comensales",
      type: "danger",
    });
    return
  }
 
  grabarComens();

  if (idPlatoCub != 0) {
    console.log('Creo Cubiertos',cantComensales)
    const hora = getHoraActual()
    const platoprecio = getPlato_Precio(idPlatoCub,0,0,hora,urlBase,BaseDatos)
    platoprecio.then((res) => { 
    const det = { 
          nroMesa: mesaSeleccionada,
          idPlato: idPlatoCub,
          idDetalle: 1,
          cant: cantComensales,
          pcioUnit: (res ? res[0].pcioUnit : 0) ,
          importe: (res ? res[0].pcioUnit * cantComensales: 0) ,
          descripcion: descripCub,
          obs: '',
          esEntrada: false,
          cocido: '',
          idTamanio: 0,
          descTam: '',
          idSectorExped: (res ? res[0].idSectorExped : 0),
          gustos: [],
          idTipoConsumo: 'CF',
          impCentralizada: (res ? res[0].impCentralizada : 0),
          detalles: '' 
    }
    mesaDet.push(det)
    setUltDetalle(1)
    })
  }  
  // Revisar porque no pone Cerrada = 0
  // const res2 = await LiberarMesa(mesaSeleccionada,false,urlBase,BaseDatos)
  //console.log('Comensales Grabados:',res)
}

const handleReservas = async (r:ReservasType) => { 
  // Doy como cumplida la reserva y grabo los comensales en la mesa
  setComensales(r.cant)
  setComensalesOk(true)
  const res = await GrabarComensales(mesaSeleccionada,r.cant,urlBase,base)
  const res1 = await ConfCumpReserva(r.idReserva,true,true,urlBase,BaseDatos)
}

const handleDataChange = async () => {
  //handleMesas(ultSector); 
  const load = async () => {
   
          const result = await getSectores(urlBase,base,dispId);
          setSectores(result);
          // obtener el primer sector
          const firstSector = result[0];
          if (firstSector) {
            handleMesas(firstSector.idSector);
          }
    
  };
  
  load();
  setOrigDetalle(0)
  setUltDetalle(0)
  setMesaDet([])
} 

const [text, onChangeText] = useState('');

useEffect(() => {

  sheetRef.current?.snapToIndex(-1);
  handleDataChange()
  const interval = setInterval(() => {
    handleDataChange()
  }, 20000);
  return () => clearInterval(interval);
  
 
 
}, []);

return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <FlashMessage position="top" />
    <View style={{flex:1, height:'100%',  backgroundColor: Colors.background, }}>
     
    {/* Despliego los Sectores  */}
    {!isOk &&
    <View style={styles.header}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectoresScroll}
      >
        { sectores.map((s) => {
          const sel = ultSector == s.idSector
          return (
            <Pressable
              key={s.idSector}
              onPress={() => handleMesas(s.idSector)}
              style={({ pressed }) => [
                styles.sectorChip,
                sel && styles.sectorChipSel,
                pressed && styles.presionado,
              ]}
            >
              <Text style={[styles.sectorChipText, sel && styles.sectorChipTextSel]}>
                {s.descripcion}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Leyenda de colores */}
      <View style={styles.leyenda}>
        {[
          { label: 'Libre', color: Param[0].colorMesaNormal },
          { label: 'Ocupada', color: Param[0].colorMesaOcupada },
          { label: 'Cerrada', color: Param[0].colorMesaCerrada },
          { label: 'Postre', color: Param[0].colorPostre },
        ].map((l) => (
          <View key={l.label} style={styles.leyendaItem}>
            <View style={[styles.leyendaPunto, { backgroundColor: l.color }]} />
            <Text style={styles.leyendaText}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
    }

    {/* Despliego las mesas del Sector */}

    <View style={{flex:1, height:'100%',  backgroundColor: Colors.background, }}>
    <ScrollView contentContainerStyle={styles.cont_mesas}
    refreshControl={
      <RefreshControl
     refreshing={refreshing}
     tintColor={Colors.colorazulboton}
     colors={[Colors.colorfondoBoton]}
     onRefresh={() => handleMesas(ultSector) }/>}
    >
     { isPending &&
        <View style={styles.activ}>
        <ActivityIndicator size="large" color={Colors.colorazulboton}/>
        </View>
     }
     {!isOk && !isPending &&
      mesas.map((m) => {
        const reservadaLibre = Boolean(m.reservada) && m.ocupada == 'N'
        const conPersonas = m.ocupada == 'S' && Number(m.cantPersonas) > 0
        const conPendiente = trabajos.some((t) => t.nroMesa == m.nroMesa)
        return (
          <Pressable
            key={m.nroMesa}
            onPress={() => handleMesa(m)}
            style={({ pressed }) => [styles.mesaWrap, pressed && styles.presionado]}
          >
            <View
              style={[
                styles.mesaCard,
                { backgroundColor: mesaColor(Param,m.ocupada,m.cerrada,m.conPostre,m.idMozo,mozo.idMozo,m.soloOcupada,mozo.idTipoMozo,m.activa) },
                reservadaLibre && styles.mesaReservada,
                !m.activa && styles.mesaInactiva,
              ]}
            >
              {reservadaLibre ? (
                <View style={styles.mesaBadge}>
                  <Ionicons name="calendar" size={11} color={Colors.background} />
                </View>
              ) : null}
              {conPendiente ? (
                <View style={styles.mesaPendiente}>
                  <Ionicons name="cloud-upload" size={11} color="white" />
                </View>
              ) : null}
              <Text style={styles.mesaNro}>{m.nroMesa}</Text>
              {conPersonas ? (
                <View style={styles.mesaPersonas}>
                  <Ionicons name="people" size={12} color="white" />
                  <Text style={styles.mesaPersonasText}>{m.cantPersonas}</Text>
                </View>
              ) : null}
            </View>
            {mostrarDescMesa ? <Text style={styles.mesaDesc} numberOfLines={2}>{m.descMesa}</Text> : null}
          </Pressable>
        )
      })}
    </ScrollView>

    </View>

    <View style={[styles.cont_Pie, { paddingBottom: bottom + 8 }]}>
      <View style={styles.pieFila}>

       <Link href="/mozos" replace asChild>
        <TouchableOpacity style={styles.btSalir} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color="white" />
            <Text style={styles.btSalirText}>Salir</Text>
        </TouchableOpacity>
       </Link>

       <View style={styles.buscador}>
         <Ionicons name="search" size={18} color={Colors.colorborderubro} />
         <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
          placeholder='Buscar mesa'
          placeholderTextColor='grey'
          keyboardType="numeric"
          returnKeyType="search"
          onSubmitEditing={() => { if (text.trim() !== '') handleBuscarMesa() }}
         />
         { text.trim() !== '' ? (
          <TouchableOpacity onPress={() => handleBuscarMesa()} style={styles.btBuscar} activeOpacity={0.7}>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
         ) : null }
       </View>

    </View>
    { mozo.idTipoMozo == 4 ? (
    <Link href="/reservas" replace asChild>
        <TouchableOpacity style={styles.btReservas} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text style={styles.btSalirText}>Reservas</Text>
        </TouchableOpacity>
    </Link>
    ) : null }
    </View>

    {/* Redirecciono a la pagina Cuenta o Rubros segun si esta Ocupada o Libre   */}  
    { (isOk && ( isOcup=='N' || isSoloOcup) && comensalesOk && mozo.idTipoMozo != 4) && <Redirect href="/(tabs)/platos" /> }
    { (isOk && isOcup=='S') && <Redirect href="/(tabs)/cuenta" /> }
    { (isOk && isOcup=='X') && <Redirect href="/(tabs)/mensajes/1" /> }
    { (isOk && isOcup=='N' && comensalesOk && mozo.idTipoMozo == 4) && <Redirect href="/mesas" /> } 

    {/* Pido Comensales */}
    { (isOk && isOcup=='N'&& !comensalesOk && !tieneReserva) ? (
    <BottomSheet
         {...sheetTheme}
         ref={sheetRef}
         snapPoints={snapPoints}
         enablePanDownToClose={true}
         onClose={() => handleBottomSheet()}
      >
      <BottomSheetView style={sheetStyles.contenido}>
        <Text style={sheetStyles.titulo}>Comensales</Text>
        <Text style={sheetStyles.subtitulo}>Mesa {mesaSeleccionada}</Text>

        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepperBtSec} onPress={() => handleComensales(-5)} activeOpacity={0.7}>
            <Text style={styles.stepperBtSecText}>-5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepperBt} onPress={() => handleComensales(-1)} activeOpacity={0.7}>
            <Ionicons name="remove" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.stepperValor}>
            <Text style={styles.stepperCant}>{cantComensales}</Text>
            <Ionicons name="people" size={16} color={Colors.colorfondoBoton} />
          </View>

          <TouchableOpacity style={styles.stepperBt} onPress={() => handleComensales(1)} activeOpacity={0.7}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepperBtSec} onPress={() => handleComensales(5)} activeOpacity={0.7}>
            <Text style={styles.stepperBtSecText}>+5</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sheetBtPrimario} onPress={() => handleBottomSheet()} activeOpacity={0.7}>
          <Ionicons name="checkmark" size={22} color="white" />
          <Text style={styles.sheetBtText}>Confirmar</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
    ) : null }

    {/* Tiene Reserva  */}
    { (isOk && isOcup=='N' && tieneReserva && !comensalesOk) ? (
    <BottomSheet
         {...sheetTheme}
         ref={sheetRef}
         snapPoints={snapPoints}
         enablePanDownToClose={true}
         onClose={() => handleBottomSheet()}
      >
      <BottomSheetScrollView contentContainerStyle={sheetStyles.contenido}>
        <Text style={sheetStyles.titulo}>Seleccionar Reserva</Text>
        <Text style={sheetStyles.subtitulo}>Mesa {mesaSeleccionada}</Text>

        { reservas.map((r) => (
          <TouchableOpacity key={r.idReserva} style={styles.reservaCard} onPress={() => handleReservas(r)} activeOpacity={0.7}>
            <View style={styles.reservaHora}>
              <Ionicons name="time-outline" size={16} color="white" />
              <Text style={styles.reservaHoraText}>{r.hora}</Text>
            </View>
            <Text style={styles.reservaNombre} numberOfLines={1}>{r.nombre}</Text>
            <View style={styles.reservaCant}>
              <Ionicons name="people" size={16} color={Colors.colorfondoBoton} />
              <Text style={styles.reservaCantText}>{r.cant}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={sheetStyles.divisor}>
          <View style={sheetStyles.divisorLinea} />
          <Text style={sheetStyles.divisorText}>u ocupar sin reserva</Text>
          <View style={sheetStyles.divisorLinea} />
        </View>

        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepperBtSec} onPress={() => handleComensales(-5)} activeOpacity={0.7}>
            <Text style={styles.stepperBtSecText}>-5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepperBt} onPress={() => handleComensales(-1)} activeOpacity={0.7}>
            <Ionicons name="remove" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.stepperValor}>
            <Text style={styles.stepperCant}>{cantComensales}</Text>
            <Ionicons name="people" size={16} color={Colors.colorfondoBoton} />
          </View>

          <TouchableOpacity style={styles.stepperBt} onPress={() => handleComensales(1)} activeOpacity={0.7}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepperBtSec} onPress={() => handleComensales(5)} activeOpacity={0.7}>
            <Text style={styles.stepperBtSecText}>+5</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sheetBtSecundario} onPress={() => handleBottomSheet()} activeOpacity={0.7}>
          <Text style={styles.sheetBtSecText}>Ocupar sin Reserva</Text>
        </TouchableOpacity>

      </BottomSheetScrollView>
    </BottomSheet>
    ) : null }

  </View>
  </GestureHandlerRootView>  
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 10,
    backgroundColor: Colors.background,
    //height: '100%',
  },

  cont_mesas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: Colors.background,
    //height: '100%',
  },
  cont_Pie: {
    backgroundColor: Colors.colorFondoCuenta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingHorizontal: 12,
    width: '100%',
    gap: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },

  // --- Encabezado / Sectores ---
  header: {
    backgroundColor: Colors.background,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  sectoresScroll: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  sectorChip: {
    paddingHorizontal: 16,
    height: 38,
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1,
    borderColor: Colors.backbotones,
  },
  sectorChipSel: {
    backgroundColor: Colors.colorcheckbox,
    borderColor: Colors.colorcheckbox,
  },
  sectorChipText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.itemsviejos,
  },
  sectorChipTextSel: {
    color: 'white',
    fontWeight: 'bold',
  },
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  leyendaPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaText: {
    fontSize: 12,
    color: Colors.itemsviejos,
  },

  // --- Mesas ---
  mesaWrap: {
    width: 84,
    alignItems: 'center',
  },
  mesaCard: {
    width: 76,
    height: 76,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  mesaReservada: {
    borderColor: 'white',
    borderWidth: 3,
  },
  mesaInactiva: {
    opacity: 0.5,
  },
  mesaNro: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mesaBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mesaPendiente: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.colornjaboton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mesaPersonas: {
    position: 'absolute',
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mesaPersonasText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  mesaDesc: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  presionado: {
    opacity: 0.75,
    transform: [{ scale: 0.95 }],
  },

  // --- Pie ---
  pieFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 520,
  },
  btSalir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: Colors.colorfondoBoton,
  },
  btReservas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    width: '100%',
    maxWidth: 520,
    borderRadius: 14,
    backgroundColor: Colors.colorfondoBoton,
  },
  btSalirText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buscador: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingLeft: 12,
    paddingRight: 4,
    gap: 6,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.colorborderubro,
  },
  btBuscar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  separador : {
    backgroundColor: '#fff',
    width: '100%',
    height: StyleSheet.hairlineWidth,
    
  },
  separador1 : {
    backgroundColor: '#fff',
    width: '100%',
    height: 1,
  },
 
  activ: {
    margin: 20,
  },
  
  bottombutton: {
    padding: 10,
    alignItems: 'center',
  },
  item: {
    padding: 10,
    height: 50,
    flexDirection: 'row',
    
  },
  itemText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 62,
    
  },
  itemTextDesc: {    
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    lineHeight: 32,
    maxWidth:110,
    minWidth:110,
  },
  bottomText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
    textAlign: 'center',
    lineHeight: 50,
   
  },
  sectorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    lineHeight: 50,
    borderRadius: 10,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  card: {
    backgroundColor: Colors.backbotones,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    height: 45,
    marginVertical: 0,
  },
  cardSel: {
    backgroundColor: Colors.colorcheckbox,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    height: 45,
    marginVertical: 0,
  },
  elevation: {
    elevation: 20,
    shadowColor: Colors.backsombra,
  },
  textBtSalir: {
    width:180,
    textAlign:'center',
    fontSize:25,
    fontWeight:'500',
    marginTop:5,
    marginBottom:5,
    marginRight:10,
    color:'white',
    //height:50,
    borderRadius:10,
    backgroundColor:Colors.colorfondoBoton,  
   
  },
  heading: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
    color: 'white',
    textAlign: 'center',
  },
  cuadrado: {
    width: 50,
    height: 50,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
    
  },
  cuadrado_red: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderColor: 'white',
    borderStyle: 'solid',
    borderWidth: 3,
  },
  rectangulo: {
    width: 100,
    height: 50,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  rectangulo_red: {
    width: 100,
    height: 50,
    borderRadius: 10,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  circulo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  elipse: {
    width: 50,
    height: 50,   
    borderRadius: 50,
    transform: [{ scaleX: 2 }],
    marginLeft: 25,
    marginRight: 25,
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  fixedBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: 'gray',
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    margin: 3,
    backgroundColor: '#4267b2',
    borderColor: '#ffffff',
    alignItems: 'center'
  },
  buttonStyleContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 5,
   },
   buttonStyle: {
    marginHorizontal: 20,
    marginTop: 5,
  },
    container_input: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',  
   
  },
    input: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      height: '100%',
      paddingVertical: 0,
      color: 'white',
    },

  // --- BottomSheets ---
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stepperBt: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  stepperBtSec: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.colorfondoBoton,
  },
  stepperBtSecText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
  },
  stepperValor: {
    minWidth: 70,
    alignItems: 'center',
  },
  stepperCant: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
  },
  sheetBtPrimario: {
    flexDirection: 'row',
    gap: 6,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  sheetBtText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  sheetBtSecundario: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.colorfondoBoton,
  },
  sheetBtSecText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
  },
  reservaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderLeftColor: Colors.colorcheckbox,
  },
  reservaHora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.colorcheckbox,
  },
  reservaHoraText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  reservaNombre: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.background,
  },
  reservaCant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reservaCantText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.colorfondoBoton,
  },

});

export default mesas
