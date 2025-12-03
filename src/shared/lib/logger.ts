export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage(LogLevel.INFO, message, context))
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    }
    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext))
  }
}

export const logger = new Logger()
