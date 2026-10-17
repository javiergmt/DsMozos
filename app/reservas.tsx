import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";
import { useLoginStore } from "./store/useLoginStore";
import { getMesas, getReservas, getSectores, getTurnos } from "./ApiFront/Gets/GetDatos";
import {
  AbrirMesa,
  ConfCumpReserva,
  GrabarComensales,
  isSoloOcupada,
  LiberarMesa,
} from "./ApiFront/Posts/PostDatos";
import { mesasType, ReservasType, sectoresType, turnosType } from "./ApiFront/Types/BDTypes";
import { HeaderTitulo } from "../components/HeaderTitulo";
import Colors from "../constants/Colors";

const reservas = () => {
  const { getUrl, getBaseDatos, BaseDatos, mozo, setComensales } = useLoginStore();
  const urlBase = getUrl();
  const base = getBaseDatos();
  const [reservas, setReservas] = useState<ReservasType[]>([]);
  const [turnos, setTurnos] = useState<turnosType[]>([]);
  const [sectores, setSectores] = useState<sectoresType[]>([]);
  const [mesas, setMesas] = useState<mesasType[]>([]);
  const [fecha, setFecha] = useState(new Date());
  const [idTurnoSel, setIdTurnoSel] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [actualizacion, setActualizacion] = useState(0);
  const [reservaActiva, setReservaActiva] = useState<ReservasType | null>(null);
  const [sectorActivo, setSectorActivo] = useState<sectoresType | null>(null);
  const [cargandoMesas, setCargandoMesas] = useState(false);
  const [errorMesas, setErrorMesas] = useState("");
  const [accionEnCurso, setAccionEnCurso] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarFiltros = async () => {
      try {
        const [listaTurnos, listaSectores] = await Promise.all([
          getTurnos(urlBase, base),
          getSectores(urlBase, base, "-1"),
        ]);
        if (activo) {
          setTurnos(listaTurnos);
          setSectores(listaSectores);
        }
      } catch (error) {
        console.error("Error al cargar los filtros de reservas:", error);
        if (activo) {
          showMessage({
            message: "No se pudieron cargar los turnos y sectores",
            description: "Revisá la conexión con el servidor e intentá nuevamente.",
            type: "danger",
          });
        }
      }
    };

    cargarFiltros();
    return () => {
      activo = false;
    };
  }, [urlBase, base]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setErrorCarga("");

    getReservas(urlBase, base, fecha.toISOString(), idTurnoSel)
      .then((lista) => {
        if (activo) setReservas(lista.filter((reserva) => !reserva.cumplida));
      })
      .catch((error: unknown) => {
        console.error("Error al cargar las reservas:", error);
        if (activo) {
          setReservas([]);
          setErrorCarga("No pudimos cargar las reservas. Revisá la conexión e intentá de nuevo.");
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [urlBase, base, fecha, idTurnoSel, actualizacion]);

  const reservasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    if (!termino) return reservas;
    return reservas.filter((reserva) => reserva.nombre.toLocaleLowerCase().includes(termino));
  }, [reservas, busqueda]);

  const cambiarFecha = (dias: number) => {
    setFecha((actual) => new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() + dias));
  };

  const mostrarReservas = () => setActualizacion((valor) => valor + 1);

  const ocuparMesa = async (reserva: ReservasType, nroMesa: number) => {
    const ocupada = await isSoloOcupada(nroMesa, urlBase, base);
    if (ocupada) {
      showMessage({
        message: "Mesa ocupada",
        description: `La mesa ${nroMesa} ya está ocupada. Seleccioná otra.`,
        type: "danger",
      });
      return false;
    }

    await AbrirMesa(nroMesa, mozo, urlBase, base);
    await GrabarComensales(nroMesa, reserva.cant, urlBase, base);
    await LiberarMesa(nroMesa, false, urlBase, BaseDatos);
    await ConfCumpReserva(reserva.idReserva, true, true, urlBase, BaseDatos);
    setComensales(reserva.cant);
    setReservaActiva(null);
    setSectorActivo(null);
    mostrarReservas();
    showMessage({
      message: "Reserva atendida",
      description: `La mesa ${nroMesa} fue ocupada.`,
      type: "success",
    });
    return true;
  };

  const seleccionarReserva = async (reserva: ReservasType) => {
    if (accionEnCurso) return;
    setAccionEnCurso(true);
    try {
      if (!reserva.confirmada) {
        await ConfCumpReserva(reserva.idReserva, true, false, urlBase, BaseDatos);
        mostrarReservas();
        showMessage({
          message: "Reserva confirmada",
          description: `La reserva de ${reserva.nombre} quedó confirmada.`,
          type: "success",
        });
      } else if (reserva.mesa > 0) {
        setReservaActiva(reserva);
        await ocuparMesa(reserva, reserva.mesa);
      } else {
        setReservaActiva(reserva);
        setSectorActivo(null);
      }
    } catch (error) {
      console.error("Error al gestionar la reserva:", error);
      showMessage({
        message: "No se pudo completar la acción",
        description: "Intentá nuevamente. Si el problema continúa, revisá la conexión.",
        type: "danger",
      });
    } finally {
      setAccionEnCurso(false);
    }
  };

  const seleccionarSector = async (sector: sectoresType) => {
    setSectorActivo(sector);
    setCargandoMesas(true);
    setErrorMesas("");
    try {
      const resultado = await getMesas(sector.idSector, -1, urlBase, base);
      if (resultado.isError) {
        setErrorMesas("No pudimos cargar las mesas. Revisá la conexión e intentá de nuevo.");
        return;
      }
      setMesas(resultado.mesas.filter((mesa) => mesa.ocupada === "N"));
    } catch (error) {
      console.error("Error al cargar las mesas del sector:", error);
      showMessage({
        message: "No se pudieron cargar las mesas",
        description: "Intentá seleccionar el sector nuevamente.",
        type: "danger",
      });
      setSectorActivo(null);
    } finally {
      setCargandoMesas(false);
    }
  };

  const seleccionarMesa = async (mesa: mesasType) => {
    if (!reservaActiva || accionEnCurso) return;
    setAccionEnCurso(true);
    try {
      await ocuparMesa(reservaActiva, mesa.nroMesa);
    } catch (error) {
      console.error("Error al asignar la mesa a la reserva:", error);
      showMessage({
        message: "No se pudo asignar la mesa",
        description: "Intentá nuevamente. Si el problema continúa, revisá la conexión.",
        type: "danger",
      });
    } finally {
      setAccionEnCurso(false);
    }
  };

  const cerrandoAsignacion = () => {
    setReservaActiva(null);
    setSectorActivo(null);
    setMesas([]);
  };

  const tituloAsignacion = sectorActivo ? "Elegí una mesa" : "Elegí un sector";
  const fechaTexto = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlashMessage position="top" />
      <Stack.Screen
        options={{
          headerTitle: () => <HeaderTitulo icono="calendar-outline" titulo="RESERVAS" />,
          headerTitleAlign: "center",
        }}
      />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {reservaActiva ? (
          <>
            <View style={styles.encabezadoSeccion}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Volver a las reservas"
                style={styles.botonIcono}
                onPress={sectorActivo ? () => setSectorActivo(null) : cerrandoAsignacion}
              >
                <Ionicons name="arrow-back" size={21} color={Colors.colorazulboton} />
              </TouchableOpacity>
              <View style={styles.encabezadoTexto}>
                <Text style={styles.tituloSeccion}>{tituloAsignacion}</Text>
                <Text style={styles.subtitulo}>
                  {reservaActiva.nombre} · {reservaActiva.cant} personas
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cancelar asignación"
                style={styles.botonIcono}
                onPress={cerrandoAsignacion}
              >
                <Ionicons name="close" size={22} color={Colors.itemsviejos} />
              </TouchableOpacity>
            </View>
            {sectorActivo ? (
              cargandoMesas ? (
                <View style={styles.estado}>
                  <ActivityIndicator size="large" color={Colors.colorazulboton} />
                  <Text style={styles.estadoTexto}>Buscando mesas disponibles…</Text>
                </View>
              ) : errorMesas ? (
                <View style={styles.estado}>
                  <Ionicons name="cloud-offline-outline" size={36} color={Colors.colornjaboton} />
                  <Text style={styles.estadoTitulo}>No se pudieron cargar las mesas</Text>
                  <Text style={styles.estadoTexto}>{errorMesas}</Text>
                  <TouchableOpacity
                    style={styles.botonReintentar}
                    onPress={() => seleccionarSector(sectorActivo)}
                  >
                    <Text style={styles.botonReintentarTexto}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              ) : mesas.length > 0 ? (
                <View style={styles.opcionesGrid}>
                  {mesas.map((mesa) => (
                    <TouchableOpacity
                      key={mesa.nroMesa}
                      accessibilityRole="button"
                      style={[styles.opcionCard, styles.mesaCard]}
                      onPress={() => seleccionarMesa(mesa)}
                      disabled={accionEnCurso}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="restaurant-outline" size={23} color={Colors.colorazulboton} />
                      <Text style={styles.opcionTitulo}>Mesa {mesa.nroMesa}</Text>
                      <Text style={styles.opcionDetalle}>{mesa.descMesa || "Disponible"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.estado}>
                  <Ionicons name="search-outline" size={34} color={Colors.itemsviejos} />
                  <Text style={styles.estadoTitulo}>No hay mesas disponibles</Text>
                  <Text style={styles.estadoTexto}>Probá con otro sector.</Text>
                </View>
              )
            ) : (
              <View style={styles.opcionesGrid}>
                {sectores.map((sector) => (
                  <TouchableOpacity
                    key={sector.idSector}
                    accessibilityRole="button"
                    style={styles.opcionCard}
                    onPress={() => seleccionarSector(sector)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="grid-outline" size={23} color={Colors.colorazulboton} />
                    <Text style={styles.opcionTitulo}>{sector.descripcion}</Text>
                    <Text style={styles.opcionDetalle}>Ver mesas disponibles</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.fechaCard}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Día anterior"
                style={styles.navegarFecha}
                onPress={() => cambiarFecha(-1)}
              >
                <Ionicons name="chevron-back" size={23} color={Colors.colorazulboton} />
              </TouchableOpacity>
              <View style={styles.fechaCentro}>
                <Text style={styles.fechaEtiqueta}>AGENDA DEL DÍA</Text>
                <Text style={styles.fechaTexto}>{fechaTexto}</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Día siguiente"
                style={styles.navegarFecha}
                onPress={() => cambiarFecha(1)}
              >
                <Ionicons name="chevron-forward" size={23} color={Colors.colorazulboton} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonHoy} onPress={() => setFecha(new Date())}>
                <Text style={styles.botonHoyTexto}>Hoy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filtrosCard}>
              <View style={styles.busqueda}>
                <Ionicons name="search-outline" size={20} color={Colors.itemsviejos} />
                <TextInput
                  style={styles.inputBusqueda}
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar por nombre"
                  placeholderTextColor={Colors.itemsviejos}
                  returnKeyType="search"
                  accessibilityLabel="Buscar reservas por nombre"
                />
                {busqueda.length > 0 ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Limpiar búsqueda"
                    onPress={() => setBusqueda("")}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.itemsviejos} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.turnos}
              >
                <TouchableOpacity
                  style={[styles.chipTurno, idTurnoSel === 0 && styles.chipTurnoActivo]}
                  onPress={() => setIdTurnoSel(0)}
                >
                  <Text style={[styles.chipTexto, idTurnoSel === 0 && styles.chipTextoActivo]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                {turnos.map((turno) => (
                  <TouchableOpacity
                    key={turno.idTurno}
                    style={[
                      styles.chipTurno,
                      idTurnoSel === turno.idTurno && styles.chipTurnoActivo,
                    ]}
                    onPress={() => setIdTurnoSel(turno.idTurno)}
                  >
                    <Text
                      style={[
                        styles.chipTexto,
                        idTurnoSel === turno.idTurno && styles.chipTextoActivo,
                      ]}
                    >
                      {turno.descripcion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.listaEncabezado}>
              <View>
                <Text style={styles.tituloSeccion}>Reservas</Text>
                <Text style={styles.subtitulo}>
                  {reservasFiltradas.length} {reservasFiltradas.length === 1 ? "reserva" : "reservas"}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Actualizar reservas"
                style={styles.botonActualizar}
                onPress={mostrarReservas}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator size="small" color={Colors.colorazulboton} />
                ) : (
                  <Ionicons name="refresh-outline" size={21} color={Colors.colorazulboton} />
                )}
              </TouchableOpacity>
            </View>

            {cargando ? (
              <View style={styles.estado}>
                <ActivityIndicator size="large" color={Colors.colorazulboton} />
                <Text style={styles.estadoTexto}>Cargando reservas…</Text>
              </View>
            ) : errorCarga ? (
              <View style={styles.estado}>
                <Ionicons name="cloud-offline-outline" size={36} color={Colors.colornjaboton} />
                <Text style={styles.estadoTitulo}>No hay conexión</Text>
                <Text style={styles.estadoTexto}>{errorCarga}</Text>
                <TouchableOpacity style={styles.botonReintentar} onPress={mostrarReservas}>
                  <Text style={styles.botonReintentarTexto}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : reservasFiltradas.length > 0 ? (
              <View style={styles.lista}>
                {reservasFiltradas.map((reserva) => {
                  const confirmada = reserva.confirmada;
                  const accion = confirmada
                    ? reserva.mesa > 0
                      ? "Abrir mesa"
                      : "Asignar mesa"
                    : "Confirmar reserva";
                  return (
                    <TouchableOpacity
                      key={reserva.idReserva}
                      accessibilityRole="button"
                      accessibilityLabel={`${accion}: ${reserva.nombre}`}
                      style={styles.reservaCard}
                      onPress={() => seleccionarReserva(reserva)}
                      disabled={accionEnCurso}
                      activeOpacity={0.78}
                    >
                      <View style={styles.horaColumna}>
                        <Text style={styles.hora}>{reserva.hora}</Text>
                        <View style={styles.lineaHora} />
                      </View>
                      <View style={styles.detalleReserva}>
                        <View style={styles.nombreFila}>
                          <Text style={styles.nombre} numberOfLines={1}>{reserva.nombre}</Text>
                          <View style={[styles.estadoBadge, confirmada ? styles.confirmada : styles.pendiente]}>
                            <Text style={styles.estadoBadgeTexto}>
                              {confirmada ? "Confirmada" : "Pendiente"}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.datosReserva}>
                          <View style={styles.dato}>
                            <Ionicons name="people-outline" size={15} color={Colors.itemsviejos} />
                            <Text style={styles.datoTexto}>{reserva.cant} personas</Text>
                          </View>
                          {reserva.mesa > 0 ? (
                            <View style={styles.dato}>
                              <Ionicons name="restaurant-outline" size={15} color={Colors.itemsviejos} />
                              <Text style={styles.datoTexto}>Mesa {reserva.mesa}</Text>
                            </View>
                          ) : null}
                          {reserva.sector ? (
                            <View style={styles.dato}>
                              <Ionicons name="location-outline" size={15} color={Colors.itemsviejos} />
                              <Text style={styles.datoTexto}>{reserva.sector}</Text>
                            </View>
                          ) : null}
                        </View>
                        {reserva.obs ? (
                          <Text style={styles.observacion} numberOfLines={2}>{reserva.obs}</Text>
                        ) : null}
                        <View style={styles.accionFila}>
                          <Text style={styles.accionTexto}>{accion}</Text>
                          <Ionicons name="arrow-forward" size={16} color={Colors.colorazulboton} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.estado}>
                <Ionicons name="calendar-clear-outline" size={40} color={Colors.itemsviejos} />
                <Text style={styles.estadoTitulo}>
                  {busqueda ? "No encontramos coincidencias" : "Día sin reservas"}
                </Text>
                <Text style={styles.estadoTexto}>
                  {busqueda
                    ? "Probá con otro nombre o limpiá la búsqueda."
                    : "Cuando haya reservas para esta fecha, aparecerán acá."}
                </Text>
              </View>
            )}
          </>
        )}

        <Link href="/mozos" replace asChild>
          <TouchableOpacity accessibilityRole="button" style={styles.botonSalir}>
            <Ionicons name="log-out-outline" size={19} color="#fff" />
            <Text style={styles.botonSalirTexto}>Volver</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>

      {accionEnCurso ? (
        <View style={styles.capaCarga}>
          <ActivityIndicator size="large" color={Colors.colorazulboton} />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default reservas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contenido: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
  },
  fechaCard: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#343131",
    borderWidth: 1,
    borderColor: "#484343",
  },
  navegarFecha: {
    width: 38,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  fechaCentro: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  fechaEtiqueta: {
    color: Colors.colorazulboton,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  fechaTexto: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textTransform: "capitalize",
    textAlign: "center",
  },
  botonHoy: {
    borderRadius: 10,
    backgroundColor: "#484343",
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  botonHoyTexto: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  filtrosCard: {
    marginTop: 14,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#343131",
    borderWidth: 1,
    borderColor: "#484343",
  },
  busqueda: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: "#242222",
  },
  inputBusqueda: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 9,
  },
  turnos: {
    gap: 8,
    paddingTop: 12,
  },
  chipTurno: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#242222",
    borderWidth: 1,
    borderColor: "#4c4747",
  },
  chipTurnoActivo: {
    backgroundColor: Colors.colorfondoBoton,
    borderColor: Colors.colorfondoBoton,
  },
  chipTexto: {
    color: "#d1cccc",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextoActivo: {
    color: "#fff",
  },
  listaEncabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  tituloSeccion: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitulo: {
    color: Colors.itemsviejos,
    fontSize: 12,
    marginTop: 3,
  },
  botonActualizar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#343131",
  },
  lista: {
    gap: 10,
  },
  reservaCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#343131",
    borderWidth: 1,
    borderColor: "#484343",
  },
  horaColumna: {
    width: 54,
    alignItems: "flex-start",
    paddingTop: 2,
  },
  hora: {
    color: Colors.colorazulboton,
    fontSize: 15,
    fontWeight: "800",
  },
  lineaHora: {
    width: 1,
    flex: 1,
    minHeight: 34,
    marginTop: 8,
    marginLeft: 19,
    backgroundColor: "#555050",
  },
  detalleReserva: {
    flex: 1,
    minWidth: 0,
  },
  nombreFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  nombre: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  estadoBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confirmada: {
    backgroundColor: "#244336",
  },
  pendiente: {
    backgroundColor: "#56441f",
  },
  estadoBadgeTexto: {
    color: "#f4f1e8",
    fontSize: 10,
    fontWeight: "700",
  },
  datosReserva: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 9,
  },
  dato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  datoTexto: {
    color: "#c5bfbf",
    fontSize: 11,
  },
  observacion: {
    color: "#a9a2a2",
    fontSize: 12,
    marginTop: 9,
  },
  accionFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#575151",
  },
  accionTexto: {
    color: Colors.colorazulboton,
    fontSize: 12,
    fontWeight: "700",
  },
  estado: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 42,
  },
  estadoTitulo: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  estadoTexto: {
    color: Colors.itemsviejos,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: "center",
  },
  botonReintentar: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.colorfondoBoton,
  },
  botonReintentarTexto: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  botonSalir: {
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 13,
    backgroundColor: Colors.colorfondoBoton,
    marginTop: 24,
  },
  botonSalirTexto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  encabezadoSeccion: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  botonIcono: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#343131",
  },
  encabezadoTexto: {
    flex: 1,
    marginHorizontal: 12,
  },
  opcionesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  opcionCard: {
    width: "47%",
    minHeight: 112,
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#343131",
    borderWidth: 1,
    borderColor: "#484343",
  },
  mesaCard: {
    width: "30%",
    alignItems: "center",
  },
  opcionTitulo: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 9,
  },
  opcionDetalle: {
    color: Colors.itemsviejos,
    fontSize: 11,
    marginTop: 4,
  },
  capaCarga: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});
