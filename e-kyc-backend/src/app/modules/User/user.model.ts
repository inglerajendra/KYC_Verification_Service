import bcrypt from 'bcrypt'
import { Schema, model } from 'mongoose'
import { type IUserDocument, type UserModel, UserRole } from './user.interface'

const userSchema = new Schema<IUserDocument, UserModel>(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Username is required'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.virtual('confirmPassword')

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.post('save', (doc, next) => {
  if (doc.password) {
    doc.password = ''
  }
  next()
})

userSchema.statics.findByCredentials = async (
  username: string,
  password: string
) => {
  const user = await User.findOne({ username }).select('+password')
  if (!user) {
    throw new Error('Invalid login credentials')
  }

  const isPasswordMatched = await User.isPasswordMatched(
    password,
    user.password
  )

  if (!isPasswordMatched) {
    throw new Error('Invalid login credentials')
  }

  return user
}

userSchema.statics.isUserExistById = async (_id: string) =>
  await User.findOne({ _id }).select('+password')

userSchema.statics.isPasswordMatched = async (
  plainTextPassword: string,
  hashPassword: string
) => await bcrypt.compare(plainTextPassword, hashPassword)

userSchema.methods.isPasswordMatched = async (
  enteredPassword: string,
  hashedPassword: string
) => await bcrypt.compare(enteredPassword, hashedPassword)

export const User = model<IUserDocument, UserModel>('User', userSchema)
