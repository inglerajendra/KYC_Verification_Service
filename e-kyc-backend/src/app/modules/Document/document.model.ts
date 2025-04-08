import { Schema, model } from 'mongoose'
import {
  type DocumentModel,
  DocumentStatus,
  DocumentType,
  type IDocumentDocument,
} from './document.interface'

const documentSchema = new Schema<IDocumentDocument, DocumentModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: [true, 'Document type is required'],
    },
    documentNumber: {
      type: String,
      required: [true, 'Document number is required'],
    },
    documentName: {
      type: String,
      required: [true, 'Document name is required'],
    },
    documentFrontImageUrl: {
      type: String,
      required: [true, 'Document front image URL is required'],
    },
    documentBackImageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.PENDING,
    },
    rejectionReason: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    issuedDate: {
      type: Date,
    },
    metadata: {
      type: Object,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

documentSchema.statics.findByUserAndType = async function (
  userId: string,
  documentType: DocumentType
): Promise<IDocumentDocument | null> {
  return this.findOne({ user: userId, documentType })
}

documentSchema.index({ user: 1, documentType: 1 }, { unique: true })
documentSchema.index({ documentNumber: 1 })
documentSchema.index({ status: 1 })

export const Document = model<IDocumentDocument, DocumentModel>(
  'Document',
  documentSchema
)
