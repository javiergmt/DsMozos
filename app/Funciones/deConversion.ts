// SOBRE TIEMPO: 

export default function deConversion(){
    return null;
}

/**
 * Genera un array con la hora actual. Utiliza un expresión regular para dividir
 * el string que viene de new Date().toISOString(). En la posición 1 se guarda la hora
 * descartando segundos, dia, mesa y año.
 * @return {string}
 */
export function getHoraActual() {
    const fecha = new Date()
    console.log('Fecha actual:', fecha)
    // fijar la zona horaria a UTC-3
    fecha.setHours(fecha.getHours() - 3)

    // obtener la hora en formato ISO y extraer la parte de la hora
    return /(\d{2}:\d{2})/.exec(fecha.toISOString())[1]
}

export function getFechaActual() {
    const fecha = new Date()
    // fijar la zona horaria a UTC-3
    fecha.setHours(fecha.getHours() - 3)
    return /(\d{4}-\d{2}-\d{2})T/.exec(fecha.toISOString())[1]
}

export function getFechaHoraActual() {
const fecha = new Date()
    // fijar la zona horaria a UTC-3
    fecha.setHours(fecha.getHours() - 3)
    return /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(fecha.toISOString())[1]
}


export function calcularHoras(hora:string){
    // @ts-expect-error: No se porque chilla acá
    const diferenciaEnMillis = new Date() - new Date(hora);
    return `${Math.floor(diferenciaEnMillis / (1000 * 60 *60))}`
}


//SOBRE STRINGS: 

export function capitalizeArray(array:string[]){
    return array.map(word => capitalize(word))
}

export function capitalize(word:string):string{
    /* console.log("CPITALIZE: ", word) */
    try{
        return word[0].toUpperCase() + word.slice(1, word.length).toLowerCase()
    }catch (error){
        console.log("ERROR CAPITALIZE: ", error)
        return ''
    }
}

export function hyphenatedText (text:string) {
    text
    .split(' ')
    .map((word) => word.split('').join('\u00AD'))
    .join(' ');
    return text;
  }

export function getNumberOfString(chain:string):string[] | null {
    // let number = /(\d+)/.test(chain)

    return /^\((\d+)\)(\w+)/.exec(chain)
}

export function isAlphabetic(str: string) {
    return /^[a-zA-Z]+$/.test(str)
}

export function isDigit(value: string) {
    return /^\d+(\.\d+)?$/.test(value)
}

export function convUrlBase(url:string,port:string){
    return 'http://'+url + ':' + port + '/'
}

export function deconvUrl(urlBase:string){
    const pos = urlBase.indexOf('/')
    const url2 = urlBase.substring(pos+2)
    const pos2 = url2.indexOf(':')
    const url = url2.substring(0,pos2)
    //console.log(urlBase,url2,pos,pos2,url)
    return (url)
}
export function deconvPort(urlBase:string){
    const pos = urlBase.indexOf('/')
    const url2 = urlBase.substring(pos+2)
    const pos2 = url2.indexOf(':')
    const pos3 = url2.indexOf('/')
    const url3 = url2.substring(pos2+1)
    const port = url3.substring(0,url3.length-1)  
    //console.log(url2,pos2,pos3,port)  
    return (port)
}

export function izqRellena(cadena:string, longitud:number){
    console.log('cadena:',cadena,' longitud:',longitud, ' cadena.length:',cadena.length)
    let cadret = cadena.padStart(longitud - cadena.length,'0')
    console.log('cadena:',cadret)
    return cadret
        
}

//COLORES:
// "colorMesaCerrada": "clYellow",
// "colorMesaComiendo": "$00FF0080",
// "colorMesaComiendoEsperando": "$0080FFFF",
// "colorMesaEperando": "clRed",
// "colorMesaNormal": "$0080FF80",
// "colorMesaOcupada": "$00FF8080",
// "colorMesaPorCobrar": "clRed",
// "colorMesaSinPed": "$00FFFF80",
// "colorPostre": "$00CA62D2",
export function vclToCssRgb(vclColor: string): string {
  // Formato 1: clYellow;
  const test1 = /cl(\w+)/.exec(vclColor);
  // Formato 2: "$0080FFFF
  const test2 = /\$(\d{1,})/.exec(vclColor);

  if (vclColor && /\d{1,}/.test(vclColor) && vclColor.length !== 9) return "";
    if(test1){
        const color = vclColor.slice(2).toLocaleLowerCase();
        return `color-mix(in srgb, ${color}, transparent 60%)`;
    }

  // Extrae los componentes de color hexadecimales
  if(test2)  {
    const redHex = vclColor.slice(7, 9);
    const greenHex = vclColor.slice(5, 7);
    const blueHex = vclColor.slice(3, 5);

    const red = parseInt(redHex, 16);
    const green = parseInt(greenHex, 16);
    const blue = parseInt(blueHex, 16);

    // Devuelve el valor en formato RGB para utilizar directamente en CSS
    return `rgba(${red}, ${green}, ${blue}, .4)`;
  }
  return ""
}


