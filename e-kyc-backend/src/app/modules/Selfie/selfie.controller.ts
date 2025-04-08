import type { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../utils/catchAsync'
import sendResponse from '../../../utils/sendResponse'
import { SelfieStatus } from './selfie.interface'
import { SelfieServices } from './selfie.service'

const uploadSelfieController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id
      const selfieData = req.body

      const selfie = await SelfieServices.uploadSelfie(userId, selfieData)

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Selfie uploaded successfully',
        data: selfie,
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

const getUserSelfieController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user._id
      const selfie = await SelfieServices.getUserSelfie(userId)

      if (!selfie) {
        return sendResponse(res, {
          statusCode: httpStatus.NOT_FOUND,
          success: false,
          message: 'No selfie found for this user',
          data: null,
        })
      }

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Selfie retrieved successfully',
        data: selfie,
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

const getSelfieByIdController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user._id

      const selfie = await SelfieServices.getSelfieById(id)

      if (
        selfie.user.toString() !== userId &&
        (req as any).user.role !== 'admin'
      ) {
        return sendResponse(res, {
          statusCode: httpStatus.FORBIDDEN,
          success: false,
          message: 'You do not have permission to view this selfie',
          data: null,
        })
      }

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Selfie retrieved successfully',
        data: selfie,
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

const updateSelfieStatusController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { status, rejectionReason } = req.body

      if (!Object.values(SelfieStatus).includes(status as SelfieStatus)) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'Invalid status',
          data: null,
        })
      }

      if (status === SelfieStatus.REJECTED && !rejectionReason) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: 'Rejection reason is required when rejecting a selfie',
          data: null,
        })
      }

      const selfie = await SelfieServices.updateSelfieStatus(
        id,
        status as SelfieStatus,
        rejectionReason
      )

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Selfie status updated successfully',
        data: selfie,
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

const deleteSelfieController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = (req as any).user._id

      await SelfieServices.deleteSelfie(id, userId)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Selfie deleted successfully',
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

const getUserVerificationDataController = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params

      if ((req as any).user.role !== 'admin') {
        return sendResponse(res, {
          statusCode: httpStatus.FORBIDDEN,
          success: false,
          message: 'You do not have permission to access this resource',
          data: null,
        })
      }

      const verificationData = await SelfieServices.getUserVerificationData(
        userId
      )

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User verification data retrieved successfully',
        data: verificationData,
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

export const SelfieControllers = {
  uploadSelfieController,
  getUserSelfieController,
  getSelfieByIdController,
  updateSelfieStatusController,
  deleteSelfieController,
  getUserVerificationDataController,
}
