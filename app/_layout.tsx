import { Stack } from "expo-router"
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLoginStore } from "./store/useLoginStore";
import { Image, View } from 'react-native'
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import AvisoConexion, { MonitorConexion, colorAviso } from '../components/AvisoConexion';
import { useCola } from '../servicios/colaComandas';
import React from "react";
import { HeaderTitulo, headerTheme } from '../components/HeaderTitulo'
import { DialogoHost } from '../components/Dialogo'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { configurarOrientacion } from '../constants/Dispositivo'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Celulares fijos en vertical, tablets pueden rotar
configurarOrientacion();

export default function StackLayout()  {
    
    const { mozo,setUrl,setDispId} = useLoginStore();
    // Aviso de conexion / comandas pendientes (cola de comandas)
    const insets = useSafeAreaInsets();
    const { trabajos, servidorOk } = useCola();
    const conAviso = servidorOk === false || trabajos.length > 0;
    const conError = trabajos.filter((t) => !!t.error).length;
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
      });
       
     useEffect(() => {
        if (error) throw error;
      }, [error]);
    
      useEffect(() => {       
        if (loaded) {
          SplashScreen.hideAsync();
        }
      }, [loaded]);

      if (!loaded) {
        return null;
      }

    return (
        <>
        <StatusBar style="light" />
        <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
        <MonitorConexion />
        <DialogoHost />
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {/* Franja de aviso arriba de todo; ocupa el margen superior para que el header no lo repita */}
        {conAviso ? (
          <View style={{ paddingTop: insets.top, backgroundColor: colorAviso(servidorOk, conError) }}>
            <AvisoConexion />
          </View>
        ) : null}
        <SafeAreaInsetsContext.Provider value={conAviso ? { ...insets, top: 0 } : insets}>

        <Stack
            screenOptions={headerTheme}>

            <Stack.Screen name="index" options={{headerTitle: 'DinnerSoft',
                                                 headerTitleAlign: 'center'                                                 
                                                 }} />
                                             
            <Stack.Screen name="mesas" options={{headerTitle: () => <HeaderTitulo icono="person-circle-outline" titulo={mozo.nombre} subtitulo={`Mozo: (${mozo.idMozo})`} />, headerTitleAlign: 'center'}}/>    
            
            <Stack.Screen name="reservas" options={{headerTitle: () => <HeaderTitulo icono="person-circle-outline" titulo={mozo.nombre} subtitulo={`Mozo: (${mozo.idMozo})`} />, headerTitleAlign: 'center'}}/>    

            <Stack.Screen name="mozos" options={{headerTitle: () => ( // App Logo
              <Image
                style={{ width: 300, height: 100 }}
                source={require('../assets/logo-rs-2.png')}
                resizeMode='contain'
              />
            ), headerTitleAlign: 'center'}}/>   

            <Stack.Screen name="(tabs)" options={{headerShown: false}}  />     
            
            <Stack.Screen name="config" options={{headerTitle: 'Configuracion', headerTitleAlign: 'center'}}/>                            
      
            </Stack>
        </SafeAreaInsetsContext.Provider>
        </View>
        </BottomSheetModalProvider>
        </GestureHandlerRootView>
        </>
    );

  }