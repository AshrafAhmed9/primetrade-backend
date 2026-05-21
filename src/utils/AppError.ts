export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown[]
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
