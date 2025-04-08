import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './api/apiSlice'
import authReducer from './features/auth/authSlice'
import { documentApi } from './features/document/documentApi'
import documentReducer from './features/document/documentSlice'
import { selfieApi } from './features/selfie/selfieApi'
import selfieReducer from './features/selfie/selfieSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    document: documentReducer,
    selfie: selfieReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [selfieApi.reducerPath]: selfieApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware,
      documentApi.middleware,
      selfieApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
