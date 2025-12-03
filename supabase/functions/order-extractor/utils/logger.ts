interface LoggerOptions {
  service: string
  level?: 'debug' | 'info' | 'warn' | 'error'
}

interface LogContext {
  [key: string]: any
}

export function createLogger(options: LoggerOptions) {
  const { service, level = 'info' } = options

  const formatMessage = (level: string, message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${service}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  const log = (level: string, message: string, context?: LogContext) => {
    const formattedMessage = formatMessage(level, message, context)
    console.log(formattedMessage)
  }

  return {
    debug: (message: string, context?: LogContext) => {
      if (level === 'debug') {
        log('debug', message, context)
      }
    },
    info: (message: string, context?: LogContext) => {
      if (['debug', 'info'].includes(level)) {
        log('info', message, context)
      }
    },
    warn: (message: string, context?: LogContext) => {
      if (['debug', 'info', 'warn'].includes(level)) {
        log('warn', message, context)
      }
    },
    error: (message: string, context?: LogContext) => {
      log('error', message, context)
    },
  }
}
