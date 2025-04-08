import httpStatus from 'http-status'
import { AppError } from './AppError'

export const handleDatabaseError = (error: Error): AppError => {
  return new AppError(
    httpStatus.SERVICE_UNAVAILABLE,
    'Database service unavailable',
    true,
    '',
    error
  )
}

export const handleApiError = (error: Error): AppError => {
  return new AppError(
    httpStatus.BAD_GATEWAY,
    'External service error',
    true,
    '',
    error
  )
}

export const handleValidationError = (
  message: string,
  error?: Error
): AppError => {
  return new AppError(
    httpStatus.BAD_REQUEST,
    message || 'Validation failed',
    true,
    '',
    error
  )
}

export const handleNotFoundError = (resource: string): AppError => {
  return new AppError(httpStatus.NOT_FOUND, `${resource} not found`, true)
}

export const handleUnauthorizedError = (): AppError => {
  return new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized access', true)
}

export const handleForbiddenError = (): AppError => {
  return new AppError(httpStatus.FORBIDDEN, 'Forbidden access', true)
}
