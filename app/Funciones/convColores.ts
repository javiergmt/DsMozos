export default function convColores(vclColor:string) {
    //si el vcl no tiene numeros retorna null
    if(vclColor && /\d{1,}/.test(vclColor) && vclColor.length !== 9) return null
    // Extrae los componentes de color hexadecimales
    const redHex = vclColor.slice(7, 9);
    const greenHex = vclColor.slice(5, 7);
    const blueHex = vclColor.slice(3, 5);

    const red = parseInt(redHex, 16);
    const green = parseInt(greenHex, 16);
    const blue = parseInt(blueHex, 16);

    // Devuelve el valor en formato RGB para utilizar directamente en CSS
    return `rgb(${red}, ${green}, ${blue})`;
}