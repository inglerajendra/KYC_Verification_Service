import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import router from './app/routes'
import { globalErrorHandler } from './errors/errorHandler'
import logger from './utils/logger'

const app: Application = express()

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://kyc-client-ui.web.app',
      'https://kyc-backend-six.vercel.app/api/upload',
    ],
    credentials: true,
  })
)

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
  logger.info('Root API accessed')
  res.send({
    Message: 'server..',
  })
})

app.use('/', router)

app.use(globalErrorHandler)

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.warn(`404 Not Found: ${req.originalUrl}`)
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND Here!',
    error: {
      path: req.originalUrl,
      message: 'Your requested path is not found!',
    },
  })
})

export default app
