import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// Zona horaria de Bolivia
const ZONA_HORARIA = 'America/La_Paz'

export const devuelveCodigoOrdenUrgencias = (
  fechaFin: string,
  prioridad: number,
  idOrden: number,
  idCausa: number
): string => {
  const ahoraBolivia = dayjs().tz(ZONA_HORARIA)
  const fechaFinBolivia = dayjs(fechaFin).tz(ZONA_HORARIA)

  const horasFaltantes = fechaFinBolivia.diff(ahoraBolivia, 'hour', true) // true para incluir decimales
  let codigo: string

  if (horasFaltantes > 96) {
    codigo = 'G' + prioridad
  } else if (horasFaltantes > 24 && horasFaltantes <= 96) {
    codigo = 'C' + prioridad
  } else if (horasFaltantes > 8 && horasFaltantes <= 24) {
    codigo = 'V' + prioridad
  } else if (horasFaltantes > 3 && horasFaltantes <= 8) {
    codigo = 'A' + prioridad
  } else if (horasFaltantes > 1 && horasFaltantes <= 3) {
    codigo = 'N' + prioridad
  } else if (horasFaltantes > 0 && horasFaltantes <= 1) {
    codigo = 'R' + prioridad
  } else {
    // Fecha pasada: devolver "R2" tachado y con enlace
    const textoTachado = `<s>R${prioridad}</s>`
    const enlace = `<a target="_blank" href="/causas/ficha/lista-ordenes/${idCausa}/detalle-orden/${idOrden}" style="color:red">${textoTachado}</a>`
    return enlace
  }

  return `<a target="_blank" href="/causas/ficha/lista-ordenes/${idCausa}/detalle-orden/${idOrden}">${codigo}</a>`
}
