import { Button } from '@/components/ui/button'
import { useGetUserProfileQuery } from '@/redux/features/auth/authApi'
import { selectCurrentToken } from '@/redux/features/auth/authSlice'
import {
  Bell,
  File,
  Home,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  handleLogout: () => void
}

const Navbar = ({ handleLogout }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const token = useSelector(selectCurrentToken)

  const { data } = useGetUserProfileQuery(token)
  const user = data?.data

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-xl font-bold">Taggle</h1>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/document-upload">
              <Button
                variant={isActive('/document-upload') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center"
              >
                <File className="h-4 w-4 mr-2" />
                Documents
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>

            {user?.role == 'admin' ? (
              <Link to="/admin-page">
                <Button
                  variant={isActive('/admin-page') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            ) : (
              <></>
            )}
            <Button variant="ghost" size="sm" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Link to="/dashboard" className="block">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/document-upload" className="block">
              <Button
                variant={isActive('/document-upload') ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <File className="h-4 w-4 mr-2" />
                Documents
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Link to="/admin-page" className="block">
              <Button
                variant={isActive('/admin-page') ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
