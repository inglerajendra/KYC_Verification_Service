import type { Document, Model } from 'mongoose'
import type { IUserDocument } from '../User/user.interface'

export enum SelfieStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ISelfie {
  user: string | IUserDocument
  selfieImageUrl: string
  status: SelfieStatus
  rejectionReason?: string
  isVerified: boolean
  metadata?: Record<string, any>
}

export interface ISelfieDocument extends ISelfie, Document {
  createdAt: Date
  updatedAt: Date
}

export interface SelfieModel extends Model<ISelfieDocument> {
  findByUserId(userId: string): Promise<ISelfieDocument | null>
}
