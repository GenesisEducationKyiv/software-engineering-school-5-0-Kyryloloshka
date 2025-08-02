export class LoggedError extends Error {
  constructor(
    public readonly type: 'log' | 'warn' | 'error' | 'debug' | 'info',
    message: string,
  ) {
    super(message);
  }
}
