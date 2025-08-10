export type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string;
  caller?: string;
  context?: string;
  duration?: number;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export class LoggerService {
  private static lastLogTime: Map<string, number> = new Map();
  private static rateLimitMs: number = parseInt(
    process.env.LOG_RATE_LIMIT_MS || '10000',
  );
  private static serviceName: string = process.env.SERVICE_NAME || 'unknown';

  static setRateLimit(ms: number): void {
    if (ms < 0) {
      throw new Error('Rate limit must be positive');
    }
    LoggerService.rateLimitMs = ms;
  }

  static setServiceName(name: string): void {
    LoggerService.serviceName = name;
  }

  static log(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    caller?: string,
  ) {
    this.print('log', message, context, metadata, undefined, caller);
  }

  static warn(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    caller?: string,
  ) {
    this.print('warn', message, context, metadata, undefined, caller);
  }

  static error(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    error?: Error,
    caller?: string,
  ) {
    this.print('error', message, context, metadata, error, caller);
  }

  static debug(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    caller?: string,
  ) {
    this.print('debug', message, context, metadata, undefined, caller);
  }

  static info(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    caller?: string,
  ) {
    this.print('info', message, context, metadata, undefined, caller);
  }

  private static shouldLog(level: LogLevel, context: string): boolean {
    if (level === 'error') {
      return true;
    }

    const key = `${level}:${context}`;
    const now = Date.now();
    const lastTime = LoggerService.lastLogTime.get(key) || 0;

    if (now - lastTime >= LoggerService.rateLimitMs) {
      LoggerService.lastLogTime.set(key, now);
      return true;
    }

    return false;
  }

  private static print(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
    error?: Error,
    caller?: string,
  ) {
    if (!LoggerService.shouldLog(level, context || 'default')) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: LoggerService.serviceName,
      caller: caller || 'unknown',
      context: context || 'default',
      metadata: metadata || {},
    };

    if (error) {
      logEntry.error = {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    const output = JSON.stringify(logEntry);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else if (level === 'debug') {
      console.debug(output);
    } else {
      console.log(output);
    }
  }
}
