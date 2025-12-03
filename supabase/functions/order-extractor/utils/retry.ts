import { createLogger } from './logger.ts'
import type { RetryOptions } from '../models/auth.types.ts'

const logger = createLogger({ service: 'RetryUtility' })

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  operationName: string = 'operation',
): Promise<T> {
  let lastError: Error | null = null
  let delay = options.initialDelayMs

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      logger.debug(`Executing ${operationName}`, { attempt, maxRetries: options.maxRetries })

      const result = await operation()

      if (attempt > 1) {
        logger.info(`${operationName} succeeded after retry`, {
          attempt,
          totalRetries: attempt - 1,
        })
      }

      return result
    } catch (error) {
      lastError = error as Error

      logger.warn(`${operationName} failed`, {
        attempt,
        maxRetries: options.maxRetries,
        error: lastError.message,
        willRetry: attempt < options.maxRetries,
      })

      if (attempt < options.maxRetries) {
        logger.debug(`Waiting ${delay}ms before retry`, {
          attempt,
          delay,
        })

        await sleep(delay)

        delay = Math.min(delay * options.backoffMultiplier, options.maxDelayMs)
      }
    }
  }

  logger.error(`${operationName} failed after all retries`, {
    totalAttempts: options.maxRetries,
    finalError: lastError?.message,
  })

  throw lastError
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  operationName: string = 'operation',
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([operation(), timeoutPromise])
}

export function retryWithTimeout<T>(
  operation: () => Promise<T>,
  retryOptions: RetryOptions,
  timeoutMs: number,
  operationName: string = 'operation',
): Promise<T> {
  return retryWithBackoff(
    () => withTimeout(operation, timeoutMs, operationName),
    retryOptions,
    operationName,
  )
}

export function isRetryableError(error: any): boolean {
  if (error?.name === 'NetworkError' || error?.name === 'TimeoutError') {
    return true
  }

  if (error?.status >= 500 && error?.status < 600) {
    return true
  }

  if (error?.status === 429) {
    return true
  }

  if ('retryable' in error && typeof error.retryable === 'boolean') {
    return error.retryable
  }

  return false
}

export function createRetryOptions(partial: Partial<RetryOptions> = {}): RetryOptions {
  return {
    maxRetries: partial.maxRetries ?? 3,
    initialDelayMs: partial.initialDelayMs ?? 1000,
    maxDelayMs: partial.maxDelayMs ?? 10000,
    backoffMultiplier: partial.backoffMultiplier ?? 2,
  }
}
