import {
    StyleSheet,
    Text,
    View,
    Pressable,
   } from "react-native";
   import React from "react";
   import { Feather } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";


   const DialpadKeypad = ({
    dialPadContent,
    code,
    setCode,
    dialPadSize,
    dialPadTextSize,
   }) => {

    // Agrupa las teclas en filas de 3
    const filas = [];
    for (let i = 0; i < dialPadContent.length; i += 3) {
      filas.push(dialPadContent.slice(i, i + 3));
    }

    const onTecla = (item) => {
      if (item === "X") {
        setCode((prev) => prev.slice(0, -1));
      } else {
        setCode((prev) => [...prev, item]);
      }
    };

    return (
      <View style={styles.keypad}>
        {filas.map((fila, iFila) => (
          <View key={iFila} style={styles.fila}>
            {fila.map((item, iCol) => {
              // Espacio vacio del teclado: no clickeable
              if (item === "") {
                return (
                  <View
                    key={iCol}
                    style={{ width: dialPadSize, height: dialPadSize, margin: 6 }}
                  />
                );
              }

              const esBorrar = item === "X";
              return (
                <Pressable
                  key={iCol}
                  onPress={() => onTecla(item)}
                  // Mantener presionado borrar limpia todo el codigo
                  onLongPress={esBorrar ? () => setCode([]) : undefined}
                  disabled={esBorrar && code.length === 0}
                  android_ripple={{ color: "rgba(255,255,255,0.25)", borderless: true }}
                  style={({ pressed }) => [
                    styles.dialPadContainer,
                    esBorrar && styles.teclaBorrar,
                    {
                      width: dialPadSize,
                      height: dialPadSize,
                      borderRadius: dialPadSize / 2,
                    },
                    pressed && styles.teclaPresionada,
                    esBorrar && code.length === 0 && styles.teclaDeshabilitada,
                  ]}
                >
                  {esBorrar ? (
                    <Feather name="delete" size={dialPadTextSize * 0.85} color={Colors.colorletrabotones} />
                  ) : (
                    <Text style={[{ fontSize: dialPadTextSize }, styles.dialPadText]}>
                      {item}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    );
   };
   export default DialpadKeypad;

const styles = StyleSheet.create({
 keypad: {
   alignItems: "center",
 },
 fila: {
   flexDirection: "row",
   justifyContent: "center",
 },
 dialPadContainer: {
   justifyContent: "center",
   alignItems: "center",
   margin: 6,
   backgroundColor: Colors.colorFondoCuenta,
   borderWidth: 1,
   borderColor: "rgba(255,255,255,0.08)",
   // Sombra
   shadowColor: "#000",
   shadowOffset: { width: 0, height: 3 },
   shadowOpacity: 0.35,
   shadowRadius: 4,
   elevation: 4,
 },
 teclaBorrar: {
   backgroundColor: "transparent",
   borderColor: "transparent",
   shadowOpacity: 0,
   elevation: 0,
 },
 teclaPresionada: {
   backgroundColor: Colors.backbotones,
   transform: [{ scale: 0.94 }],
 },
 teclaDeshabilitada: {
   opacity: 0.35,
 },
 dialPadText: {
   color: Colors.colorletrabotones,
   fontWeight: "500",
 },
});
