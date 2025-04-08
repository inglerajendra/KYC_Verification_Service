import httpStatus from 'http-status'
import nodemailer from 'nodemailer'
import config from '../../../config'
import { ApplicationError } from '../../../errors/ApplicationError'
import logger from '../../../utils/logger'
import { type IUser, type IUserDocument, UserRole } from './user.interface'
import { User } from './user.model'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.email_user,
    pass: config.email.email_pass,
  },
})

const createUserIntoDB = async (
  userData: Partial<IUser>
): Promise<IUserDocument> => {
  logger.info('📝 Creating a new user in the database', { userData })

  const newUser = {
    ...userData,
    role: userData.role || UserRole.USER,
    isVerified: false,
  }

  const user = new User(newUser)
  return user.save()
}

const loginUserFromDB = async (username: string, password: string) => {
  try {
    const user = await User.findByCredentials(username, password)

    return user
  } catch (error) {
    throw new ApplicationError(
      httpStatus.UNAUTHORIZED,
      'Invalid login credentials'
    )
  }
}

const getAllUsers = async (): Promise<IUserDocument[]> => {
  try {
    const users = await User.find({})
    return users
  } catch (error) {
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error retrieving users'
    )
  }
}

const getUserById = async (userId: string): Promise<IUserDocument> => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found')
    }
    return user
  } catch (error) {
    if (error instanceof ApplicationError) throw error
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error retrieving user'
    )
  }
}

const updateUserDetails = async (
  userId: string,
  updatedData: Partial<IUser>
): Promise<IUserDocument> => {
  try {
    const allowedUpdates = ['username', 'email']

    const filteredData: Partial<IUser> = {}

    for (const key of Object.keys(updatedData)) {
      if (allowedUpdates.includes(key) && key in updatedData) {
        ;(filteredData as any)[key] = updatedData[key as keyof Partial<IUser>]
      }
    }

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
    })

    if (!user) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found')
    }

    return user
  } catch (error) {
    if (error instanceof ApplicationError) throw error
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating user details'
    )
  }
}

const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<IUserDocument> => {
  try {
    const user = await User.findById(userId).select('+password')
    if (!user) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found')
    }

    const isPasswordMatched = await User.isPasswordMatched(
      currentPassword,
      user.password
    )
    if (!isPasswordMatched) {
      throw new ApplicationError(
        httpStatus.UNAUTHORIZED,
        'Current password is incorrect'
      )
    }

    user.password = newPassword
    await user.save()

    return user
  } catch (error) {
    if (error instanceof ApplicationError) throw error
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error changing password'
    )
  }
}

const generateAndSendOTP = async (userId: string): Promise<void> => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found')
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const otpExpiration = new Date()
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10)

    user.verificationCode = otp
    user.verificationCodeExpires = otpExpiration
    await user.save()

    const mailOptions = {
      from: config.email.email_from,
      to: user.email,
      subject: 'Email Verification OTP',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello ${user.username},</p>
          <p>Thank you for registering. Please use the following code to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br>Your App Team</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    if (error instanceof ApplicationError) throw error
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error generating verification code'
    )
  }
}

const verifyOTP = async (
  userId: string,
  otp: string
): Promise<IUserDocument> => {
  try {
    const user = await User.findById(userId).select(
      '+verificationCode +verificationCodeExpires'
    )

    if (!user) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'User not found')
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      throw new ApplicationError(
        httpStatus.BAD_REQUEST,
        'Verification code not found or has expired. Please request a new one.'
      )
    }

    if (new Date() > user.verificationCodeExpires) {
      user.verificationCode = undefined
      user.verificationCodeExpires = undefined
      await user.save()

      throw new ApplicationError(
        httpStatus.BAD_REQUEST,
        'Verification code has expired. Please request a new one.'
      )
    }

    if (user.verificationCode !== otp) {
      throw new ApplicationError(
        httpStatus.BAD_REQUEST,
        'Invalid verification code'
      )
    }

    user.isVerified = true
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    return user
  } catch (error) {
    if (error instanceof ApplicationError) throw error
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error verifying code'
    )
  }
}

export const UserServices = {
  createUserIntoDB,
  loginUserFromDB,
  getAllUsers,
  getUserById,
  updateUserDetails,
  changeUserPassword,
  generateAndSendOTP,
  verifyOTP,
}
