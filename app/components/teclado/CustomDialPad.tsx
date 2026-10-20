import {
    StyleSheet,
    Text,
    View,
    Pressable,
    useWindowDimensions,
   } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DialpadKeypad from "../teclado/DialPadKeyPad";
import Colors from '../../../constants/Colors'

const dialPadContent = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "X"];

// Alto reservado para encabezado, display, boton y las opciones de mozos.tsx (config / version)
const altoReservadoVertical = 340;
// En horizontal el encabezado y el boton van al costado: solo se reserva header de pantalla y pie
const altoReservadoHorizontal = 190;

type CustomDialPadProps = {
  setPass: (code: number[]) => void;
};

const CustomDialPad = ({ setPass }: CustomDialPadProps) => {

// Se recalcula al rotar la pantalla
const { width, height } = useWindowDimensions();
const horizontal = width > height;

// Tamaño de tecla limitado por ancho y alto disponible para que entre en pantallas chicas y tablets
const dialPadSize = Math.max(
  48,
  horizontal
    ? Math.min((height - altoReservadoHorizontal) / 4 - 12, 80)
    : Math.min(width * 0.19, (height - altoReservadoVertical) / 4 - 12, 80)
);
const dialPadTextSize = dialPadSize * 0.4;

const panelWidth = horizontal ? Math.min(width * 0.9, 760) : Math.min(width * 0.9, 420);

const [code, setCode] = useState([]);
const onTerminar = () => {
   setPass(code)
}
const hayCodigo = code.length > 0;

const encabezado = (
           <View style={styles.header}>
              <View style={styles.iconoCirculo}>
                <Ionicons name="person" size={20} color={Colors.colorletrabotones} />
              </View>
              <Text style={styles.titulo}>Ingresar código</Text>
              
           </View>
)

const display = (
           <View style={[styles.textContainer, hayCodigo && styles.textContainerActivo]}>
              {hayCodigo ? (
                <Text style={styles.pinText} numberOfLines={1} adjustsFontSizeToFit>
                  {code.join(" ")}
                </Text>
              ) : (
                <Text style={styles.placeholder}>• • • •</Text>
              )}
           </View>
)

const teclado = (
           <View style={styles.keypadContainer}>
              <DialpadKeypad
                dialPadContent={dialPadContent}
                setCode={setCode}
                code={code}
                dialPadSize={dialPadSize}
                dialPadTextSize={dialPadTextSize}
              />
          </View>
)

const boton = (
          <View style={styles.valContainer}>
              <Pressable
                onPress={onTerminar}
                disabled={!hayCodigo}
                style={({ pressed }) => [
                  styles.valBoton,
                  !hayCodigo && styles.valBotonDeshabilitado,
                  pressed && styles.valBotonPresionado,
                ]}
              >
                <Ionicons name="log-in-outline" size={22} color={Colors.colorletrabotones} />
                <Text style={styles.valText}>Validar Mozo</Text>
              </Pressable>
          </View>
)

// Horizontal: encabezado, codigo y boton a la izquierda; teclado a la derecha
if (horizontal) {
  return (
        <View style={[styles.container, styles.containerHorizontal, { width: panelWidth }]}>
          <View style={styles.columnaInfo}>
            {encabezado}
            {display}
            {boton}
          </View>
          {teclado}
        </View>
  );
}

return (

        <View style={[styles.container, { width: panelWidth }]}>
           {encabezado}
           {display}
           {teclado}
           {boton}
        </View>

);
};

export default CustomDialPad ;

   const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors.background,
    },
    containerHorizontal: {
      flexDirection: "row",
      alignItems: "center",
      gap: 24,
    },
    columnaInfo: {
      flex: 1,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 10,
    },
    iconoCirculo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.colorfondoBoton,
      marginBottom: 6,
    },
    titulo: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors.colorletrabotones,
    },
    subtitulo: {
      fontSize: 13,
      color: Colors.itemsviejos,
      marginTop: 2,
    },
    textContainer: {
      justifyContent: "center",
      alignItems: "center",
      height: 54,
      marginHorizontal: 8,
      marginBottom: 10,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: Colors.colorFondoCuenta,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.08)",
    },
    textContainerActivo: {
      borderColor: Colors.colorazulboton,
    },
    pinText: {
      fontSize: 30,
      fontWeight: "bold",
      letterSpacing: 4,
      color: Colors.colorletrabotones,
    },
    placeholder: {
      fontSize: 26,
      letterSpacing: 6,
      color: Colors.backbotones,
    },
    keypadContainer: {
      marginBottom: 10,
    },
    valContainer: {
      marginBottom: 12,
    },
    valBoton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      height: 48,
      marginHorizontal: 8,
      borderRadius: 14,
      backgroundColor: Colors.colorfondoBoton,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 4,
      elevation: 4,
    },
    valBotonDeshabilitado: {
      opacity: 0.45,
    },
    valBotonPresionado: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    valText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.colorletrabotones,
      },
});
