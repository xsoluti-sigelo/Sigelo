export interface Coordinates {
  latitude: number | string
  longitude: number | string
}

export interface GoogleMapEmbedProps {
  address?: string
  latitude?: number | string | null
  longitude?: number | string | null
  zoom?: number
  height?: string
}

export interface MapUrlOptions {
  zoom?: number
}

export type MapDisplayMode = 'coordinates' | 'address' | 'none'
