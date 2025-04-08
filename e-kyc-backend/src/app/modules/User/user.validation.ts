import { z } from 'zod'
import { UserRole } from './user.interface'

export const createUserValidation = z.object({
  body: z
    .object({
      username: z
        .string({ required_error: 'Username is required' })
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters'),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .refine((value) => /[A-Z]/.test(value), {
          message: 'Password must contain at least one uppercase letter',
        })
        .refine((value) => /[a-z]/.test(value), {
          message: 'Password must contain at least one lowercase letter',
        })
        .refine((value) => /[0-9]/.test(value), {
          message: 'Password must contain at least one number',
        })
        .refine((value) => /[^A-Za-z0-9]/.test(value), {
          message: 'Password must contain at least one special character',
        }),
      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
      role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
})

export const loginUserValidation = z.object({
  body: z.object({
    username: z.string({ required_error: 'Username is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
})

export const updateUserValidation = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .optional(),
    email: z.string().email('Invalid email format').optional(),
  }),
})

export const changePasswordValidation = z.object({
  body: z
    .object({
      currentPassword: z.string({
        required_error: 'Current password is required',
      }),
      newPassword: z
        .string({ required_error: 'New password is required' })
        .min(8, 'Password must be at least 8 characters')
        .refine((value) => /[A-Z]/.test(value), {
          message: 'Password must contain at least one uppercase letter',
        })
        .refine((value) => /[a-z]/.test(value), {
          message: 'Password must contain at least one lowercase letter',
        })
        .refine((value) => /[0-9]/.test(value), {
          message: 'Password must contain at least one number',
        })
        .refine((value) => /[^A-Za-z0-9]/.test(value), {
          message: 'Password must contain at least one special character',
        }),
      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
})

export const sendOTPValidation = z.object({
  body: z.object({
    userId: z.string({ required_error: 'User ID is required' }),
  }),
})

export const verifyOTPValidation = z.object({
  body: z.object({
    userId: z.string({ required_error: 'User ID is required' }),
    otp: z
      .string({ required_error: 'OTP is required' })
      .length(6, 'OTP must be 6 digits'),
  }),
})
