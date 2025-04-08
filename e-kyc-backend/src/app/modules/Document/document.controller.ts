import type { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../utils/catchAsync'
import sendResponse from '../../../utils/sendResponse'
import { DocumentStatus } from './document.interface'
import { DocumentServices } from './document.service'

const uploadDocumentController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id
      const documentData = req.body

      if (documentData.expiryDate) {
        documentData.expiryDate = new Date(documentData.expiryDate)
      }

      if (documentData.issuedDate) {
        documentData.issuedDate = new Date(documentData.issuedDate)
      }

      const document = await DocumentServices.uploadDocument(
        userId,
        documentData
      )

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const getUserDocumentsController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id
      const documents = await DocumentServices.getUserDocuments(userId)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Documents retrieved successfully',
        data: documents,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const getDocumentByIdController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user._id

      const document = await DocumentServices.getDocumentById(id)

      if (
        document.user.toString() !== userId &&
        (req as any).user.role !== 'admin'
      ) {
        return sendResponse(res, {
          statusCode: httpStatus.FORBIDDEN,
          success: false,
          message: 'You do not have permission to view this document',
          data: null,
        })
      }

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Document retrieved successfully',
        data: document,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const updateDocumentStatusController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { status, rejectionReason } = req.body

      // Validate status
      if (!Object.values(DocumentStatus).includes(status as DocumentStatus)) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'Invalid status',
          data: null,
        })
      }

      if (status === DocumentStatus.REJECTED && !rejectionReason) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'Rejection reason is required when rejecting a document',
          data: null,
        })
      }

      const document = await DocumentServices.updateDocumentStatus(
        id,
        status as DocumentStatus,
        rejectionReason
      )

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Document status updated successfully',
        data: document,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

const deleteDocumentController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user._id

      await DocumentServices.deleteDocument(id, userId)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Document deleted successfully',
        data: null,
      })
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message,
        data: null,
      })
    }
  }
)

export const DocumentControllers = {
  uploadDocumentController,
  getUserDocumentsController,
  getDocumentByIdController,
  updateDocumentStatusController,
  deleteDocumentController,
}
