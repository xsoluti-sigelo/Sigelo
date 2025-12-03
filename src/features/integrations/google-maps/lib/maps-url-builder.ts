import type { MapUrlOptions } from '../types/google-maps.types'

const GOOGLE_MAPS_EMBED_BASE_URL = 'https://maps.google.com/maps'

export class GoogleMapsUrlBuilder {
  static buildUrlFromCoordinates(
    latitude: number | string,
    longitude: number | string,
    options: MapUrlOptions = {},
  ): string {
    const { zoom = 15 } = options

    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude

    return `${GOOGLE_MAPS_EMBED_BASE_URL}?q=${lat},${lng}&z=${zoom}&output=embed`
  }

  static buildUrlFromAddress(address: string, options: MapUrlOptions = {}): string {
    const { zoom = 15 } = options
    const encodedAddress = encodeURIComponent(address)

    return `${GOOGLE_MAPS_EMBED_BASE_URL}?q=${encodedAddress}&z=${zoom}&output=embed`
  }
}
