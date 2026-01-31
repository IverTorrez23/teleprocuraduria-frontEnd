export interface Location {
  coordinates: [number, number]
  details: {
    address: string
    city: string
    country: string
    postcode: string
  }
}
