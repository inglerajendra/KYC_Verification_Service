/* eslint-disable @typescript-eslint/no-explicit-any */

export enum SelfieStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ISelfie {
  user: string
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

export interface SelfieModel {
  findByUserId(userId: string): Promise<ISelfieDocument | null>
}
