import { Server } from 'http'
import httpStatus from 'http-status'
import app from './app'
import config from './config'
import { connectDB } from './db'
import { AppError } from './errors/AppError'
import logger from './utils/logger'

async function main() {
  try {
    await connectDB()

    const server: Server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`)
    })

    process.on('unhandledRejection', (error) => {
      logger.error('❌ Unhandled Rejection:', error)

      if (server) {
        server.close(() => {
          process.exit(1)
        })
      } else {
        process.exit(1)
      }
    })
  } catch (error: any) {
    logger.error('❌ Failed to start server:', error)
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Application failed to start',
      false,
      '',
      error
    )
  }
}

main()
