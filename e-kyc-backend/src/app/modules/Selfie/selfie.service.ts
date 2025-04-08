import httpStatus from 'http-status'
import { ApplicationError } from '../../../errors/ApplicationError'
import logger from '../../../utils/logger'
import {
  type ISelfie,
  type ISelfieDocument,
  SelfieStatus,
} from './selfie.interface'
import { Selfie } from './selfie.model'

const uploadSelfie = async (
  userId: string,
  selfieData: Partial<ISelfie>
): Promise<ISelfieDocument> => {
  try {
    logger.info('Uploading selfie for user', { userId })

    const existingSelfie = await Selfie.findByUserId(userId)

    if (existingSelfie) {
      existingSelfie.selfieImageUrl = selfieData.selfieImageUrl as string
      existingSelfie.status = SelfieStatus.PENDING
      existingSelfie.rejectionReason = undefined
      existingSelfie.isVerified = false
      existingSelfie.metadata = selfieData.metadata

      await existingSelfie.save()
      return existingSelfie
    }

    const newSelfie = new Selfie({
      user: userId,
      selfieImageUrl: selfieData.selfieImageUrl,
      status: SelfieStatus.PENDING,
      isVerified: false,
      metadata: selfieData.metadata,
    })

    return await newSelfie.save()
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error uploading selfie', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error uploading selfie'
    )
  }
}

const getUserSelfie = async (
  userId: string
): Promise<ISelfieDocument | null> => {
  try {
    return await Selfie.findByUserId(userId)
  } catch (error) {
    logger.error('Error fetching user selfie', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching user selfie'
    )
  }
}

const getSelfieById = async (selfieId: string): Promise<ISelfieDocument> => {
  try {
    const selfie = await Selfie.findById(selfieId)
    if (!selfie) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'Selfie not found')
    }
    return selfie
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error fetching selfie', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching selfie'
    )
  }
}

const updateSelfieStatus = async (
  selfieId: string,
  status: SelfieStatus,
  rejectionReason?: string
): Promise<ISelfieDocument> => {
  try {
    const selfie = await Selfie.findById(selfieId)
    if (!selfie) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'Selfie not found')
    }

    selfie.status = status

    if (status === SelfieStatus.APPROVED) {
      selfie.isVerified = true
      selfie.rejectionReason = undefined
    } else if (status === SelfieStatus.REJECTED) {
      selfie.isVerified = false
      selfie.rejectionReason = rejectionReason
    }

    return await selfie.save()
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error updating selfie status', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error updating selfie status'
    )
  }
}

const deleteSelfie = async (
  selfieId: string,
  userId: string
): Promise<void> => {
  try {
    const selfie = await Selfie.findById(selfieId)

    if (!selfie) {
      throw new ApplicationError(httpStatus.NOT_FOUND, 'Selfie not found')
    }

    if (selfie.user.toString() !== userId) {
      throw new ApplicationError(
        httpStatus.FORBIDDEN,
        'You do not have permission to delete this selfie'
      )
    }

    await Selfie.findByIdAndDelete(selfieId)
  } catch (error) {
    if (error instanceof ApplicationError) throw error

    logger.error('Error deleting selfie', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error deleting selfie'
    )
  }
}

const getUserVerificationData = async (userId: string): Promise<any> => {
  try {
    const { Document } = require('../Document/document.model')

    const selfie = await Selfie.findByUserId(userId)

    const documents = await Document.find({ user: userId })

    return {
      selfie,
      documents,
    }
  } catch (error) {
    logger.error('Error fetching user verification data', error)
    throw new ApplicationError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching user verification data'
    )
  }
}

export const SelfieServices = {
  uploadSelfie,
  getUserSelfie,
  getSelfieById,
  updateSelfieStatus,
  deleteSelfie,
  getUserVerificationData,
}
