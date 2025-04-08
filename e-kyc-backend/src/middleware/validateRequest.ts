import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { AnyZodObject, ZodError } from 'zod'
import sendResponse from '../utils/sendResponse'

const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      })

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'Validation error',
          data: {
            errors: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        })
        return
      }
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'Internal server error during validation',
        data: null,
      })
    }
  }
}

export default validateRequest
