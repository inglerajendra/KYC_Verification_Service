export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public errorMessage: string
  public stack!: string

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = '',
    public cause?: Error
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errorMessage = message

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
