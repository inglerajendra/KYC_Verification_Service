'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
// import { DocumentList } from '@/components/document/document-list'
import { DocumentUploadForm } from '@/components/document/document-upload-form'
import { SelfieCapture } from '@/components/selfie-capture/SelfieCapture'
import Navbar from '@/components/shared/navbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UserVerificationDetails from '@/components/user/UserVerificationDetails'
import { logout } from '@/redux/features/auth/authSlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function DocumentUpload() {
  const [activeTab, setActiveTab] = useState('upload')
  const [documentUploaded, setDocumentUploaded] = useState(false)

  useEffect(() => {
    if (documentUploaded) {
      setActiveTab('selfie')
      setDocumentUploaded(false)
    }
  }, [documentUploaded])

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <ProtectedRoute>
      <Navbar handleLogout={handleLogout} />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Document Management</h1>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="selfie">Take Selfie</TabsTrigger>
              {/* <TabsTrigger value="view">View Documents</TabsTrigger> */}
              <TabsTrigger value="result">View Results</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <DocumentUploadForm
                onUploadSuccess={() => setDocumentUploaded(true)}
              />
            </TabsContent>

            <TabsContent value="selfie">
              <SelfieCapture />
            </TabsContent>
            {/* 
            <TabsContent value="view">
              <DocumentList />
            </TabsContent> */}

            <TabsContent value="result">
              <UserVerificationDetails />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
