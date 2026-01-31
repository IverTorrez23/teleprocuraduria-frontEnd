export const plazoSegunCondicion = (condicion: number): string => {
    switch (condicion) {
      case 1:
        return 'Más de 96'
      case 2:
        return '24 - 96'
      case 3:
        return '8 - 24'
      case 4:
        return '3 - 8'
      case 5:
        return '1 - 3'
      case 6:
        return '0 - 1'
      default:
        return 'No especificado'
    }
  }