import { z } from 'zod'
import { SelfieStatus } from './selfie.interface'

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

export const uploadSelfieValidation = z.object({
  body: z.object({
    selfieImageUrl: z
      .string({
        required_error: 'Selfie image URL is required',
      })
      .url('Invalid URL format for selfie image'),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
})

export const updateSelfieStatusValidation = z.object({
  body: z.object({
    status: z.enum(Object.values(SelfieStatus) as [string, ...string[]], {
      required_error: 'Status is required',
    }),
    rejectionReason: z.string().optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Selfie ID is required',
    }),
  }),
})

export const getSelfieValidation = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Selfie ID is required',
    }),
  }),
})

export const deleteSelfieValidation = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Selfie ID is required',
    }),
  }),
})
