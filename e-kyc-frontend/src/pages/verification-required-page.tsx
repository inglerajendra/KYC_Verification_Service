import { AuthLayout } from '@/components/auth/auth-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { selectUserId } from '@/redux/features/auth/authSlice'
import { MailCheck } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function VerificationRequiredPage() {
  const navigate = useNavigate()
  const userId = useSelector(selectUserId)

  return (
    <AuthLayout
      title="Verification Required"
      subtitle="Your account needs to be verified before you can continue"
    >
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6 flex flex-col items-center">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Email Verification Required
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            Your account has been created, but you need to verify your email
            address before you can access all features.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full"
            onClick={() =>
              userId ? navigate(`/verify-otp/${userId}`) : navigate('/login')
            }
          >
            Verify Email
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
