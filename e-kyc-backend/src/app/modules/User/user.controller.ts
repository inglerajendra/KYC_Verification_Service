import type { Request, Response } from 'express'
import httpStatus from 'http-status'
import jwt from 'jsonwebtoken'
import config from '../../../config'
import catchAsync from '../../../utils/catchAsync'
import sendResponse from '../../../utils/sendResponse'
import type { IUser } from './user.interface'
import { UserServices } from './user.service'

const registerUserController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userData: Partial<IUser> = req.body

      if (userData.password !== userData.confirmPassword) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'Passwords do not match',
          data: null,
        })
      }

      delete userData.confirmPassword

      const user = await UserServices.createUserIntoDB(userData)

      await UserServices.generateAndSendOTP(user._id.toString())

      const responseData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      }

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message:
          'User registered successfully. Please check your email for verification code.',
        data: responseData,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const userLoginController = catchAsync(async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const user = await UserServices.loginUserFromDB(username, password)

    if (!user.isVerified) {
      await UserServices.generateAndSendOTP(user._id.toString())

      return sendResponse(res, {
        statusCode: httpStatus.FORBIDDEN,
        success: false,
        message:
          'Email not verified. A new verification code has been sent to your email.',
        data: {
          userId: user._id,
          isVerified: false,
        },
      })
    }

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      config.jwt.jwt_secret as string,
      {
        expiresIn: '24h',
      }
    )

    const responseData = {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User login successful',
      data: responseData,
    })
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: error.message,
      data: null,
    })
  }
})

const sendVerificationOTPController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body

      await UserServices.generateAndSendOTP(userId)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Verification code sent to your email',
        data: null,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const verifyOTPController = catchAsync(async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body

    const user = await UserServices.verifyOTP(userId, otp)

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      config.jwt.jwt_secret as string,
      {
        expiresIn: '24h',
      }
    )

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    })
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: error.message,
      data: null,
    })
  }
})

const getAllUsersController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const users = await UserServices.getAllUsers()

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const getUserProfileController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id
      const user = await UserServices.getUserById(userId)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User profile retrieved successfully',
        data: user,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const updateUserDetailsController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id
      const updatedData = req.body

      const user = await UserServices.updateUserDetails(userId, updatedData)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User profile updated successfully',
        data: user,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const changePasswordController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id
      const { currentPassword, newPassword, confirmPassword } = req.body

      if (newPassword !== confirmPassword) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'New passwords do not match',
          data: null,
        })
      }

      await UserServices.changeUserPassword(
        userId,
        currentPassword,
        newPassword
      )

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password changed successfully',
        data: null,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

export const UserControllers = {
  registerUserController,
  userLoginController,
  sendVerificationOTPController,
  verifyOTPController,
  getAllUsersController,
  getUserProfileController,
  updateUserDetailsController,
  changePasswordController,
}
