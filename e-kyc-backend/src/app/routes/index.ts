import express from 'express'
import { DocumentRoutes } from '../modules/Document/document.route'
import { SelfieRoutes } from '../modules/Selfie/selfie.route'
import { UserRoutes } from '../modules/User/user.routes'

const router = express.Router()

const moduleRoutes = [
  {
    path: '/api',
    route: UserRoutes,
  },
  {
    path: '/api',
    route: DocumentRoutes,
  },
  {
    path: '/api/selfie',
    route: SelfieRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
