// Utilidades de red para la cola de comandas y el chequeo de conexion.
// Sin un tiempo maximo, cuando el telefono pierde la senal un fetch puede quedar colgado casi un
// minuto y la app parece trabada.

// fetch con tiempo maximo propio (ms)
export async function fetchConTiempo(url: string, init: RequestInit, ms: number): Promise<Response> {
  const control = new AbortController()
  const corte = setTimeout(() => control.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: control.signal })
  } finally {
    clearTimeout(corte)
  }
}

// Error de red (sin senal, servidor apagado, tiempo agotado) vs. error de la API
export class SinConexion extends Error {
  constructor(motivo: string) { super(motivo); this.name = 'SinConexion' }
}
