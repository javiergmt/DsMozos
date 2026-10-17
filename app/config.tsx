import { View, Text, Button, SafeAreaView, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, Redirect } from 'expo-router'
import { useLoginStore } from './store/useLoginStore'
import * as SecureStore from 'expo-secure-store';
import { deconvPort, deconvUrl } from './Funciones/deConversion';
import { Conectar } from './ApiFront/Posts/PostDatos';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FlashMessage from "react-native-flash-message"
import { showMessage, hideMessage } from "react-native-flash-message";
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { datosApp } from './ApiFront/Types/BDTypes';
import { getMesas } from './ApiFront/Gets/GetDatos';

const config = () => {
  const {setUrl,urlBase,setDispId,setBaseDatos,BaseDatos,tipoListaPlatos,setTipoListaPlatos,setMesasConDesc} = useLoginStore()  
  const [text, onChangeText] = useState('');
  const [number, onChangeNumber] = useState('1234');
  const [disp, onChangeDisp] = useState('0');
  const [base, onChangeBase] = useState('');
  const [tipoLista, onChangeTipo] = useState('L');
  const [grabarOk, setGrabarOk] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { bottom, top, right, left } = useSafeAreaInsets();
  const [isOk, setIsOk] = useState(false)
  const [pass, onChangePass] = useState('')
  const [showPassword, setShowPassword] = useState(false); 
  
  const getConectar = async (clave:string): Promise<boolean> => {
   const datos = await Conectar(clave)
   const datosApp = datos["data"] as unknown as datosApp;
   
   console.log('datos en config',datosApp)
   if (datosApp['conectado']==1){          
      setUrl('http://0.0.0.0:1234/')
      save('url','http://0.0.0.0:1234/');
      setDispId('0')
      setBaseDatos('') 
      save('disp','0');
      save('bd','');  
      setTipoListaPlatos('');
      save('tipoLista','');  
      return false;
   } else {
      setUrl('http://'+datosApp['ipServer'].trim()+'/' )
      save('url','http://'+datosApp['ipServer'].trim()+'/' );
      setDispId(datosApp['ptoVta'].toString())
      setBaseDatos(datosApp['baseDatos'].trim())
      save('disp',datosApp['ptoVta'].toString());
      save('bd',datosApp['baseDatos'].trim());  
      setTipoListaPlatos("L");
      save('tipoLista',"L");   
      return true;
   }
 
  };

  async function validarPass() {
    if (pass == '6736' || pass == 'Rest0.s0ft') {
      setIsOk(true);
    } else {
      const conect = await getConectar(pass);
      if (!conect) {
        console.log('dispositivo no autorizado');
        showMessage({
        message: "ATENCION !!",
        description: "Este Dispositivo no esta autorizado para conectarse a la App RestoSoft.",
        type: "danger",
        });
      } else {
        setGrabarOk(true);
      }
     
    }
    
  } 


  async function save(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
  }

   const handleMesas = () => {
        const load = async () => {
          const { mesas, isError, isPending }  = await getMesas(-1,-1,urlBase,BaseDatos);
          if (!isError) {
            //console.log('mesas con descrip',mesas.filter(mesa => mesa.descMesa !== '' ).length > 0 );
            // contar las mesas con descripcion
            if ( mesas.filter(mesa => mesa.descMesa !== '' ).length > 0 ) {
              setMesasConDesc(true);            
            } else {
              setMesasConDesc(false);            
            }
          }
          return;
        }
        console.log('verificando mesas con descrip...');
        load();
     }

  const handleGrabar = () => {  
    setGrabarOk(true)
    setUrl('http://'+text+':'+number+'/')
    save('url','http://'+text+':'+number+'/');
    setDispId(disp)
    setBaseDatos(base)
    save('disp',disp);
    save('bd',base);  
    setTipoListaPlatos(tipoLista);
    save('tipoLista',tipoLista);  
  }

 

  useEffect(() => {
    async function getValueFor(key: string): Promise<string | null> {
    let result = await SecureStore.getItemAsync(key);
    handleMesas();
    return result
    }
  
    getValueFor('url').then((res) => {
      onChangeText(res === null ? '' : deconvUrl(res))
      onChangeNumber(deconvPort(res === null ? '' : res))
    })
    
    getValueFor('disp').then((res) => {
      onChangeDisp(res ?? '')
    }) 
       
    getValueFor('bd').then((res) => {
      onChangeBase(res ?? '')
    })

    getValueFor('tipoLista').then((res) => {
      onChangeTipo(res ?? '')
     
    })

   }, []);

  return (
    <View style={styles.container}>
    <FlashMessage position="top" />
      { isPending  &&
        <View >          
        <ActivityIndicator size="large" color="#0000ff"/> 
        </View>
      }
       
      { !isOk && 
        <View style={styles.container}>
          <Text style={styles.text}>Ingresar Clave</Text>
          <TextInput
            secureTextEntry={!showPassword} 
            style={styles.input}
            onChangeText={onChangePass}
            value={pass}   
           
          />    
          <View style={[{bottom, },styles.cont_Pie  ]}>
            <TouchableOpacity onPress={validarPass}> 
                <Text style={styles.textBtSalir}>Validar Clave</Text> 
            </TouchableOpacity>
          </View> 
          <View style={[{bottom, },styles.cont_Pie  ]}>
            <TouchableOpacity onPress={() => {setGrabarOk(true)}}> 
                <Text style={styles.textBtSalir}>Volver</Text> 
            </TouchableOpacity>
          </View> 
        </View>

      }

      { isOk &&
      <View style={styles.container}>
        <Text style={styles.text}>IP / Host</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}        
        />    
      
        <Text style={styles.text}>Port: </Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumber}
          value={number}
          keyboardType="numeric"
        />

        <Text style={styles.text}>Base de Datos: </Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeBase}
          value={base}
        />

        <Text style={styles.text}>Id Dispositivo: </Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeDisp}
          value={disp}
       
        />

        
        <Text style={styles.text}>Lista de Platos: </Text>
        <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center', marginLeft:60}}>
        <BouncyCheckbox 
        text="Lista"
        textStyle={{ color: "#ffffff" }}
        isChecked={tipoLista == 'L' ? true : false}
        onPress={() => onChangeTipo('L') } />
        <BouncyCheckbox         
        text="Botones"
        textStyle={{ color: "#ffffff" }}
        isChecked={tipoLista == 'B' ? true : false}
        onPress={() => onChangeTipo('B') } />
        </View>
        
         
        <View style={[{bottom, },styles.cont_Pie  ]}>
        
          <TouchableOpacity onPress={handleGrabar}> 
              <Text style={styles.textBtSalir}>Grabar</Text> 
          </TouchableOpacity>
        
        </View> 
      </View>
      }

      {grabarOk && <Redirect href='/' />}
  

     
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    //margin: 10,
    backgroundColor: Colors.background,
  },
  input: {
    fontSize: 20,
    fontWeight: 'bold',
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 5,
    borderRadius: 10,
    backgroundColor: Colors.backsombra,
    width: 300,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',  
    color: 'white',
    paddingTop: 10,
  },
  textBtSalir: {
    width:200,
    textAlign:'center',
    fontSize:20,
    fontWeight:'500',
    marginBottom:5,
    color:'white',
    //height:50,
    borderRadius:10,
    backgroundColor:Colors.colorfondoBoton,  
   
  },
  cont_Pie: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    width: '100%',
  },
  
});
export default config

function validarDisp(disp: string, urlBase: string) {
  throw new Error('Function not implemented.');
}


