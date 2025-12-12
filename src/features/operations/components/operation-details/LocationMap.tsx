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

      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="p-3 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Localização</h3>
          </div>

          <div className="space-y-1.5">
            {rawAddress && (
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                  Endereço recebido:
                </p>
                <p className="text-xs text-gray-900 dark:text-white">{rawAddress}</p>
              </div>
            )}

            {hasGeocodedAddress && (
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Endereço processado:</p>
                <p className="text-xs text-gray-900 dark:text-white">{formattedAddress}</p>
              </div>
            )}

            {hasLocation && (
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                Coordenadas: {latitude}, {longitude}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
