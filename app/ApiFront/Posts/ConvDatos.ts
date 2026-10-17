import { getHoraActual } from "../../Funciones/deConversion"
import { comanda } from "../Types/BDTypes";

interface PostPlato {
    nroMesa: number;
    descMesa: string;
    idDetalle: number;
    idPlato: number;
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
    idSectorExped: number;
    idTipoConsumo: string;
    impCentralizada : number;
    gustos?: { idGust: number, descripcion: string }[];
    combos?: {
        idSeccion: number,
        idPlato: number,
        cant: number,
        procesado: boolean,
        idTamanio: number,
        obs: string,
        cocinado: boolean,
        fechaHora: string,
        comanda: boolean,
        descripcion: string,
        idSectorExped?: number,
        tamanio: string,
        combosGustos?: [
            {
                idSeccion: number,
                idPlato: number,
                idGusto: number,
                descripcion: string;
            },
        ];      
        }[];
};

export default function ConvDatos(){
    return null;
}

export function modificarPlatoPost(objeto: any): PostPlato {
    let result: PostPlato;
    
    result = {
        cant: objeto.cant,
        cocinado: objeto.cocinado,
        comanda: true,
        descripcion: objeto.descripcion,
        esEntrada: objeto.esEntrada,
        fechaHora: new Date().toISOString(),
        hora: getHoraActual(),
        idDetalle: objeto.idDetalle,
        idMozo: objeto.idMozo,
        nombreMozo: objeto.nombreMozo,
        idPlato: objeto.idPlato,
        idUsuario: objeto.idUsuario,
        idTamanio: objeto.idTamanio,
        importe: objeto.importe,
        nroMesa: objeto.nroMesa,
        descMesa: objeto.descMesa,
        pcioUnit: objeto.pcioUnit,
        procesado: objeto.procesado,
        obs: objeto.obs,
        tamanio: objeto.tamanio,
        idSectorExped: objeto.idSectorExped,
        idTipoConsumo: objeto.idTipoConsumo,
        impCentralizada: objeto.impCentralizada
        
    }
    if (objeto.combos) {
        result.combos = [...objeto.combos]
        //result.combos = objeto.combos
    }
    if (objeto.gustos) {
        result.gustos = objeto.gustos
    } 
    
    console.log("[MODIFICAR PLATO POST]: ",objeto, result)
    return result
}

export function modificarComandaPost(objeto: any): comanda {
    let result: comanda;
    
    result = {
        nroMesa: objeto.nroMesa,
        descMesa: objeto.descMesa,
        idMozo: objeto.idMozo,
        nombreMozo: objeto.nombreMozo,
        comensales: objeto.comensales, 
        fechaHora: new Date().toISOString(),
        platos: objeto.platos,
    }   
    console.log("[MODIFICAR COMANDA POST]: ",objeto, result)
    return result
}