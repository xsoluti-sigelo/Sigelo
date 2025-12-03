import type { DocumentUploadConfig } from '../types'
import { DEFAULT_UPLOAD_CONFIG } from '../types'
import { validateFileSize, validateFileType } from '../lib'

export interface ValidationError {
  file: File
  error: string
}

export interface ValidationResult {
  valid: File[]
  invalid: ValidationError[]
}

export class DocumentValidatorService {
  private config: Required<DocumentUploadConfig>

  constructor(config?: DocumentUploadConfig) {
    this.config = {
      ...DEFAULT_UPLOAD_CONFIG,
      ...config,
    }
  }

  validateFiles(files: File[]): ValidationResult {
    const valid: File[] = []
    const invalid: ValidationError[] = []

    for (const file of files) {
      const error = this.validateFile(file)
      if (error) {
        invalid.push({ file, error })
      } else {
        valid.push(file)
      }
    }

    return { valid, invalid }
  }

  validateFile(file: File): string | null {
    if (!validateFileSize(file, this.config.maxSizeInMB)) {
      return `Arquivo excede o tamanho máximo de ${this.config.maxSizeInMB}MB`
    }

    if (!validateFileType(file, this.config.acceptedFormats)) {
      return `Formato de arquivo não suportado. Formatos aceitos: ${this.config.acceptedFormats.join(', ')}`
    }

    return null
  }

  validateFileCount(currentCount: number, newCount: number): string | null {
    const totalCount = currentCount + newCount

    if (totalCount > this.config.maxFiles) {
      return `Máximo de ${this.config.maxFiles} arquivos permitidos`
    }

    return null
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  }

  getAcceptedFormatsString(): string {
    return this.config.acceptedFormats.join(',')
  }

  getMaxSizeInBytes(): number {
    return this.config.maxSizeInMB * 1024 * 1024
  }
}
