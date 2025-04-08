import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import config from '../config'
import { AppError } from './AppError'

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

const formatError = (error: AppError) => {
  return {
    success: false,
    message: error.errorMessage,
    errorCode: error.statusCode,
    stack: config.env === 'development' ? error.stack : undefined,
  }
}

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error)

  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else {
    const statusCode =
      error.name === 'CastError'
        ? httpStatus.BAD_REQUEST
        : error.name === 'ValidationError'
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR

    appError = new AppError(
      statusCode,
      'Something went wrong',
      false,
      error.stack,
      error
    )
  }

  res.status(appError.statusCode).json(formatError(appError))
}
