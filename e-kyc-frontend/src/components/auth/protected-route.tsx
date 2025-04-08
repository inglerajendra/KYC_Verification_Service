/* eslint-disable react-hooks/exhaustive-deps */
import {
  selectCurrentToken,
  selectCurrentUser,
  selectIsVerificationPending,
} from '@/redux/features/auth/authSlice'
import { type ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  requireVerified?: boolean
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const token = useSelector(selectCurrentToken)
  console.log('token', token)
  const user = useSelector(selectCurrentUser)
  console.log('userttt', user)
  const isVerificationPending = useSelector(selectIsVerificationPending)
  console.log('isVerificationPending', isVerificationPending)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
  }, [token, user])

  if (token) {
    return <>{children}</>
  }
  return null
}
