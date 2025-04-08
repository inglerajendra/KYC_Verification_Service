import express from 'express'
import { UserControllers } from './user.controller'

import auth from '../../../middleware/auth'
import validateRequest from '../../../middleware/validateRequest'
import {
  changePasswordValidation,
  createUserValidation,
  loginUserValidation,
  sendOTPValidation,
  updateUserValidation,
  verifyOTPValidation,
} from './user.validation'

const router = express.Router()

router.post(
  '/register',
  validateRequest(createUserValidation),
  UserControllers.registerUserController
)

router.post(
  '/login',
  validateRequest(loginUserValidation),
  UserControllers.userLoginController
)

router.post(
  '/send-verification-otp',
  validateRequest(sendOTPValidation),
  UserControllers.sendVerificationOTPController
)

router.post(
  '/verify-otp',
  validateRequest(verifyOTPValidation),
  UserControllers.verifyOTPController
)

router.get('/profile', auth(), UserControllers.getUserProfileController)

router.put(
  '/profile',
  auth(),
  validateRequest(updateUserValidation),
  UserControllers.updateUserDetailsController
)

router.post(
  '/change-password',
  auth(),
  validateRequest(changePasswordValidation),
  UserControllers.changePasswordController
)

router.get('/all', auth('admin'), UserControllers.getAllUsersController)

export const UserRoutes = router
