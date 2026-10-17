import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Redirect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import FlashMessage from 'react-native-flash-message'
import { showMessage } from 'react-native-flash-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from '../constants/Colors'
import { Conectar } from './ApiFront/Posts/PostDatos'
import { datosApp } from './ApiFront/Types/BDTypes'
import { getMesas } from './ApiFront/Gets/GetDatos'
import { deconvPort, deconvUrl } from './Funciones/deConversion'
import { useLoginStore } from './store/useLoginStore'

const config = () => {
  const {
    setUrl,
    urlBase,
    setDispId,
    setBaseDatos,
    BaseDatos,
    setTipoListaPlatos,
    setMesasConDesc,
  } = useLoginStore()
  const [text, onChangeText] = useState('')
  const [number, onChangeNumber] = useState('1234')
  const [disp, onChangeDisp] = useState('0')
  const [base, onChangeBase] = useState('')
  const [tipoLista, onChangeTipo] = useState('L')
  const [grabarOk, setGrabarOk] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { bottom, top } = useSafeAreaInsets()
  const [isOk, setIsOk] = useState(false)
  const [pass, onChangePass] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const getConectar = async (clave: string): Promise<boolean> => {
    const datos = await Conectar(clave)
    const datosApp = datos['data'] as unknown as datosApp

    console.log('datos en config', datosApp)
    if (datosApp['conectado'] == 1) {
      setUrl('http://0.0.0.0:1234/')
      save('url', 'http://0.0.0.0:1234/')
      setDispId('0')
      setBaseDatos('')
      save('disp', '0')
      save('bd', '')
      setTipoListaPlatos('')
      save('tipoLista', '')
      return false
    } else {
      setUrl('http://' + datosApp['ipServer'].trim() + '/')
      save('url', 'http://' + datosApp['ipServer'].trim() + '/')
      setDispId(datosApp['ptoVta'].toString())
      setBaseDatos(datosApp['baseDatos'].trim())
      save('disp', datosApp['ptoVta'].toString())
      save('bd', datosApp['baseDatos'].trim())
      setTipoListaPlatos('L')
      save('tipoLista', 'L')
      return true
    }
  }

  async function validarPass() {
    if (pass == '6736' || pass == 'Rest0.s0ft') {
      setIsOk(true)
    } else {
      const conect = await getConectar(pass)
      if (!conect) {
        console.log('dispositivo no autorizado')
        showMessage({
          message: 'ATENCION !!',
          description: 'Este Dispositivo no esta autorizado para conectarse a la App DinnerSoft.',
          type: 'danger',
        })
      } else {
        setGrabarOk(true)
      }
    }
  }

  async function save(key: string, value: string) {
    await SecureStore.setItemAsync(key, value)
  }

  const handleMesas = () => {
    const load = async () => {
      const { mesas, isError } = await getMesas(-1, -1, urlBase, BaseDatos)
      if (!isError) {
        if (mesas.filter(mesa => mesa.descMesa !== '').length > 0) {
          setMesasConDesc(true)
        } else {
          setMesasConDesc(false)
        }
      }
      return
    }
    console.log('verificando mesas con descrip...')
    load()
  }

  const handleGrabar = () => {
    setGrabarOk(true)
    setUrl('http://' + text + ':' + number + '/')
    save('url', 'http://' + text + ':' + number + '/')
    setDispId(disp)
    setBaseDatos(base)
    save('disp', disp)
    save('bd', base)
    setTipoListaPlatos(tipoLista)
    save('tipoLista', tipoLista)
  }

  useEffect(() => {
    async function getValueFor(key: string): Promise<string | null> {
      const result = await SecureStore.getItemAsync(key)
      handleMesas()
      return result
    }

    getValueFor('url').then(res => {
      onChangeText(res === null ? '' : deconvUrl(res))
      onChangeNumber(deconvPort(res === null ? '' : res))
    })

    getValueFor('disp').then(res => {
      onChangeDisp(res ?? '')
    })

    getValueFor('bd').then(res => {
      onChangeBase(res ?? '')
    })

    getValueFor('tipoLista').then(res => {
      onChangeTipo(res ?? '')
    })
  }, [])

  return (
    <View style={styles.container}>
      <FlashMessage position="top" />
      {isPending && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.colorazulboton} />
        </View>
      )}
      {!isOk && (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: top + 24, paddingBottom: bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heading}>
            <View style={styles.headingIcon}>
              <Ionicons name="shield-checkmark-outline" size={28} color={Colors.colorazulboton} />
            </View>
            <Text style={styles.title}>Configuración protegida</Text>
            <Text style={styles.subtitle}>Ingresá la clave para continuar</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Clave de acceso</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="key-outline" size={20} color={Colors.itemsviejos} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChangePass}
                onSubmitEditing={validarPass}
                returnKeyType="done"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={pass}
              />
              <TouchableOpacity
                accessibilityLabel={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                accessibilityRole="button"
                onPress={() => setShowPassword(!showPassword)}
                style={styles.visibilityButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.itemsviejos}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={validarPass} style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Validar clave</Text>
              <Ionicons name="arrow-forward" size={19} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setGrabarOk(true)} style={styles.secondaryButton} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {isOk && (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: top + 20, paddingBottom: bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heading}>
            <View style={styles.headingIcon}>
              <Ionicons name="server-outline" size={28} color={Colors.colorazulboton} />
            </View>
            <Text style={styles.title}>Conexión</Text>
            <Text style={styles.subtitle}>Configurá el servidor y el dispositivo</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Servidor</Text>
            <Text style={styles.label}>IP / Host</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChangeText}
              placeholder="Ej. 192.168.1.10"
              placeholderTextColor="#999"
              style={styles.formInput}
              value={text}
            />

            <Text style={styles.label}>Puerto</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={onChangeNumber}
              placeholder="1234"
              placeholderTextColor="#999"
              style={styles.formInput}
              value={number}
            />

            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Dispositivo</Text>
            <Text style={styles.label}>Base de datos</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={onChangeBase}
              placeholder="Nombre de la base"
              placeholderTextColor="#999"
              style={styles.formInput}
              value={base}
            />

            <Text style={styles.label}>ID del dispositivo</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={onChangeDisp}
              placeholder="0"
              placeholderTextColor="#999"
              style={styles.formInput}
              value={disp}
            />

            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Presentación del menú</Text>
            <View style={styles.options}>
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{ selected: tipoLista === 'L' }}
                onPress={() => onChangeTipo('L')}
                style={[styles.option, tipoLista === 'L' && styles.optionSelected]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="list-outline"
                  size={21}
                  color={tipoLista === 'L' ? Colors.colorazulboton : Colors.itemsviejos}
                />
                <Text style={[styles.optionText, tipoLista === 'L' && styles.optionTextSelected]}>Lista</Text>
                <Ionicons
                  name={tipoLista === 'L' ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={tipoLista === 'L' ? Colors.colorazulboton : Colors.itemsviejos}
                />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{ selected: tipoLista === 'B' }}
                onPress={() => onChangeTipo('B')}
                style={[styles.option, tipoLista === 'B' && styles.optionSelected]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="grid-outline"
                  size={21}
                  color={tipoLista === 'B' ? Colors.colorazulboton : Colors.itemsviejos}
                />
                <Text style={[styles.optionText, tipoLista === 'B' && styles.optionTextSelected]}>Botones</Text>
                <Ionicons
                  name={tipoLista === 'B' ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={tipoLista === 'B' ? Colors.colorazulboton : Colors.itemsviejos}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleGrabar} style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Guardar configuración</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {grabarOk && <Redirect href="/" />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    alignItems: 'center',
    marginBottom: 22,
  },
  headingIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#393939',
    marginBottom: 14,
  },
  title: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.itemsviejos,
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: Colors.colorFondoCuenta,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4c4c4c',
    padding: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionSpacing: {
    borderTopWidth: 1,
    borderTopColor: '#515151',
    paddingTop: 18,
    marginTop: 8,
  },
  label: {
    color: '#d7d7d7',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrap: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292727',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  visibilityButton: {
    padding: 4,
  },
  formInput: {
    minHeight: 50,
    backgroundColor: '#292727',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  options: {
    gap: 10,
    marginBottom: 20,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  optionSelected: {
    borderColor: Colors.colorazulboton,
    backgroundColor: '#303d44',
  },
  optionText: {
    flex: 1,
    color: '#d7d7d7',
    fontSize: 15,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 13,
    backgroundColor: Colors.colorfondoBoton,
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#d7d7d7',
    fontSize: 15,
    fontWeight: '600',
  },
})

export default config
