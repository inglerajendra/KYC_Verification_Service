import { AuthLayout } from '@/components/auth/auth-layout'
import { OTPVerificationForm } from '@/components/auth/otp-verification-form'

export default function OTPVerificationPage() {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the verification code sent to your email"
    >
      <OTPVerificationForm />
    </AuthLayout>
  )
}
