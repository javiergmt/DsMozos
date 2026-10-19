
import { mozoType,mesaDetPost, ReservasType, comanda, datosApp } from "../Types/BDTypes"
import { modificarComandaPost, modificarPlatoPost } from "./ConvDatos"
import { showToast } from '../../Funciones/deInfo'
import { mostrarDialogo } from '../../../components/Dialogo'

export default function PostDatos(){
    return null;
}

const requestOptionPost = (parametros: object, operacion = 'POST',base:string) => {
    // console.log("PARAMETROS: ", JSON.stringify(parametros), " OPERACION: ", operacion)
    return {
        method: operacion,
        headers: {'Content-Type': 'application/json',
                  'bd': base
        },
        body: JSON.stringify(parametros)
    }
}

export const isOcupada = async (nroMesa: number, url:string, base:string) => {
    const response = await fetch(url+ "mesa/" + `${nroMesa}/-1`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const mesa = await response.json()
    console.log("MESA: ", mesa[0])
    return (mesa[0]?.cerrada == 2 )
 
}

export const isSoloOcupada = async (nroMesa: number, url:string, base:string) => {
    const response = await fetch(url+ "mesa/" + `${nroMesa}/-1`,
        {   method: 'get', 
            headers: new Headers({
              'bd': base,
            })
        }
    )
    const mesa = await response.json()
    console.log("MESA: ", mesa[0].cerrada,mesa[0].ocupada, (mesa[0].cerrada == 0) && (mesa[0].ocupada == 'S'))
    return ( (mesa[0].cerrada == 0 || mesa[0].cerrada == 1) && (mesa[0].ocupada == 'S') )
 
}

export const LiberarMesa = async (nroMesaLiberar = 0, borrarMesa = false,url:string,base:string) => {
    if (borrarMesa) EliminarMesa(nroMesaLiberar,url,base)
    return fetch(url+"mesa_desbloquear/",
        requestOptionPost({ nromesa: nroMesaLiberar},'POST',base))
        .then(response => response.json())
        .catch(error => console.log(error))
}

export const BloquearMesa = async (nroMesaBloquear: number,mozo:number, url:string,base:string) => {
    
    console.log("BLOQUEAR MESA: ", nroMesaBloquear, "MOZO: ", mozo)
    const res = await isOcupada(nroMesaBloquear,url,base)
    
    console.log("RES: ", res)    

    if (!res) {
    return fetch(url+"mesa_bloquear/",
        requestOptionPost({ nromesa: nroMesaBloquear,idMozo: mozo },'POST',base))
        .then(response => response.json())
        .catch(error => console.log(error))
        // .then(response => console.log("RESPONSE BLOQUEAR MESA \n", response))
    } else {
       return {"mesa": 0 , "res": "Mesa ocupada"}
    }
}

export const AbrirMesa = async (nroMesa: number, mozo: mozoType, url:string,base:string) => {
    const accesoInvalido = await isOcupada(nroMesa,url,base)
    if (accesoInvalido) return ({mesa: nroMesa, mozo: mozo.idMozo, res: "error"})
    
    const acceso = await fetch(url+"mesa_abrir/",
        requestOptionPost({
            nromesa: nroMesa,
            mozo: mozo.idTipoMozo == 4 ? 0 : mozo.idMozo,
        },'POST',base))
        .then(response => response.json())
        .catch(error => console.log(error))
    return acceso
}

export const CerrarMesa = async (nroMesa: number, url:string,base:string) => {
    // const accesoInvalido = await isOcupada(nroMesa,url)
    // if (accesoInvalido) return accesoInvalido
    const acceso = await fetch(url+"mesa_cerrar_mozo/",
        requestOptionPost({
            nromesa: nroMesa
            /*,
            pagos: 0,
            descTipo: 0,
            descImporte: 0,
            idCliente: 0,
            nombre: "",
            direccion: "",
            localidad: "",
            telefono: "",
            telefono2: "",
            telefono3: "",
            email: "",
            idZona: 0,
            fechaNac: "2024-01-01T22:33:43.764Z",
            cuit: "",
            idIva: "",
            tarjeta: ""
            */
        },'POST',base))
        .then(response => response.json())
    return acceso
}

export const GrabarComensales = async (nroMesa: number, comensales: number, url:string,base:string) => {    
    const comens = await fetch(url+"mesa_comensales/",
        requestOptionPost({
            nroMesa: nroMesa,
            cant: comensales
        },'POST',base))
        .then(response => response.json())
        .catch(error => console.log(error))
    return comens
}

export const EliminarMesa = (nroMesa: number, url:string,base:string) => {
    try {
        return fetch(url+"mesa_borrar/",
            requestOptionPost({
                nromesa: nroMesa,
            }, 'DELETE',base))
        // .then(response => response.json())
        // .then(response => console.log("RESPONSE DELETE ", response))
        // .catch(error => console.log("ERROR DELETE MESA:", error))
    } catch (error) {
        console.log(error)
    }
}

export const GrabarMesa = async (det:mesaDetPost[] ,url:string,base:string) => {
    //console.log("BODY JSON: ", JSON.stringify(det.toString()))
    //const body = requestOptionPost({det})
     return fetch(url+"mesa_dest_mult/", {method: 'POST',
        headers: {'Content-Type': 'application/json',
            'bd': base
        },
        body: JSON.stringify(det) })        
        .then(response => response.json())
        .catch(error => console.log(error))
}

export const CambiarReserva = async (r:ReservasType ,url:string, base:string) => {    
    console.log("RESERVA: ", r,url,base)
    const reserva = await fetch(url+"reserva_cambiar/",
        requestOptionPost({
            idReserva: r.idReserva,
            fecha: r.fecha.toISOString(),
            turno: r.turno,
            nombre: r.nombre,
            hora: r.hora,
            cant: r.cant,
            obs: r.obs,
            telefono: r.telefono,
            idSector: r.idSector,
            mesa: r.mesa,
            idCliente: r.idCliente,
            confirmada: true,
            cumplida: r.cumplida,
            usuario: r.usuario,

        },'POST',base))
        .then(response => console.log(response.json()))
        .catch(error => console.log(error))
       
    return reserva
}

export const ConfCumpReserva = async (id:number,confirmada:boolean,cumplida:boolean ,url:string, base:string) => {    
  
    const res = await fetch(url+"reserva_conf_cump/",
        requestOptionPost({
            idReserva: id,
            confirmada: confirmada,
            cumplida: cumplida
        },'POST',base))
        .then(response => console.log(response.json()))
        .catch(error => console.log(error))
       
    return res
}

export const GrabarMensaje = async (descripcion:string, idMozo:number,nombre:string,nroMesa:number,sect:number,impre:number ,url:string, base:string) => {    
  
    const res = await fetch(url+"graba_mensaje/",
        requestOptionPost({
            descripcion: descripcion,
            idMozo: idMozo,
            idUsuario: 0,
            nombre: nombre,
            nroMesa: nroMesa,
            idSectorExped: sect,
            idImpresora: impre
        },'POST',base))
        .then(response => console.log(response.json()))
        .catch(error => console.log(error))
       
    return res
}

const respuesta = (mens:string) => {
    console.log('Respuesta',mens)
    if (mens === 'commit') showToast('Datos grabados')
    else
    mostrarDialogo('ATENCION !! Hubo un error, revise las comandas y que los datos se hayan grabado!!',mens)
}

export const AgregarDetalleMulti_Noimp = async (detalles: object[], url:string,base:string) => {
  console.log("DETALLES: ", detalles)
  const body = requestOptionPost({ mesaDetM: detalles.map((detalle) => modificarPlatoPost(detalle)) }, 'POST',base)
  const endpoint = url+ "mesa_det_mult_noimp/"
  
  let mensaje  = ""
  await fetch(endpoint, body)
    .then(response => response.json())
    .then(response => {
      respuesta(response.mensaje)
      mensaje = response.mensaje
      
    })
    .catch(error => {
      console.log("ERROR AGREGAR DETALLE: ", error)
      console.log("BODY: ", body)
      console.log("ENDPOINT", endpoint)
      respuesta(error.message)
        mensaje = error.message
    })
    return mensaje
    
}

export const AgregarDetalleMulti = (detalles: object[], url:string,base:string) => {
    console.log("DETALLES: ", detalles)
    const body = requestOptionPost({ mesaDetM: detalles.map((detalle) => modificarPlatoPost(detalle)) }, 'POST',base)
    const endpoint = url+ "mesa_det_mult/"
    
    let mensaje = ""
    fetch(endpoint, body)
      .then(response => response.json())
      .then(response => { respuesta(response.mensaje) })
        //console.log("RESPUESTA AGREGAR DETALLE: ", response, "\n DETALLE: ", body, "\n ENDPOINT", endpoint)
        
      //) 
      .catch(error => {
        console.log("ERROR AGREGAR DETALLE: ", error)
        console.log("BODY: ", body)
        console.log("ENDPOINT", endpoint)
        respuesta(error.message)
      })
      return
  }
  

// cant debe ser igual a la cantidad guardada en el renglon: el SP solo borra la fila si coincide
// (si no, solo resta cantidad). Devuelve true si el servidor confirmo el borrado.
export const BorrarRenglon = async (nroMesa: number,idDetalle:number,idPlato:number,idTipoConsumo:string, url:string,base:string,cant:number = 0): Promise<boolean> => {
    try {
        const response = await fetch(url+"mesa_renglon_borrar/",
            requestOptionPost({
                nromesa: nroMesa,
                idDetalle: idDetalle,
                idPlato: idPlato,
                idTipoConsumo: idTipoConsumo,
                cant: cant,
                descripcion: "",
                pcioUnit: 0,
                obs: "",
                idTamanio: 0,
                tamanio: "",
                fecha: new Date().toISOString(),
                hora: "",
                idMozo: 1,
                idUsuario: 1,
                fechaHoraElim: new Date().toISOString(),
                idUsuarioElim: 1,
                idMozoElim: 1,
                idObs: 0,
                observacion: "",
                comentario: "",
                puntoDeVenta: 0
            }, 'DELETE',base))
        const data = await response.json()
        console.log("RESPONSE DELETE ", data)
        return data?.res === 'OK'
    } catch (error) {
        console.log(error)
        return false
    }
}

export const Comandar = async (detalle:comanda ,url:string, base:string) => {
    console.log("COMANDA: ", detalle)
    const res = await fetch(url+"comandar/",
        requestOptionPost({            
            nroMesa: detalle.nroMesa,
            descMesa: detalle.descMesa,
            idMozo: detalle.idMozo,  
            nombreMozo: detalle.nombreMozo,
            comensales: detalle.comensales,            
            fechaHora: detalle.fechaHora || new Date().toISOString(),
            platos: detalle.platos      
    },'POST',base))
        .then(response => console.log(response.json()))
        .catch(error => console.log(error))
       
    return res
}

export const Conectar = async (clave:string): Promise<{data: datosApp[], isError: boolean, isPending: boolean}> =>  {    
    //console.log("COMANDA: ", detalle)
    let isPending = true
    let isError = false
    let url = 'https://crm.restosoft.ar/ApiCRM/index.php'

    try {
        const response = await fetch(url
        , {method: 'POST',
           headers: {         
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({  
                service: "validar",
                method: "appValidar",
                params: {
                    pass: clave
                }          
            })
        })  
        const data = await response.json()
        isPending = false  
        console.log("DATA CONECTAR: ", data)  
        return {data:data,isError,isPending}
    } catch (error) {
        console.log("ERROR CONECTAR: ", error)        
        isError = true
    }
    return {data:[],isError,isPending}
}