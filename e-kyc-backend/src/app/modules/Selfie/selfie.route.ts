import express from 'express'
import auth from '../../../middleware/auth'
import validateRequest from '../../../middleware/validateRequest'
import { SelfieControllers } from './selfie.controller'
import {
  deleteSelfieValidation,
  getSelfieValidation,
  updateSelfieStatusValidation,
  uploadSelfieValidation,
} from './selfie.validation'

const router = express.Router()

router.post(
  '/upload',
  auth(),
  validateRequest(uploadSelfieValidation),
  SelfieControllers.uploadSelfieController
)

router.get('/user', auth(), SelfieControllers.getUserSelfieController)

router.get(
  '/:id',
  auth(),
  validateRequest(getSelfieValidation),
  SelfieControllers.getSelfieByIdController
)

router.delete(
  '/:id',
  auth(),
  validateRequest(deleteSelfieValidation),
  SelfieControllers.deleteSelfieController
)

router.patch(
  '/:id/status',
  auth('admin'),
  validateRequest(updateSelfieStatusValidation),
  SelfieControllers.updateSelfieStatusController
)

router.get(
  '/verification/:userId',
  auth('admin'),
  SelfieControllers.getUserVerificationDataController
)

export const SelfieRoutes = router
