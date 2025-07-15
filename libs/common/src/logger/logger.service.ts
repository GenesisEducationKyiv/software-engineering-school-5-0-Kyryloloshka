import { format } from 'util';

export type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

export class LoggerService {
  static log(message: string, ...meta: any[]) {
    LoggerService.print('log', message, ...meta);
  }

  static warn(message: string, ...meta: any[]) {
    LoggerService.print('warn', message, ...meta);
  }

  static error(message: string, ...meta: any[]) {
    LoggerService.print('error', message, ...meta);
  }

  static debug(message: string, ...meta: any[]) {
    LoggerService.print('debug', message, ...meta);
  }

  static info(message: string, ...meta: any[]) {
    LoggerService.print('info', message, ...meta);
  }

  private static print(level: LogLevel, message: string, ...meta: any[]) {
    const timestamp = new Date().toISOString();
    const formatted = format(message, ...meta);
    const output = `[${timestamp}] [${level.toUpperCase()}] ${formatted}`;
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
