import type { Document, Model } from 'mongoose'
import type { IUserDocument } from '../User/user.interface'

export enum DocumentType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IDocument {
  user: string | IUserDocument
  documentType: DocumentType
  documentNumber: string
  documentName: string
  documentFrontImageUrl: string
  documentBackImageUrl?: string
  status: DocumentStatus
  rejectionReason?: string
  expiryDate?: Date
  issuedDate?: Date
  metadata?: Record<string, any>
  isVerified: boolean
}

export interface IDocumentDocument extends IDocument, Document {
  createdAt: Date
  updatedAt: Date
}

export interface DocumentModel extends Model<IDocumentDocument> {
  findByUserAndType(
    userId: string,
    documentType: DocumentType
  ): Promise<IDocumentDocument | null>
}
