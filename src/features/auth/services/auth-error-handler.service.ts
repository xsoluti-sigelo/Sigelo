import { mapAuthError, isRecoverableError } from '../lib/auth-errors'
import type { AuthError } from '../model/types'

export class AuthErrorHandlerService {
  handleError(error: unknown): AuthError {
    return mapAuthError(error)
  }

  shouldRetry(error: AuthError, retryCount: number, maxRetries = 3): boolean {
    if (retryCount >= maxRetries) return false
    return isRecoverableError(error)
  }

  getRetryDelay(retryCount: number): number {
    const baseDelay = 1000
    return baseDelay * Math.pow(2, retryCount)
  }

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
  ): Promise<{ data: T | null; error: AuthError | null }> {
    let lastError: AuthError | null = null
    let retryCount = 0

    while (retryCount <= maxRetries) {
      try {
        const data = await fn()
        return { data, error: null }
      } catch (error) {
        lastError = this.handleError(error)

        if (!this.shouldRetry(lastError, retryCount, maxRetries)) {
          break
        }

        const delay = this.getRetryDelay(retryCount)
        await new Promise((resolve) => setTimeout(resolve, delay))
        retryCount++
      }
    }

    return { data: null, error: lastError }
  }
}

export const authErrorHandlerService = new AuthErrorHandlerService()
