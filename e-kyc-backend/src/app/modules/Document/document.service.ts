import httpStatus from 'http-status'
import { ApplicationError } from '../../../errors/ApplicationError'
import logger from '../../../utils/logger'
import {
  DocumentStatus,
  type DocumentType,
  type IDocument,
  type IDocumentDocument,
} from './document.interface'
import { Document } from './document.model'

const uploadDocument = async (
  userId: string,
  documentData: Partial<IDocument>
): Promise<IDocumentDocument> => {
  try {
    logger.info('Uploading document for user', {
      userId,
      documentType: documentData.documentType,
    })
    const existingDocument = await Document.findByUserAndType(
      userId,
      documentData.documentType as DocumentType
    )

    if (existingDocument) {
      existingDocument.documentNumber = documentData.documentNumber as string
      existingDocument.documentName = documentData.documentName as string
      existingDocument.documentFrontImageUrl =
        documentData.documentFrontImageUrl as string

      if (documentData.documentBackImageUrl) {
        existingDocument.documentBackImageUrl =
          documentData.documentBackImageUrl
      }

      existingDocument.status = DocumentStatus.PENDING
      existingDocument.rejectionReason = undefined
      existingDocument.expiryDate = documentData.expiryDate
      existingDocument.issuedDate = documentData.issuedDate
      existingDocument.metadata = documentData.metadata
      existingDocument.isVerified = false

      await existingDocument.save()
      return existingDocument
    }

    const newDocument = new Document({
      user: userId,
      documentType: documentData.documentType,
      documentNumber: documentData.documentNumber,
      documentName: documentData.documentName,
      documentFrontImageUrl: documentData.documentFrontImageUrl,
      documentBackImageUrl: documentData.documentBackImageUrl,
      status: DocumentStatus.PENDING,
      expiryDate: documentData.expiryDate,
      issuedDate: documentData.issuedDate,
      metadata: documentData.metadata,
      isVerified: false,
    })

    return await newDocument.save()
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error uploading document', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error uploading document'
    )
  }
}

const getUserDocuments = async (
  userId: string
): Promise<IDocumentDocument[]> => {
  try {
    return await Document.find({ user: userId })
  } catch (error) {
    logger.error('Error fetching user documents', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching user documents'
    )
  }
}

const getDocumentById = async (
  documentId: string
): Promise<IDocumentDocument> => {
  try {
    const document = await Document.findById(documentId)
    if (!document) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'Document not found')
    }
    return document
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error fetching document', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching document'
    )
  }
}

const updateDocumentStatus = async (
  documentId: string,
  status: DocumentStatus,
  rejectionReason?: string
): Promise<IDocumentDocument> => {
  try {
    const document = await Document.findById(documentId)
    if (!document) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'Document not found')
    }

    document.status = status

    if (status === DocumentStatus.APPROVED) {
      document.isVerified = true
      document.rejectionReason = undefined
    } else if (status === DocumentStatus.REJECTED) {
      document.isVerified = false
      document.rejectionReason = rejectionReason
    }

    return await document.save()
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error updating document status', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating document status'
    )
  }
}

const deleteDocument = async (
  documentId: string,
  userId: string
): Promise<void> => {
  try {
    const document = await Document.findById(documentId)

    if (!document) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'Document not found')
    }

    if (document.user.toString() !== userId) {
      throw new ApplicationError(
        httpStatus.FORBIDDEN,
        'You do not have permission to delete this document'
      )
    }

    await Document.findByIdAndDelete(documentId)
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error deleting document', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error deleting document'
    )
  }
}

export const DocumentServices = {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  updateDocumentStatus,
  deleteDocument,
}
