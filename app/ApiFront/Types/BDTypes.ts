import { Float } from "react-native/Libraries/Types/CodegenTypes"

export default function BDTypes(){
  return null;
}

export type errorFetch = {
    isError: boolean,
    message: string
}

export type dispValido = {  
  valido?: number,
}

export type mozoType = {
    idMozo: number,
    nombre: string,
    direccion: string,
    telefono: string,
    activo: boolean,
    password: string,
    tecla: string,
    idTipoMozo: number,
    nroPager: string,
    orden: number,
}

export type sectoresType = {
    idSector: number,
    descripcion: string,
    comensales: number,
}

export type mesasType = {
    nroMesa: number,
    idSector: number,
    posTop: number,
    posLeft: number,
    width: number,
    height: number,
    ocupada: string,
    nro2: number ,
    idMozo: number ,
    forma: number,
    cerrada: number,
    cantSillas: number,
    cantPersonas: number,
    activa: boolean,
    conPedEnEspera: boolean,
    comiendo: boolean,
    pendiente: boolean,
    porCobrar: boolean,
    reservada: boolean,
    soloOcupada: boolean,
    conPostre: boolean,
    descMesa: string 
}

export type mesaType = {
    nroMesa: number,
    idSector: number,    
    ocupada: string,    
    idMozo: number ,    
    cerrada: number,   
    cantPersonas: number,
    activa: boolean, 
    soloOcupada: boolean,
    descMesa: string
}

export type mesaEncType ={
  nroMesa: number;
  idMozo: number;
  fecha: string;
  cerrada: number;
  porcDesc: number;
  cantPersonas: number;
  descPesos: number;
  fechaHoraImp: string;
  idCliente: number;
  idOcupacion: number;
  idSector: number;
  descMesa: string;
  nombre: string;
}

export type gustosDet = {
  idGusto: number;
  descripcion: string;
  idPlatoRel: number;
}

export type mesaDetType ={
  nroMesa: number;
  idPlato: number;
  idDetalle: number;
  cant: number;
  pcioUnit: number;
  importe: number;
  descripcion: string;
  obs: string;
  esEntrada: boolean;
  cocido: string;
  idTamanio?: number;
  descTam?: string;
  idSectorExped?: number;
  gustos?: gustosDet[];
  combos?: comboPostType[];
  idTipoConsumo: string;
  impCentralizada: number;
  detalles: string;

}

export type mesaDetGustosType ={
  nroMesa: number;
  idDetalle: number;
  idPlato: number;
  idGusto: number;
  descGusto: string;
  cant: number;
  idPlatoRel: number;
}

export type mesaDetModifType ={
  nroMesa: number;
  idDetalle: number;
  idPlato: number;
  idTamanio: number;
  descTam: string;
}

export type subRubrosType = {
    idSubRubro: number,
    descripcion: string,
    imagen: string,
    orden: number,
}

export type rubrosSubType = {
    idRubro: number,
    descripcion: string,
    orden: number,
    visualizacion: string,
    iconoApp: string,
    prefijo: string,
    subrubros: subRubrosType[]
}

export type platosType = {
   idPlato: number,
   descCorta: string,
   descripcion: string,
   pcioUnit: Float, 
   tamanioUnico: boolean,
   idTipoConsumo: string,
   idRubro: number,
   idSubRubro: number,
   cantgustos: number,
   codBarra: string,
   colorFondo: string,
   tecla: number,
   orden: number,
   shortCut: string,
   pedirCantAlCargar: boolean,
   impCentralizada: number, 
}

export type platosprecioType = {
  idPlato: number,
  pcioUnit: number,
  idSectorExped: number,
  impCentralizada: number,
}


export type paramType = {
  colorMesaCerrada: string;
  colorMesaComiendo: string;
  colorMesaComiendoEsperando: string;
  colorMesaEperando: string;
  colorMesaNormal: string;
  colorMesaOcupada: string;
  colorMesaPorCobrar: string;
  colorMesaSinPed: string;
  colorPostre: string;
  sucursal: number;
  activarSubEstadosMesa: boolean;
  modificaPrecioEnMesa: boolean;
  permiteDescLibre: boolean;
  permitePrecioCero: boolean;
  autorizarElimiarPlatoEnMesa: boolean;
  marcarMesaSinCobrar: boolean;
  mozosCierranMesa: boolean;
  mostrarRubroFavoritos: boolean;
  ocultarTotalMesaMozos: boolean;
  pedirMotElimRenglon: boolean;
  pedirCubiertos: boolean;
  idCubiertos: number;
  idTurnoCubierto: number;
  nombre: string;
  idPagWeb: number;
  nombreWeb: string;
  sector_ini: number;
  descripCub: string;
}

export type gustosType ={
  idPlato: number;
  idGusto: number;
  descGusto: string;
  idPlatoRel: number;
}

export type modifType ={
  idPlato: number;
  idTamanio: number;
  descTam: string;
}

export type comboSecType = {
  idSeccion: number;
  idPlato: number;
  descripcion: string;
  cantMax: number;
  orden: number;
  autocompletar: boolean;
  imprimirEnAceptacion: boolean;
  seleccionarUno: boolean;
  idTamanio: number;
  descCorta: string;
  tamanio: string;
  platoSel: number;
  idTipoConsumo: string;
}

export type comboInfoSecType = {
  idPlato: number;
  cant: number;
  descripcion: string;  
  idSeccion: number;
  descSeccion: string;  
  idTamanio: number;
  cantGustos: number;
  idTipoConsumo: string;
}

export type comboDetType = {
  idSeccion: number;
  idPlato: number;
  descripcion: string;
  idTamanio: number;
  descCorta: string;
  idTipoConsumo: string;
  cantGustos: number;
  tamanio: string;
  selected: boolean;
  idSectorExped?: number;
  impCentralizada?: number;
  comandado?: boolean;
  cantidad?: number;
}

//----------------------------------------------
// POST de MesaDet
//----------------------------------------------

export type mesaDetPost = {
  nroMesa: number;
  descMesa: string;
  idDetalle: number;
  idPlato: number;
  idTipoConsumo: string;
  cant: number;
  pcioUnit: number;
  importe: number;
  obs: string;
  idTamanio: number;
  tamanio: string;
  procesado: boolean;
  hora: string;
  idMozo: number;
  nombreMozo: string;
  idUsuario: number;
  cocinado: boolean;
  esEntrada: boolean;
  descripcion: string;
  fechaHora: string;
  comanda: boolean;
  idSectorExped?: number;
  impCentralizada?: number;
  gustos?: Gusto[];
  combos?: comboPostType[];
}

interface Gusto {
  idGusto: number;
  descripcion: string;
}


export type comboPostType = {
  idSeccion: number,
  idPlato: number,
  cant: number,
  procesado: boolean,
  idTamanio: number,
  tamanio: string,
  obs: string,
  cocinado: boolean,
  fechaHora: string,
  comanda: boolean,
  descripcion: string;
  idSectorExped?: number;
  impCentralizada?: number;
  combosGustos?: combosGustosType[]
}

export type combosGustosType ={
  idSeccion: number,
  idPlato: number,
  idGusto: number,
  descripcion: string;
  idPlatoRel: number;
}

export interface NoticiasType {
  idMozo: number;
  descNoticia: string;
}

export interface ReservasType{
    idReserva: number,
    fecha: Date,
    turno: number,
    descTurno: string,
    nombre: string,
    hora: string,
    cant: number,
    obs: string,
    telefono: number,
    idSector: number,
    sector: string,
    mesa: number,
    idCliente: number,
    nombreClie: string,
    confirmada: boolean,
    cumplida: boolean,
    usuario: string
}

export interface reservasConfCumpType{
  idReserva: number,
  confirmada: boolean,
  cumplida: boolean,

}

export interface turnosType{
    idTurno: number,
    descripcion: string,
    horaDesde: string,
    horaHasta: string,
    
}

export interface lugSectImpreType {
  idLugarExped: number,
  idSectorExped: number,
  idImpresora: number,
  descripcion: string,
}

export interface mensajesComandaType {
  idMensaje: number,
  descripcion: string,
  orden: number,
  nroMesa: number,
}

export interface comandaGustos
{
    descripcion : string,
   
}

export interface comandaPlatos
{
    cant: number,
    idTipoConsumo: string,
    descripcion: string,
    idSectorExped: number,
    impCentralizada : number,
    obs : string,
    tamanio : string, 
    esEntrada : boolean,
    gustos: comandaGustos[]
}

export interface comanda
{
    nroMesa: number,
    descMesa: string,
    idMozo: number,
    nombreMozo: string,
    comensales: number, 
    fechaHora: string, 
    platos: comandaPlatos[]
}

export interface datosApp
{
    idResto: number,
    ipServer: string,
    baseDatos: string,
    ptoVta: number, 
    conectado: number 
}

