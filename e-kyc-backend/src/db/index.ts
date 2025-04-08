import httpStatus from 'http-status'
import mongoose from 'mongoose'
import config from '../config'
import { AppError } from '../errors/AppError'
import logger from '../utils/logger'

export const connectDB = async (): Promise<void> => {
  try {
    if (!config.database_url) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Database connection URL not found in environment variables',
        false
      )
    }

    await mongoose.connect(config.database_url)
    logger.info('✅ Database connection established successfully')
  } catch (error: any) {
    logger.error('❌ Database connection failed:', error)
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to connect to database',
      false,
      '',
      error
    )
  }
}
