import express from 'express'
import auth from '../../../middleware/auth'
import validateRequest from '../../../middleware/validateRequest'
import { DocumentControllers } from './document.controller'
import {
  deleteDocumentValidation,
  getDocumentValidation,
  updateDocumentStatusValidation,
  uploadDocumentValidation,
} from './document.validation'

const router = express.Router()

router.post(
  '/upload',
  auth(),
  validateRequest(uploadDocumentValidation),
  DocumentControllers.uploadDocumentController
)

router.get('/user', auth(), DocumentControllers.getUserDocumentsController)

router.get(
  '/:id',
  auth(),
  validateRequest(getDocumentValidation),
  DocumentControllers.getDocumentByIdController
)

router.delete(
  '/:id',
  auth(),
  validateRequest(deleteDocumentValidation),
  DocumentControllers.deleteDocumentController
)

router.patch(
  '/:id/status',
  auth('admin'),
  validateRequest(updateDocumentStatusValidation),
  DocumentControllers.updateDocumentStatusController
)

export const DocumentRoutes = router
