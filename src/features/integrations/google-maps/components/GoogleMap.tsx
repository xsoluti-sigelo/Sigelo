'use client'

import { useEffect, useState, useMemo } from 'react'
import { GoogleMap as GoogleMapComponent, Marker, useLoadScript } from '@react-google-maps/api'
import type { GoogleMapEmbedProps } from '../types/google-maps.types'
import { darkMapStyles, lightMapStyles } from '../lib/map-styles'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export function GoogleMap({
  address,
  latitude,
  longitude,
  zoom = 15,
  height = '400px',
}: GoogleMapEmbedProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const [isDark, setIsDark] = useState(false)
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (latitude && longitude) {
      const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude
      const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude
      setCenter({ lat, lng })
      return
    }

    if (address && isLoaded && window.google) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          setCenter({ lat: location.lat(), lng: location.lng() })
        }
      })
    }
  }, [address, latitude, longitude, isLoaded])

  const mapStyles = useMemo(() => (isDark ? darkMapStyles : lightMapStyles), [isDark])

  const mapOptions = useMemo(
    () => ({
      styles: mapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    }),
    [mapStyles],
  )

  if (loadError) {
    return (
      <div
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-red-500">Erro ao carregar o mapa</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400">Carregando mapa...</p>
      </div>
    )
  }

  if (!center) {
    return (
      <div
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500 dark:text-gray-400">Endereço não disponível</p>
      </div>
    )
  }

  return (
    <div
      className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{ height }}
    >
      <GoogleMapComponent
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        <Marker position={center} />
      </GoogleMapComponent>
    </div>
  )
}
