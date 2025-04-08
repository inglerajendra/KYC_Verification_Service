import type mongoose from 'mongoose'
import type { Document, Model } from 'mongoose'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface IUser {
  username: string
  password: string
  confirmPassword?: string
  role: UserRole
  email: string
  isVerified: boolean
  verificationCode?: string
  verificationCodeExpires?: Date
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId
  isPasswordMatched(
    enteredPassword: string,
    hashedPassword: string
  ): Promise<boolean>
}

export interface UserModel extends Model<IUserDocument> {
  findByCredentials(username: string, password: string): Promise<IUserDocument>
  isUserExistById(_id: string): Promise<IUserDocument | null>
  isPasswordMatched(
    plainTextPassword: string,
    hashPassword: string
  ): Promise<boolean>
}
