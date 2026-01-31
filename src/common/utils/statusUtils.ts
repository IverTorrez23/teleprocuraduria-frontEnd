export const getEstado = (status: string): string => {
  switch (status) {
    case 'INACTIVO':
      return 'danger'
    case 'ACTIVO':
      return 'success'
    default:
      return 'unknown'
  }
}
