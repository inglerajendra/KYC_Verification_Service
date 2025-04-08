import { useGetUserProfileQuery } from '@/redux/features/auth/authApi'
import {
  selectCurrentToken,
  setCredentials,
} from '@/redux/features/auth/authSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppRoutes from './routes/routes'

function App() {
  const dispatch = useDispatch()
  const token = useSelector(selectCurrentToken)

  const { data: userProfile, isSuccess } = useGetUserProfileQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (isSuccess && userProfile && token) {
      dispatch(setCredentials({ user: userProfile, token }))
    }
  }, [isSuccess, userProfile, token, dispatch])

  return (
    <div>
      <AppRoutes />
    </div>
  )
}

export default App
