export function base64ToBlob(base64Data: string, mimeType: string): Blob {
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function downloadBase64File(
  base64Data: string,
  fileName: string,
  mimeType: string = 'application/octet-stream',
): void {
  const blob = base64ToBlob(base64Data, mimeType)
  downloadBlob(blob, fileName)
}

export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result as string
      resolve(base64String.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export function isImageFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)
}

export function isPdfFile(fileName: string): boolean {
  return getFileExtension(fileName) === 'pdf'
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

export function validateFileType(file: File, acceptedFormats: string[]): boolean {
  const extension = `.${getFileExtension(file.name)}`
  return acceptedFormats.includes(extension)
}
