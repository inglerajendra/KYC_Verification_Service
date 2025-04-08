/* eslint-disable @typescript-eslint/no-explicit-any */

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import {
  useSendVerificationOTPMutation,
  useVerifyOTPMutation,
} from '@/redux/features/auth/authApi'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export function OTPVerificationForm() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)

  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()
  const [sendOTP, { isLoading: isSending }] = useSendVerificationOTPMutation()

  useEffect(() => {
    if (userId) {
      handleSendOTP()
    }
  }, [userId])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!userId) return

    try {
      await sendOTP({ userId }).unwrap()
      toast.success('Verification code sent to your email')
      setCountdown(60)
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to send verification code')
    }
  }

  const handleVerifyOTP = async () => {
    if (!userId || !otp) return

    try {
      await verifyOTP({ userId, otp }).unwrap()
      toast.success('Email verified successfully!')
      navigate('/login')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Invalid verification code')
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="pt-6 space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            We've sent a verification code to your email address. Please enter
            the code below to verify your account.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button
          onClick={handleVerifyOTP}
          className="w-full"
          disabled={isVerifying || !otp || otp.length < 6}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive the code?
          </p>
          {countdown > 0 ? (
            <p className="text-sm">
              Resend code in <span className="font-medium">{countdown}s</span>
            </p>
          ) : (
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={handleSendOTP}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
