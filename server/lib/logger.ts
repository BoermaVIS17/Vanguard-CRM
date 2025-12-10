/**
 * Logging Utility
 * 
 * Provides structured logging with request IDs, timestamps, and context.
 * Supports different log levels and formats output for better debugging.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: number;
  procedure?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info';

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    
    let output = `[${timestamp}] ${levelStr} ${message}`;
    
    if (context) {
      const contextStr = Object.entries(context)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}=${JSON.stringify(value)}`;
          }
          return `${key}=${value}`;
        })
        .join(' ');
      
      if (contextStr) {
        output += ` | ${contextStr}`;
      }
    }
    
    return output;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.log(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorContext = { ...context };
    
    if (error instanceof Error) {
      errorContext.error = error.message;
      errorContext.stack = error.stack;
    } else if (error) {
      errorContext.error = String(error);
    }
    
    console.error(this.formatMessage('error', message, errorContext));
  }

  // Helper for logging tRPC procedure calls
  procedure(procedureName: string, context: LogContext): void {
    this.info(`tRPC: ${procedureName}`, context);
  }

  // Helper for logging tRPC errors
  procedureError(procedureName: string, error: Error | unknown, context?: LogContext): void {
    this.error(`tRPC Error: ${procedureName}`, error, context);
  }

  // Helper for logging HTTP requests
  request(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, context);
  }

  // Helper for logging performance
  performance(operation: string, durationMs: number, context?: LogContext): void {
    const level = durationMs > 1000 ? 'warn' : 'debug';
    const message = `Performance: ${operation} took ${durationMs}ms`;
    
    if (level === 'warn') {
      this.warn(message, { ...context, duration: durationMs });
    } else {
      this.debug(message, { ...context, duration: durationMs });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export helper to create request-scoped logger
export function createRequestLogger(requestId: string, userId?: number) {
  return {
    debug: (message: string, context?: LogContext) => 
      logger.debug(message, { requestId, userId, ...context }),
    info: (message: string, context?: LogContext) => 
      logger.info(message, { requestId, userId, ...context }),
    warn: (message: string, context?: LogContext) => 
      logger.warn(message, { requestId, userId, ...context }),
    error: (message: string, error?: Error | unknown, context?: LogContext) => 
      logger.error(message, error, { requestId, userId, ...context }),
    procedure: (procedureName: string, context?: LogContext) => 
      logger.procedure(procedureName, { requestId, userId, ...context }),
    procedureError: (procedureName: string, error: Error | unknown, context?: LogContext) => 
      logger.procedureError(procedureName, error, { requestId, userId, ...context }),
  };
}
