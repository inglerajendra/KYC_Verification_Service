/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Badge,
  Bell,
  CreditCard,
  File,
  FileText,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetUserProfileQuery } from '@/redux/features/auth/authApi'
import { logout, selectCurrentToken } from '@/redux/features/auth/authSlice'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const token = useSelector(selectCurrentToken)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data, isLoading, error } = useGetUserProfileQuery(token)
  const user = data?.data

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const verificationSteps = [
    { name: 'Email Verified', completed: true },
    { name: 'Personal Details', completed: true },
    { name: 'Identity Documents', completed: user?.isVerified || false },
    { name: 'Address Verification', completed: user?.isVerified || false },
  ]

  const completedSteps = verificationSteps.filter(
    (step) => step.completed
  ).length
  const progress = (completedSteps / verificationSteps.length) * 100

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const joinDate = formatDate(user?.createdAt)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-xl font-bold">eKYC Dashboard</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <File className="h-4 w-4 mr-2" />
              <Link to={'/document-upload'}>Document</Link>
            </Button>

            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <div className="px-4 py-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link
                  to="/document-upload"
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <File className="h-4 w-4 mr-2" />
                  Document
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Link
                  to="#"
                  className="flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : error ? (
                <div className="text-red-500">
                  <p>Failed to load profile data. Please try again.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="mt-2"
                  >
                    Reload
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-primary/10 p-6 rounded-full">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Username
                    </p>
                    <p className="font-medium">{user?.username || 'N/A'}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="font-medium">{user?.email || 'N/A'}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Role
                    </p>
                    <div className="flex items-center">
                      <Badge className="capitalize">
                        {user?.role || 'N/A'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </p>
                    <p className="font-medium">{joinDate}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Verification Status
                    </p>
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          user?.isVerified ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                      ></div>
                      <p className="font-medium">
                        {user?.isVerified ? 'Verified' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => navigate('/profile/edit')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-8 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Welcome, {user?.username || 'User'}</CardTitle>
                    <CardDescription>
                      Your eKYC verification dashboard
                    </CardDescription>
                  </div>

                  <Badge
                    className={
                      user?.isVerified
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                    }
                  >
                    {user?.isVerified
                      ? 'Fully Verified'
                      : 'Verification Required'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">
                        Verification Progress
                      </p>
                      <p className="text-sm font-medium">
                        {Math.round(progress)}%
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {verificationSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 rounded-full ${
                              step.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          ></div>
                          <span className="text-sm">{step.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <h3 className="font-medium text-lg">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      className="flex flex-col items-center justify-center h-24"
                      variant="outline"
                      onClick={() => navigate('/verification')}
                    >
                      <Shield className="h-6 w-6 text-primary mb-2" />
                      <p className="font-medium">Verify Identity</p>
                    </Button>

                    <Button
                      className="flex flex-col items-center justify-center h-24"
                      variant="outline"
                      onClick={() => navigate('/documents')}
                    >
                      <FileText className="h-6 w-6 text-primary mb-2" />
                      <p className="font-medium">Documents</p>
                    </Button>

                    <Button
                      className="flex flex-col items-center justify-center h-24"
                      variant="outline"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="h-6 w-6 text-primary mb-2" />
                      <p className="font-medium">Settings</p>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Profile Updated</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(user?.updatedAt || new Date())}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Account Created</p>
                          <p className="text-xs text-muted-foreground">
                            {joinDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="link" size="sm" className="ml-auto">
                    View all activity
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Verification Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <CreditCard className="h-3 w-3 text-primary" />
                      </div>
                      <span>Keep your ID documents ready for verification</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <CreditCard className="h-3 w-3 text-primary" />
                      </div>
                      <span>
                        Ensure proper lighting when taking document photos
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                        <CreditCard className="h-3 w-3 text-primary" />
                      </div>
                      <span>Make sure your selfie clearly shows your face</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-auto"
                    onClick={() => navigate('/help')}
                  >
                    View help center
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
