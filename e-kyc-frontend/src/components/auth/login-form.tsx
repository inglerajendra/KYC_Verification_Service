/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useLoginMutation } from '@/redux/features/auth/authApi'
import { setCredentials } from '@/redux/features/auth/authSlice'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const [loginSuccess, setLoginSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login(data).unwrap()
      console.log('Login result:', result)

      if (result.success) {
        const { user, token } = result.data
        console.log('User:', user.role)

        dispatch(setCredentials({ user, token }))

        toast.success('Login successful!')
        setLoginSuccess(true)

        setTimeout(() => {
          if (user?.role === 'admin') {
            navigate('/admin-page')
          } else {
            navigate('/dashboard')
          }
        }, 100)
      } else {
        toast.error(result.message || 'Login failed. Please try again.')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error?.data?.message || 'Login failed. Please try again.')
    }
  }

  const handleDashboardRedirect = () => {
    navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6 space-y-4">
          {loginSuccess ? (
            <div className="text-center space-y-4">
              <div className="text-green-500 font-semibold text-lg">
                Login Successful!
              </div>
              <p>Redirecting to dashboard...</p>
              <Button
                type="button"
                className="w-full"
                onClick={handleDashboardRedirect}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  {...register('username')}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => navigate('/forgot-password')}
                    type="button"
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className={
                      errors.password ? 'border-destructive pr-10' : 'pr-10'
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!loginSuccess && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate('/register')}
              type="button"
            >
              Create an account
            </Button>
          </p>
        </CardFooter>
      </Card>
    </form>
  )
}
