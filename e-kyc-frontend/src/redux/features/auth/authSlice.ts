import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export type User = {
  _id: string
  username: string
  email: string
  role: UserRole
  isVerified: boolean
  createdAt?: string
  updatedAt?: string
}

type AuthState = {
  user: User | null
  token: string | null
  isLoading: boolean
  verificationPending: boolean
  userId: string | null
}

const loadState = (): AuthState => {
  try {
    const serializedUser = localStorage.getItem('ekyc_user')
    const serializedToken = localStorage.getItem('ekyc_token')

    return {
      user: serializedUser ? JSON.parse(serializedUser) : null,
      token: serializedToken,
      isLoading: false,
      verificationPending: false,
      userId: null,
    }
  } catch (e) {
    console.error('Failed to load auth state from localStorage:', e)
    return {
      user: null,
      token: null,
      isLoading: false,
      verificationPending: false,
      userId: null,
    }
  }
}

const initialState: AuthState = loadState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isLoading = false

      try {
        localStorage.setItem('ekyc_user', JSON.stringify(user))
        localStorage.setItem('ekyc_token', token)
      } catch (e) {
        console.error('Failed to save auth state to localStorage:', e)
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setVerificationPending: (
      state,
      action: PayloadAction<{ userId: string }>
    ) => {
      state.verificationPending = true
      state.userId = action.payload.userId
    },
    verificationComplete: (state) => {
      state.verificationPending = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.verificationPending = false
      state.userId = null

      try {
        localStorage.removeItem('ekyc_user')
        localStorage.removeItem('ekyc_token')
      } catch (e) {
        console.error('Failed to clear auth state from localStorage:', e)
      }
    },
  },
})

export const {
  setCredentials,
  setLoading,
  setVerificationPending,
  verificationComplete,
  logout,
} = authSlice.actions

export default authSlice.reducer

export const selectCurrentToken = (state: RootState) => state.auth.token
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsVerificationPending = (state: RootState) =>
  state.auth.verificationPending
export const selectUserId = (state: RootState) => state.auth.userId
export const selectIsLoading = (state: RootState) => state.auth.isLoading
