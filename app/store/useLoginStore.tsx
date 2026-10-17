import { dispValido } from '../ApiFront/Types/BDTypes';
import { create } from 'zustand';
import { mozoType, rubrosSubType, paramType, platosType,
    mesaType, mesaDetType , mesaDetGustosType, mesaDetModifType} from '../ApiFront/Types/BDTypes';
//import { getMozoPass } from '../ApiFront/Gets/GetMozoPass';


// regex para replazar json de web to interface: (\w+)\s(\d|".*"|\w+)\n
// boolean type -> :true|false(,\n\s+\w+:)
// string type -> :"\w+\s\d+"|:"\w+"|:""
// number type -> :\d+(,\n\s+\w+:)
// array type -> :\[(\d|".*"|\w+)(,\n\s+\w+:)*\]


interface LoginStoreState {
    isLoggedIn: boolean,
    mozo: mozoType,
    getMozoId: () => number | undefined,
    getMozoName: () => string | undefined,
    setMozoId: (id:number) => void,
    setMozoName: (name:string) => void,
    getIdTipoMozo: () => number | undefined,
    setIdTipoMozo: (id:number) => void,
  
    urlBase: string,
    getUrl: () => string,
    setUrl: (url:string) => void,

    BaseDatos: string,
    getBaseDatos: () => string,
    setBaseDatos: (url:string) => void,

    Rubros: rubrosSubType[],
    getRubros: () => rubrosSubType[],
    setRubros: (rubros:rubrosSubType[]) => void

    ultSector: number,
    getUltSector: () => number,
    setUltSector: (sector:number) => void

    ultMesa: mesaType,
    getUltMesa: () => mesaType,
    setUltMesa: (item:mesaType) => void

    comensales: number,
    getComensales: () => number,
    setComensales: (sector:number) => void,

    idPlatoCub: number,
    getIdPlatoCub: () => number,
    setIdPlatoCub: (sector:number) => void,

    Param: paramType[],
    getParam: () => paramType[],
    setParam: (param:paramType[]) => void,

    ultItem: platosType,
    getUltItem: () => platosType,
    setUltItem: (item:platosType) => void,

    mesaDet: mesaDetType[],
    getMesaDet: () => mesaDetType[],
    setMesaDet: (mesaDet:mesaDetType[]) => void,
    
    mesaDetGustos: mesaDetGustosType[],
    getMesaDetGustos: () => mesaDetGustosType[],
    setMesaDetGustos: (mesaDet:mesaDetGustosType[]) => void,

    mesaDetModif: mesaDetModifType[],
    getMesaDetModif: () => mesaDetModifType[],
    setMesaDetModif: (mesaDet:mesaDetModifType[]) => void,

    ultDetalle: number,
    getUltDetalle: () => number,
    setUltDetalle: (ultDetalle:number) => void,

    origDetalle: number,
    getOrigDetalle: () => number,
    setOrigDetalle: (origDetalle:number) => void,

    dispId: string,
    getDispId: () => string,
    setDispId: (disp:string) => void,

    ultDescTam: string,
    getUltDescTam: () => string,
    setUltDescTam: (disp:string) => void,

    ultRubro: number,
    getUltRubro: () => number,
    setUltRubro: (rubro:number) => void,

    ultRubSub: string,
    getUltRubSub: () => string,
    setUltRubSub: (rubsub:string) => void,

    tipoListaPlatos: string,
    getTipoListaPlatos: () => string,
    setTipoListaPlatos: (tipo:string) => void,

    totMesa: number,
    getTotMesa: () => number,
    setTotMesa: (total:number) => void,

    mesasConDesc: boolean,
    getMesasConDesc: () => boolean,
    setMesasConDesc: (mesasConDesc:boolean) => void,
}

export const useLoginStore = create<LoginStoreState>(
    // @ts-ignore
    (set, get) => ({
        
        mozo: initMozo(),
        isLoggedIn: false,
        urlBase: '', 
        BaseDatos: 'RestoBar',
        Rubros: [],
        ultSector: 2,
        ultMesa: initMesa(),
        comensales: 0,
        idPlatoCub: 0,
        Param:[],
        ultItem: initItem(), 
        mesaDet: [],
        mesaDetGustos: [],
        mesaDetModif: [],
        ultDetalle:0,
        origDetalle:0,
        dispId:'0',
        ultDescTam:'',
        ultRubro:0,
        ultRubSub:'',
        tipoListaPlatos:'L',
        mesasConDesc:false,
        

        getMozoId: () => get().mozo?.idMozo,
        getMozoName: () => get().mozo?.nombre,
        setMozoId: (id:number) => set({mozo:{...get().mozo, idMozo:id}}),
        setMozoName: (name:string) => set({mozo:{...get().mozo, nombre:name}}),
        getIdTipoMozo: () => get().mozo?.idTipoMozo,
        setIdTipoMozo: (id:number) => set({mozo:{...get().mozo, idTipoMozo:id}}),
       

        getUrl: () => get().urlBase,
        setUrl: (url:string) => set({urlBase:url}),

        getBaseDatos: () => get().BaseDatos,
        setBaseDatos: (base:string) => set({BaseDatos:base}),

        getRubros: () => get().Rubros,
        setRubros: (rubros:rubrosSubType[]) => set({Rubros:rubros}),

        getUltSector: () => get().ultSector,
        setUltSector: (sector:number) => set({ultSector:sector}),

        getUltMesa: () => get().ultMesa,
        setUltMesa: (mesa:mesaType) => set({ultMesa:mesa}),

        getComensales: () => get().comensales,
        setComensales: (comens:number) => set({comensales:comens}),

        getIdPlatoCub: () => get().idPlatoCub,
        setIdPlatoCub: (id:number) => set({idPlatoCub:id}),

        getParam: () => get().Param,
        setParam: (param:paramType[]) => set({Param:param}),

        getUltItem: () => get().ultItem,
        setUltItem: (item:platosType) => set({ultItem:item}),

        getMesaDet: () => get().mesaDet,
        setMesaDet: (mesaDet:mesaDetType[]) => set({mesaDet:mesaDet}),  
          
        getUltDetalle: () => get().ultDetalle,
        setUltDetalle: (ultdet:number) => set({ultDetalle:ultdet}),

        getOrigDetalle: () => get().origDetalle,
        setOrigDetalle: (origdet:number) => set({origDetalle:origdet}),

        getMesaDetGustos: () => get().mesaDetGustos,
        setMesaDetGustos: (mesaDet:mesaDetGustosType[]) => set({mesaDetGustos:mesaDet}),

        getMesaDetModif: () => get().mesaDetModif,  
        setMesaDetModif: (mesaDet:mesaDetModifType[]) => set({mesaDetModif:mesaDet}),

        getDispId: () => get().dispId,
        setDispId: (disp:string) => set({dispId:disp}),

        getUltDescTam: () => get().ultDescTam,
        setUltDescTam: (desc:string) => set({ultDescTam:desc}),

        getUltRubro: () => get().ultRubro,
        setUltRubro: (rubro:number) => set({ultRubro:rubro}),

        getUltRubSub: () => get().ultRubSub,
        setUltRubSub: (rubsub:string) => set({ultRubSub:rubsub}),

        getTipoListaPlatos: () => get().tipoListaPlatos,
        setTipoListaPlatos: (tipo:string) => set({tipoListaPlatos:tipo}),

        getTotMesa: () => get().totMesa,
        setTotMesa: (total:number) => set({totMesa:total}),

        getMesasConDesc: () => get().mesasConDesc,
        setMesasConDesc: (mesasConDesc:boolean) => set({mesasConDesc:mesasConDesc}),
    }))
export default useLoginStore;

function initMozo(): mozoType {
    
    return {
        idMozo: -1, nombre: "", direccion: "", telefono: "", activo: false, password: "", tecla: "", idTipoMozo: 0, nroPager: "", orden: 0
    }

}

function initItem(): platosType {
return {
    idPlato:0,descCorta:'',descripcion:'',pcioUnit:0,idTipoConsumo:'',tamanioUnico:false,
    idRubro:0,idSubRubro:0,cantgustos:0,codBarra:'',colorFondo:'',tecla:0,orden:0,
    shortCut:'',pedirCantAlCargar:false,impCentralizada:0
}
}

function initMesa(): mesaType {
    return {
        nroMesa: 0, idSector: 0, ocupada: '', idMozo: 0, cerrada: 0, cantPersonas: 0, activa: false,soloOcupada:false,descMesa:''
    }
}






