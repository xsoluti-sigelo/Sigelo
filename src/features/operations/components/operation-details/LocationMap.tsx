'use client'

import { GoogleMap } from '@/features/integrations/google-maps'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface LocationMapProps {
  rawAddress?: string | null
  formattedAddress?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  geocodingStatus?: string | null
}

export function LocationMap({
  rawAddress,
  formattedAddress,
  latitude,
  longitude,
  geocodingStatus,
}: LocationMapProps) {
  const hasLocation = !!(latitude && longitude)
  const hasGeocodedAddress = geocodingStatus === 'SUCCESS' && formattedAddress

  return (
    <div className="h-full relative rounded-xl overflow-hidden">
      <GoogleMap
        latitude={latitude}
        longitude={longitude}
        address={!hasLocation ? rawAddress || undefined : undefined}
        height="100%"
        zoom={16}
      />

      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="p-4 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Localização</h3>
          </div>

          <div className="space-y-2">
            {rawAddress && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Endereço recebido:
                </p>
                <p className="text-sm text-gray-900 dark:text-white">{rawAddress}</p>
              </div>
            )}

            {hasGeocodedAddress && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Endereço processado:</p>
                <p className="text-sm text-gray-900 dark:text-white">{formattedAddress}</p>
              </div>
            )}

            {hasLocation && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Coordenadas: {latitude}, {longitude}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
