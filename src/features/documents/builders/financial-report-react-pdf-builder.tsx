import React from 'react'
import { pdf } from '@react-pdf/renderer'
import sharp from 'sharp'
import { FinancialReportDocument } from './financial-report-react-pdf-document'
import type { FinancialReportData } from '../types/financial-report.types'

async function convertImageToDataUri(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const contentType = response.headers.get('content-type') || ''

    let processedImage: Buffer
    let mimeType: string

    if (contentType.includes('png')) {
      processedImage = await sharp(buffer).png().toBuffer()
      mimeType = 'image/png'
    } else {
      processedImage = await sharp(buffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .toBuffer()
      mimeType = 'image/jpeg'
    }

    const base64 = processedImage.toString('base64')

    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    throw error
  }
}

export class FinancialReportBuilderReactPDF {
  async build(data: FinancialReportData, bannerUrl?: string): Promise<Uint8Array> {
    let bannerDataUri: string | undefined

    if (bannerUrl) {
      try {
        bannerDataUri = await convertImageToDataUri(bannerUrl)
      } catch {
        bannerDataUri = undefined
      }
    }

    const doc = <FinancialReportDocument data={data} bannerUrl={bannerDataUri} />
    const pdfBlob = await pdf(doc).toBlob()
    const arrayBuffer = await pdfBlob.arrayBuffer()

    return new Uint8Array(arrayBuffer)
  }
}
