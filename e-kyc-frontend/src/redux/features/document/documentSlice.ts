/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

export enum DocumentType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  OTHER = 'other',
  ID_CARD = 'ID_CARD',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Document {
  _id: string
  user: string
  documentType: DocumentType
  documentNumber: string
  documentName: string
  documentFrontImageUrl: string
  documentBackImageUrl?: string
  status: DocumentStatus
  rejectionReason?: string
  expiryDate?: string
  issuedDate?: string
  metadata?: Record<string, any>
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface DocumentState {
  documents: Document[]
  isLoading: boolean
  error: string | null
  currentDocument: Document | null
  uploadProgress: number
}

const initialState: DocumentState = {
  documents: [],
  isLoading: false,
  error: null,
  currentDocument: null,
  uploadProgress: 0,
}

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload
      state.isLoading = false
      state.error = null
    },
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload
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
    addDocument: (state, action: PayloadAction<Document>) => {
      const index = state.documents.findIndex(
        (doc) =>
          doc._id === action.payload._id ||
          (doc.documentType === action.payload.documentType &&
            doc.user === action.payload.user)
      )

      if (index !== -1) {
        state.documents[index] = action.payload
      } else {
        state.documents.push(action.payload)
      }
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(
        (doc) => doc._id !== action.payload
      )
    },
    resetDocumentState: (state) => {
      state.documents = []
      state.isLoading = false
      state.error = null
      state.currentDocument = null
      state.uploadProgress = 0
    },
  },
})

export const {
  setDocuments,
  setCurrentDocument,
  setLoading,
  setError,
  setUploadProgress,
  resetUploadProgress,
  addDocument,
  removeDocument,
  resetDocumentState,
} = documentSlice.actions

export const selectDocuments = (state: RootState) => state.document.documents
export const selectIsLoading = (state: RootState) => state.document.isLoading
export const selectError = (state: RootState) => state.document.error
export const selectCurrentDocument = (state: RootState) =>
  state.document.currentDocument
export const selectUploadProgress = (state: RootState) =>
  state.document.uploadProgress
export const selectDocumentsByType = (state: RootState, type: DocumentType) =>
  state.document.documents.filter((doc: any) => doc.documentType === type)

export default documentSlice.reducer
