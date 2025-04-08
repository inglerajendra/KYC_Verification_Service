import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

export enum SelfieStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Selfie {
  _id: string
  user: string
  selfieImageUrl: string
  status: SelfieStatus
  rejectionReason?: string
  isVerified: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface SelfieState {
  selfie: Selfie | null
  isLoading: boolean
  error: string | null
  uploadProgress: number
}

const initialState: SelfieState = {
  selfie: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
}

const selfieSlice = createSlice({
  name: 'selfie',
  initialState,
  reducers: {
    setSelfie: (state, action: PayloadAction<Selfie>) => {
      state.selfie = action.payload
      state.isLoading = false
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0
    },
    resetSelfieState: (state) => {
      state.selfie = null
      state.isLoading = false
      state.error = null
      state.uploadProgress = 0
    },
  },
})

export const {
  setSelfie,
  setLoading,
  setError,
  setUploadProgress,
  resetUploadProgress,
  resetSelfieState,
} = selfieSlice.actions

export const selectSelfie = (state: RootState) => state.selfie.selfie
export const selectIsLoading = (state: RootState) => state.selfie.isLoading
export const selectError = (state: RootState) => state.selfie.error
export const selectUploadProgress = (state: RootState) =>
  state.selfie.uploadProgress
export const selectIsVerified = (state: RootState) =>
  state.selfie.selfie?.isVerified || false

export default selfieSlice.reducer
