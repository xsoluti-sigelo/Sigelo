'use client'

import { useState, useEffect } from 'react'
import { ViaCepClientService } from '../services/viacep-client.service'
import type { AddressData, ViaCepError } from '../types/viacep.types'

const viaCepClient = new ViaCepClientService()

export interface UseAddressByCepResult {
  data: AddressData | null
  error: ViaCepError | null
  isLoading: boolean
}

export function useAddressByCep(cep: string | null | undefined): UseAddressByCepResult {
  const [data, setData] = useState<AddressData | null>(null)
  const [error, setError] = useState<ViaCepError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const cleanCep = cep?.replace(/\D/g, '') || ''
    const isValidLength = cleanCep.length === 8

    if (!isValidLength) {
      setData(null)
      setError(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError(null)

    viaCepClient
      .fetchAddress(cleanCep)
      .then((result) => {
        if (!isMounted) return

        if (result.error) {
          setError(result.error)
          setData(null)
        } else {
          setData(result.data)
          setError(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [cep])

  return {
    data,
    error,
    isLoading,
  }
}
