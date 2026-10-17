
import { View,Text, StyleSheet, TouchableOpacity, TextInput, ScrollView} from "react-native"
import { useLoginStore } from '../store/useLoginStore'
import FlashMessage from "react-native-flash-message"
import { showMessage, hideMessage } from "react-native-flash-message";
import { Redirect, Stack } from "expo-router"
import Colors from '../../constants/Colors'
import React, { useEffect, useState } from "react"
import { HeaderMesa, HeaderBotonCerrar } from '../../components/HeaderTitulo'
import { Ionicons } from '@expo/vector-icons'
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { getLugaresSectores, getMensajesComanda } from "../ApiFront/Gets/GetDatos"
import { lugSectImpreType, mensajesComandaType } from "../ApiFront/Types/BDTypes"
import { EliminarMesa, GrabarMensaje, LiberarMesa } from "../ApiFront/Posts/PostDatos"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const mensajes = () => {
const {ultMesa,comensales,urlBase,BaseDatos,mozo} = useLoginStore()
const [salir, setSalir] = useState(false)
const [text, onChangeText] = useState('');
const [textImpre, onChangeTextImpre] = useState('');
const [idImpre,setIdImpre] = useState(0);
const [idSectImpre,setIdSectImpre] = useState(0);
const [selImpre,setSelImpre] = useState(false);
const [selMensaje,setSelMensaje] = useState(false);
const [idMensaje,setIdMensaje] = useState(0);
const [mensajes, setMensajes] = useState( [] as mensajesComandaType[])
const [lugares, setLugares] = useState( [] as lugSectImpreType[])
const { bottom, top, right, left } = useSafeAreaInsets();

const handleLugar = (l: lugSectImpreType) => {
  setIdImpre(l.idImpresora)
  setIdSectImpre(l.idSectorExped)
  onChangeTextImpre(l.descripcion)
  setSelImpre(false)
}

const handleMensaje = (m: mensajesComandaType) => {
  setIdMensaje(m.idMensaje)
  onChangeText(m.descripcion)
  setSelMensaje(false)
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

const traerLugares = async (url:string,base:string) => {
    const lug = await getLugaresSectores(url,base)
    return lug
}  

const traerMensajes = async (url:string,base:string) => {
    const mens = await getMensajesComanda(url,base)
    return mens
}  

const handleGrabar = async () => {
  if ( (text == '') || (idImpre == 0) ) {
    showMessage({
      message: "Atención",
      description: "Debe ingresar un mensaje y seleccionar una impresora",
      type: "danger",
    });
    return
  }
  // Desbloquear la mesa o Elimirarla en caso de que no tenga detalle
  const res = await GrabarMensaje(text,ultMesa.idMozo,mozo.nombre,ultMesa.nroMesa,idSectImpre,idImpre,urlBase,BaseDatos)
  
  if (  ultMesa.ocupada == 'N' ) {
    const res = await EliminarMesa(ultMesa.nroMesa,urlBase,BaseDatos)
   } else {
    const res = await LiberarMesa(ultMesa.nroMesa,false,urlBase,BaseDatos)
   }
   showMessage({
           message: "Mensaje Enviado!!",
           description: "El mensaje fue enviado a la Comanda",
           type: "success",
      
         });
         setTimeout(() => setSalir(true),
         1000
       )      
   
}


useEffect(() => {
  const getLugares = async () => {
    const lug = await traerLugares(urlBase,BaseDatos)
    setLugares(lug)
  }
  const getMensajes = async () => {
    const mens = await traerMensajes(urlBase,BaseDatos) 
    setMensajes(mens)
  }
  getMensajes()
  getLugares()
  
  if (lugares.length > 0) {
    onChangeTextImpre(lugares[0].descripcion)
    setIdImpre(lugares[0].idImpresora)
    setIdSectImpre(lugares[0].idSectorExped)
  }
},[] )

 const puedeEnviar = text.trim() != '' && idImpre != 0

 return (

  <View style={{ flex: 1 }}>
     <View style={styles.container}>
        <Stack.Screen options={{headerTitle: () => <HeaderMesa nroMesa={ultMesa.nroMesa} descMesa={ultMesa.descMesa} comensales={comensales} />,
                    headerTitleAlign: 'center',
                    headerStyle: {
                                  backgroundColor: Colors.background,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                                    fontWeight: 'bold',
                    },
                    headerRight:() => <HeaderBotonCerrar onPress={() => handleSalir()} />
        }} />

        { salir ? <Redirect href="/mesas" /> : null }

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.seccion}>Mensajes x comanda</Text>
          <Text style={styles.titulo}>
            { selImpre ? 'Seleccionar Impresora' : selMensaje ? 'Seleccionar Mensaje' : 'Nuevo mensaje' }
          </Text>
        </View>

        {/* Formulario */}
        { !selImpre && !selMensaje ? (
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Mensaje */}
          <View style={styles.campo}>
            <View style={styles.campoHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.colorazulboton} />
              <Text style={styles.label}>Mensaje</Text>
              <Text style={styles.contador}>{text.length}/100</Text>
            </View>
            <TextInput
              multiline={true}
              numberOfLines={4}
              maxLength={100}
              style={styles.textInput}
              onChangeText={onChangeText}
              value={text}
              placeholder="Escriba el mensaje para la comanda"
              placeholderTextColor={Colors.backbotones}
            />
            <TouchableOpacity style={styles.btSecundario} onPress={() => setSelMensaje(true)} activeOpacity={0.7}>
              <Ionicons name="list" size={20} color={Colors.colorazulboton} />
              <Text style={styles.btSecundarioText}>Mensajes predefinidos</Text>
            </TouchableOpacity>
          </View>

          {/* Impresora */}
          <View style={styles.campo}>
            <View style={styles.campoHeader}>
              <Ionicons name="print-outline" size={18} color={Colors.colorazulboton} />
              <Text style={styles.label}>Impresora</Text>
            </View>
            <TouchableOpacity style={styles.selector} onPress={() => setSelImpre(true)} activeOpacity={0.7}>
              <Text
                style={[styles.selectorText, textImpre == '' ? styles.selectorPlaceholder : null]}
                numberOfLines={1}
              >
                {textImpre != '' ? textImpre : 'Seleccionar impresora'}
              </Text>
              <Ionicons name="chevron-down" size={22} color={Colors.background} />
            </TouchableOpacity>
          </View>

        </ScrollView>
        ) : null }

        {/* Lista de impresoras */}
        { selImpre ? (
          <ScrollView contentContainerStyle={styles.lista}>
            { lugares.map((l) => {
              const sel = l.idImpresora == idImpre && l.idSectorExped == idSectImpre
              return (
                <TouchableOpacity
                  key={l.idLugarExped.toString()+l.idSectorExped.toString()}
                  style={[styles.opcion, sel ? styles.opcionSel : null]}
                  onPress={() => handleLugar(l)}
                  activeOpacity={0.7}
                >
                  <View style={styles.opcionIcono}>
                    <Ionicons name="print" size={18} color="white" />
                  </View>
                  <Text style={styles.opcionText} numberOfLines={2}>{l.descripcion}</Text>
                  {sel ? <Ionicons name="checkmark-circle" size={24} color={Colors.colorcheckbox} /> : null}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        ) : null }

        {/* Lista de mensajes predefinidos */}
        { selMensaje ? (
          <ScrollView contentContainerStyle={styles.lista}>
            { mensajes.map((m) => {
              const sel = m.idMensaje == idMensaje
              return (
                <TouchableOpacity
                  key={m.idMensaje.toString()}
                  style={[styles.opcion, sel ? styles.opcionSel : null]}
                  onPress={() => handleMensaje(m)}
                  activeOpacity={0.7}
                >
                  <View style={styles.opcionIcono}>
                    <Ionicons name="chatbubble" size={16} color="white" />
                  </View>
                  <Text style={styles.opcionText} numberOfLines={3}>{m.descripcion}</Text>
                  {sel ? <Ionicons name="checkmark-circle" size={24} color={Colors.colorcheckbox} /> : null}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        ) : null }

        {/* Pie */}
        <View style={styles.cont_Pie}>
          { selImpre || selMensaje ? (
            <TouchableOpacity
              style={styles.btVolver}
              onPress={() => { setSelImpre(false); setSelMensaje(false) }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
              <Text style={styles.btText}>Volver</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.btEnviar, !puedeEnviar ? styles.btDeshabilitado : null]}
              onPress={handleGrabar}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.btText}>Enviar Mensaje</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlashMessage position="top" />
    </View>
 </View>

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
  seccion: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.itemsviejos,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.colorazulboton,
    marginTop: 2,
  },

  // --- Formulario ---
  form: {
    padding: 12,
    gap: 12,
  },
  campo: {
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.colorFondoCuenta,
  },
  campoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  contador: {
    fontSize: 12,
    color: Colors.itemsviejos,
  },
  textInput: {
    minHeight: 110,
    padding: 12,
    fontSize: 17,
    textAlignVertical: 'top',
    borderRadius: 12,
    backgroundColor: Colors.backsombra,
  },
  btSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.colorazulboton,
  },
  btSecundarioText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.colorazulboton,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.backsombra,
  },
  selectorText: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.background,
  },
  selectorPlaceholder: {
    fontWeight: 'normal',
    color: Colors.backbotones,
  },

  // --- Listas de seleccion ---
  lista: {
    padding: 12,
    gap: 8,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.colorFondoCuenta,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderLeftWidth: 4,
    borderLeftColor: Colors.colorborderubro,
  },
  opcionSel: {
    borderColor: Colors.colorcheckbox,
    borderLeftColor: Colors.colorcheckbox,
  },
  opcionIcono: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  opcionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: 'white',
  },

  // --- Pie ---
  cont_Pie: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.colorFondoCuenta,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  btEnviar: {
    flexDirection: 'row',
    gap: 8,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.colorfondoBoton,
  },
  btVolver: {
    flexDirection: 'row',
    gap: 8,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backbotones,
  },
  btDeshabilitado: {
    opacity: 0.5,
  },
  btText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  })

  export default mensajes
