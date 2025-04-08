/* eslint-disable @typescript-eslint/no-unused-vars */
import { baseApi } from '../../api/apiSlice'
import {
  setCredentials,
  setLoading,
  setVerificationPending,
  verificationComplete,
} from './authSlice'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface VerifyOTPRequest {
  userId: string
  otp: string
}

export interface SendOTPRequest {
  userId: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: LoginRequest) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (error) {
          // Error handling will be done in the component
        } finally {
          dispatch(setLoading(false))
        }
      },
    }),

    register: builder.mutation({
      query: (userInfo: RegisterRequest) => ({
        url: '/register',
        method: 'POST',
        body: userInfo,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        try {
          const { data } = await queryFulfilled
          if (data.userId) {
            dispatch(setVerificationPending({ userId: data.userId }))
          }
        } catch (error) {
          // Error handling will be done in the component
        } finally {
          dispatch(setLoading(false))
        }
      },
    }),

    sendVerificationOTP: builder.mutation({
      query: (data: SendOTPRequest) => ({
        url: '/send-verification-otp',
        method: 'POST',
        body: data,
      }),
    }),

    verifyOTP: builder.mutation({
      query: (data: VerifyOTPRequest) => ({
        url: '/verify-otp',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(verificationComplete())
        } catch (error) {
          // Error handling will be done in the component
        }
      },
    }),

    getUserProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    updateUserProfile: builder.mutation({
      query: (data: UpdateProfileRequest) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    changePassword: builder.mutation({
      query: (data: ChangePasswordRequest) => ({
        url: '/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendVerificationOTPMutation,
  useVerifyOTPMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
} = authApi

export { authApi }
