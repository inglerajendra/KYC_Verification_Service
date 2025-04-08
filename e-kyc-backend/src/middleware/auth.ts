import type { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import { UserServices } from '../app/modules/User/user.service'
import config from '../config'
import { ApplicationError } from '../errors/ApplicationError'
import sendResponse from '../utils/sendResponse'

interface DecodedToken {
  _id: string
  username: string
  role: string
  iat: number
  exp: number
}

const auth = (requiredRole?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization
      console.log('Authentication header:', authHeader)

      let token = null
      if (authHeader) {
        token = authHeader.replace(/^(Bearer\s+)+/i, '').trim()
      }

      console.log(
        'Extracted token:',
        token ? `${token.substring(0, 10)}...` : 'empty'
      )

      if (!token) {
        throw new ApplicationError(
          httpStatus.UNAUTHORIZED,
          'Authentication failed: No token provided'
        )
      }

      console.log(
        'JWT secret key (first few chars):',
        config.jwt.jwt_secret
          ? `${(config.jwt.jwt_secret as string).substring(0, 3)}...`
          : 'not defined'
      )

      let decoded: DecodedToken
      try {
        decoded = jwt.verify(
          token,
          config.jwt.jwt_secret as string
        ) as DecodedToken
        console.log('Token successfully verified:', decoded)
      } catch (verifyError: any) {
        console.error('JWT verification error:', verifyError.message)
        throw verifyError
      }

      try {
        console.log('Looking for user with ID:', decoded._id)
        const user = await UserServices.getUserById(decoded._id)
        console.log('User found:', user ? 'yes' : 'no')

        if (!user) {
          throw new ApplicationError(
            httpStatus.UNAUTHORIZED,
            'Authentication failed: User not found'
          )
        }

        console.log('User verified:', user.isVerified)
        if (!user.isVerified) {
          throw new ApplicationError(
            httpStatus.UNAUTHORIZED,
            'Authentication failed: Email not verified'
          )
        }

        console.log('Required role:', requiredRole)
        console.log('User role:', user.role)

        if (requiredRole && user.role !== requiredRole) {
          throw new ApplicationError(
            httpStatus.FORBIDDEN,
            'Access denied: Insufficient permissions'
          )
        }
        ;(req as any).user = {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        }

        console.log('Authentication successful, proceeding to next middleware')
        next()
      } catch (userError: any) {
        console.error('User lookup error:', userError.message)
        throw userError
      }
    } catch (error) {
      console.error('Authentication middleware error:', error)

      if (error instanceof jwt.JsonWebTokenError) {
        console.log('JWT error type:', error.constructor.name)
        sendResponse(res, {
          statusCode: httpStatus.UNAUTHORIZED,
          success: false,
          message: 'Authentication failed: Invalid token',
          data: null,
        })
        return
      }

      if (error instanceof ApplicationError) {
        sendResponse(res, {
          statusCode: error.statusCode,
          success: false,
          message: error.message,
          data: null,
        })
        return
      }

      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'Authentication error',
        data: null,
      })
    }
  }
}

export default auth
