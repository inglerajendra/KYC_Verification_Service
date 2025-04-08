/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../store'
import {
  type Document,
  type DocumentStatus,
  type DocumentType,
  addDocument,
  setDocuments,
  setError,
  setLoading,
  setUploadProgress,
} from './documentSlice'

const IMAGEBB_API_KEY = '1d3aeaaa275b6cf01dbc03eea8be1730'

export interface UploadDocumentRequest {
  documentType: DocumentType
  documentNumber: string
  documentName: string
  documentFrontImage: File
  documentBackImage?: File
  expiryDate?: string
  issuedDate?: string
  metadata?: Record<string, any>
}

export interface UpdateDocumentStatusRequest {
  documentId: string
  status: DocumentStatus
  rejectionReason?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface ImageBBResponse {
  data: {
    url: string
    [key: string]: any
  }
  success: boolean
  status: number
  error?: {
    message: string
    [key: string]: any
  }
}

export const documentApi = createApi({
  reducerPath: 'documentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8040/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    getUserDocuments: builder.query<ApiResponse<Document[]>, void>({
      query: () => '/user',
      providesTags: ['Document'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        try {
          const { data } = await queryFulfilled
          if (data.success && data.data) {
            dispatch(setDocuments(data.data))
          }
        } catch (error: any) {
          dispatch(
            setError(error?.error?.message || 'Failed to fetch documents')
          )
        }
      },
    }),

    getDocumentById: builder.query<ApiResponse<Document>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Document', id }],
    }),

    uploadDocument: builder.mutation<
      ApiResponse<Document>,
      UploadDocumentRequest
    >({
      queryFn: async (documentData, { dispatch, getState }) => {
        dispatch(setLoading(true))

        try {
          const frontImageUrl = await uploadImageToImageBB(
            documentData.documentFrontImage,
            dispatch,
            0,
            documentData.documentBackImage ? 50 : 100
          )

          let backImageUrl = undefined
          if (documentData.documentBackImage) {
            backImageUrl = await uploadImageToImageBB(
              documentData.documentBackImage,
              dispatch,
              50,
              100
            )
          }

          const documentPayload = {
            documentType: documentData.documentType,
            documentNumber: documentData.documentNumber,
            documentName: documentData.documentName,
            documentFrontImageUrl: frontImageUrl,
            documentBackImageUrl: backImageUrl,
            expiryDate: documentData.expiryDate,
            issuedDate: documentData.issuedDate,
            metadata: documentData.metadata,
          }

          const token = (getState() as RootState).auth.token

          const response: Response = await fetch(
            'http://localhost:8040/api/upload',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(documentPayload),
            }
          )

          const result: ApiResponse<Document> = await response.json()

          if (!response.ok) {
            throw new Error(result.message || 'Failed to upload document')
          }

          if (result.success && result.data) {
            dispatch(addDocument(result.data))
          }

          dispatch(setLoading(false))
          return { data: result }
        } catch (error: any) {
          dispatch(setLoading(false))
          dispatch(setError(error.message || 'Failed to upload document'))
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error.message || 'Failed to upload document',
            } as FetchBaseQueryError,
          }
        }
      },
      invalidatesTags: ['Document'],
    }),

    deleteDocument: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
  }),
})

async function uploadImageToImageBB(
  file: File,
  dispatch: any,
  startProgress: number,
  endProgress: number
): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  dispatch(setUploadProgress(startProgress))

  const response: Response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMAGEBB_API_KEY}`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Failed to upload image to ImageBB')
  }

  const result: ImageBBResponse = await response.json()

  if (!result.success) {
    throw new Error(
      result.error?.message || 'Failed to upload image to ImageBB'
    )
  }

  dispatch(setUploadProgress(endProgress))

  return result.data.url
}

export const {
  useGetUserDocumentsQuery,
  useGetDocumentByIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = documentApi
