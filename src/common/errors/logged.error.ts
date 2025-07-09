export class LoggedError extends Error {
  constructor(
    public readonly type: 'log' | 'warn' | 'error',
    message: string,
  ) {
    super(message);
  }
}
