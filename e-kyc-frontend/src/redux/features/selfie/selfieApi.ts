/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootState } from '@/redux/store'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  type Selfie,
  type SelfieStatus,
  setError,
  setLoading,
  setSelfie,
  setUploadProgress,
} from './selfieSlice'

const IMAGEBB_API_KEY = '1d3aeaaa275b6cf01dbc03eea8be1730'

export interface UploadSelfieRequest {
  selfieImage: File | string
  metadata?: Record<string, any>
}

export interface UpdateSelfieStatusRequest {
  selfieId: string
  status: SelfieStatus
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

async function uploadImageToImageBB(
  file: File,
  dispatch: any
): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)

  dispatch(setUploadProgress(10))

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

  dispatch(setUploadProgress(70))

  const result: ImageBBResponse = await response.json()

  if (!result.success) {
    throw new Error(
      result.error?.message || 'Failed to upload image to ImageBB'
    )
  }

  dispatch(setUploadProgress(100))

  return result.data.url
}

async function uploadBase64ToImageBB(
  base64Image: string,
  dispatch: any
): Promise<string> {
  const base64Data = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image

  dispatch(setUploadProgress(10))

  const formData = new FormData()
  formData.append('image', base64Data)

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

  dispatch(setUploadProgress(70))

  const result: ImageBBResponse = await response.json()

  if (!result.success) {
    throw new Error(
      result.error?.message || 'Failed to upload image to ImageBB'
    )
  }

  dispatch(setUploadProgress(100))

  return result.data.url
}

export const selfieApi = createApi({
  reducerPath: 'selfieApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8040/api/selfie',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Selfie'],
  endpoints: (builder) => ({
    getUserSelfie: builder.query<ApiResponse<Selfie>, void>({
      query: () => '/user',
      providesTags: ['Selfie'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        try {
          const { data } = await queryFulfilled
          if (data.success && data.data) {
            dispatch(setSelfie(data.data))
          }
        } catch (error: any) {
          dispatch(setError(error?.error?.message || 'Failed to fetch selfie'))
        }
      },
    }),

    getSelfieById: builder.query<ApiResponse<Selfie>, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Selfie', id }],
    }),

    uploadSelfie: builder.mutation<ApiResponse<Selfie>, UploadSelfieRequest>({
      queryFn: async (
        selfieData,
        { dispatch, getState }
      ): Promise<
        { data: ApiResponse<Selfie> } | { error: FetchBaseQueryError }
      > => {
        dispatch(setLoading(true))

        try {
          let selfieImageUrl: string

          if (typeof selfieData.selfieImage !== 'string') {
            selfieImageUrl = await uploadImageToImageBB(
              selfieData.selfieImage,
              dispatch
            )
          } else {
            if (selfieData.selfieImage.startsWith('data:image')) {
              selfieImageUrl = await uploadBase64ToImageBB(
                selfieData.selfieImage,
                dispatch
              )
            } else {
              selfieImageUrl = selfieData.selfieImage
            }
          }

          const selfiePayload = {
            selfieImageUrl,
            metadata: selfieData.metadata,
          }

          const token = (getState() as RootState).auth.token

          const response: Response = await fetch(
            'http://localhost:8040/api/selfie/upload',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(selfiePayload),
            }
          )

          const result: ApiResponse<Selfie> = await response.json()

          if (!response.ok) {
            throw new Error(result.message || 'Failed to upload selfie')
          }

          if (result.success && result.data) {
            dispatch(setSelfie(result.data))
          }

          dispatch(setLoading(false))
          return { data: result }
        } catch (error: any) {
          dispatch(setLoading(false))
          dispatch(setError(error.message || 'Failed to upload selfie'))
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error.message || 'Failed to upload selfie',
            } as FetchBaseQueryError,
          }
        }
      },
      invalidatesTags: ['Selfie'],
    }),

    deleteSelfie: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Selfie'],
    }),
  }),
})

export const {
  useGetUserSelfieQuery,
  useGetSelfieByIdQuery,
  useUploadSelfieMutation,
  useDeleteSelfieMutation,
} = selfieApi
