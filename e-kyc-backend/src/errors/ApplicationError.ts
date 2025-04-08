import httpStatus from 'http-status'

export class ApplicationError extends Error {
  statusCode: number

  constructor(
    statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
    message: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApplicationError'

    Object.setPrototypeOf(this, ApplicationError.prototype)
  }
}

export const createError = (
  statusCode: number,
  message: string
): ApplicationError => {
  return new ApplicationError(statusCode, message)
}

export const isApplicationError = (error: any): error is ApplicationError => {
  return error instanceof ApplicationError
}
