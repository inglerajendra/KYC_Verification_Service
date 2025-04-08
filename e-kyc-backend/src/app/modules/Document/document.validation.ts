import { z } from 'zod'
import { DocumentStatus, DocumentType } from './document.interface'

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

export const uploadDocumentValidation = z.object({
  body: z.object({
    documentType: z.enum(Object.values(DocumentType) as [string, ...string[]], {
      required_error: 'Document type is required',
    }),
    documentNumber: z.string({
      required_error: 'Document number is required',
    }),
    documentName: z.string({
      required_error: 'Document name is required',
    }),
    documentFrontImageUrl: z
      .string({
        required_error: 'Document front image URL is required',
      })
      .url('Invalid URL format for front image'),
    documentBackImageUrl: z
      .string()
      .url('Invalid URL format for back image')
      .optional(),
    expiryDate: z.string().optional(),
    issuedDate: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
})

export const updateDocumentStatusValidation = z.object({
  body: z.object({
    status: z.enum(Object.values(DocumentStatus) as [string, ...string[]], {
      required_error: 'Status is required',
    }),
    rejectionReason: z.string().optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Document ID is required',
    }),
  }),
})

export const getDocumentValidation = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Document ID is required',
    }),
  }),
})

export const deleteDocumentValidation = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Document ID is required',
    }),
  }),
})
