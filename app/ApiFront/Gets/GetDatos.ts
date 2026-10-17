import { comboInfoSecType, NoticiasType, platosprecioType, rubrosSubType, turnosType, mensajesComandaType, lugSectImpreType, gustosDet, datosApp } from './../Types/BDTypes';

import { mozoType,sectoresType,mesasType,platosType,paramType,gustosType,
    modifType,mesaEncType,mesaDetType, comboSecType, comboDetType,ReservasType,
    dispValido} from '../Types/BDTypes'
import { getHoraActual } from '../../Funciones/deConversion';

//const urlBase = "http://192.168.1.103:1234/"

export default function GetDatos(){
    return null;
}

export const GetMozoPass = async(id:any,url:string,base:string): Promise<{data: mozoType[], isError: boolean, isPending: boolean}> => {
    // Cuando Agrego algun control de errores, deja de funcionar
    let isPending = true
    let isError = false
    try {
        const response = await fetch(url+`mozos_pass/${id}`,
            {   method: 'get', 
                headers: new Headers({
                  'bd': base,
                })
            }
        )
        const data = await response.json()
        console.log('mozo: ',data)
        return {data,isError,isPending}
     } catch (e) { 
        console.log('Error: ',e)
        isError = true   
        isPending = false     
        return {data:[],isError,isPending}
      }    
   
}

export const getParamMozos = async(url:string,base:string): Promise<{param:paramType[],isError:string,isPending:boolean}> => {    
    let isPending = true
    let isError = ''
    
    try {
        const response = await fetch(url+'param_mozos',
            {   method: 'get', 
                headers: new Headers({
                  'bd': base,
                })
            }
        )
        const param = await response.json()
        //console.log('url:',url,' - param: ',param)
        isPending = false
        isError = ''
        return {param,isError,isPending}
     } catch (e) { 
        console.log('Error en Params: ',e)
        isError = e.message     
        
        return {param:[],isError,isPending}
      } 
}


export const getSectores = async(url:string,base:string,disp:string): Promise<sectoresType[]> => {
    const response = await fetch(url+`sectores/100/${disp}/1`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    //console.log('sectores: ',data)
    return (data)
}

export const getMesas = async(idSector:number,mesa:number, url:string,base:string): Promise<{mesas:mesasType[],isError:boolean,isPending:boolean}> => {    
    let isPending = true
    let isError = false
    try {
        const response = await fetch(url+`mesas/100/${idSector}/${mesa}`,
            {   method: 'get', 
                headers: new Headers({
                  'bd': base,
                })
            }
        )
        const mesas = await response.json()
        //console.log('Mesas url:',url,' - base: ',base)
        isPending = false
        let isError = false
        return {mesas,isError,isPending}
     } catch (e) { 
        console.log('Error en Params: ',e)
        isError = true        
        
        return {mesas:[],isError,isPending}
      } 

}

export const getRubrosSub = async(url:string,base:string,disp:string): Promise<{rubros:rubrosSubType[],isError:boolean,isPending:boolean}> => {
  
    let isPending = true
    let isError = false
    
    try {
        const response = await fetch(url+`rubros_sub/${disp}/0/0`,
            {   method: 'get', 
                headers: new Headers({
                  'bd': base,
                })
            }
        )
        const rubros = await response.json()
        //console.log('url: ',url,' - base: ',base,' - Rubros: ',rubros)
        isPending = false
        let isError = false
        return {rubros,isError,isPending}
     } catch (e) { 
        console.log('Error en Rubros: ',e,' url:',url)
        isError = true        
        isPending = true
        return {rubros:[],isError,isPending}
      } 
}

export const getPlatos = async(tipo:string,cadena:string,idRubro:string,idSubRubro:string,dispId:string,url:string,base:string): Promise<platosType[]> => {
    const response = await fetch(url+`platos/${tipo}/${cadena}/${idRubro}/${idSubRubro}/${dispId}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    //console.log('platos: ',idRubro,data)
    return data
}

export const getPlato_Precio = async(idPlato:number,idTam:number,idSector:number,hora:string,url:string,base:string): Promise<platosprecioType[]> => {
    const response = await fetch(url+`plato_precio/${idPlato}/${idTam}/${idSector}/${hora}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    //console.log('plato_precio: ',data)
    return data
}

export const getGustos = async(idPlato:number,url:string,base:string): Promise<gustosType[]> => {
    const response = await fetch(url+`platos_gustos/${idPlato}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    //console.log('gustos: ',data)
    return data
}

export const getModif = async(idPlato:number,idSector:number,url:string,base:string): Promise<modifType[]> => {
    const response = await fetch(url+`platos_tamanios/${idPlato}/${idSector}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    //console.log('gustos: ',data)
    return data
}

export const getMesaEnc = async(idMesa:number,url:string,base:string): Promise<mesaEncType[]> => {
    const response = await fetch(url+`mesa_enc/${idMesa}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    //console.log('gustos: ',data)
    return data
}

export const getMesaDet = async(idMesa:number,url:string,base:string):
    Promise<{ cuenta:mesaDetType[],isError:boolean,isPending:boolean}> => {
    
  
    // const response = await fetch(url+`mesa_det/${idMesa}/0`)
    // const data = await response.json()
    // console.log('mesaDet: ',data)
    // return data

    let isPending = true
    let isError = false
    
    try {
        const response = await fetch(url+`mesa_det/${idMesa}/0/0`,
            {   method: 'get', 
                headers: new Headers({
                  'bd': base,
                })
            }
        )
        const cuenta = await response.json()
        //console.log('url: ',url,' - Rubros: ',rubros)
        isPending = false
        let isError = false
        return {cuenta,isError,isPending}
     } catch (e) { 
        console.log('Error en MesaDet: ',e,' url:',url)
        isError = true        
        isPending = true
        return {cuenta:[],isError,isPending}
      } 
}

export const getInfoGustos = async(nroMesa:number,idDetalle:number,url:string,base:string): Promise<gustosDet[]> => {
    const response = await fetch(url+`plato_info_gustos/${nroMesa}/${idDetalle}/0`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    console.log('infoGustos: ',data)
    return data
}

export const getComboSec = async(idPlato:number,url:string,base:string): Promise<comboSecType[]> => {
    const response = await fetch(url+`combo_sec/${idPlato}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    console.log('comboSec: ',data)
    return data
}

export const getInfoComboSec = async(nromesa:number,idDetalle:number,idPedido:number,url:string,base:string): Promise<comboInfoSecType[]> => {
    const response = await fetch(url+`plato_info_combo/${nromesa}/${idDetalle}/${idPedido}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()
    console.log('InfoComboSec: ',data)
    return data
}

export const getComboDet = async(idSeccion:number,url:string,base:string): Promise<comboDetType[]> => {
    const response = await fetch(url+`combo_det/${idSeccion}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()    
    console.log('comboDet: ',data)
    return data
}

export const getNoticias = async(url:string,base:string): Promise<NoticiasType[]> => {
    const response = await fetch(url+`noticias_mozos`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()    
    console.log('noticias: ',data)
    return data
}

export const getReservas = async(url:string,base:string,fecha:string,turno:number): Promise<ReservasType[]> => {
    const response = await fetch(url+`reservas/${fecha}/${fecha}/${turno}`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()    
    //console.log('reservas: ',data)
    return data
}

export const getTurnos = async(url:string,base:string): Promise<turnosType[]> => {
    const response = await fetch(url+`reservas_turnos`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()    
    console.log('turnos: ',data)
    return data
}

export const getMensajesComanda = async(url:string,base:string): Promise<mensajesComandaType[]> => {
    const response = await fetch(url+`mensajes_comanda`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()    
    console.log('Mensajes: ',data)
    return data
}

export const getLugaresSectores = async(url:string,base:string): Promise<lugSectImpreType[]> => {
    const response = await fetch(url+`lugSectImpre`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const data = await response.json()    
    console.log('Lugares: ',data)
    return data
}
