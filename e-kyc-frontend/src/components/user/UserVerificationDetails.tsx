/* eslint-disable @typescript-eslint/no-unused-vars */
import { useGetUserProfileQuery } from '@/redux/features/auth/authApi'
import { selectCurrentToken } from '@/redux/features/auth/authSlice'
import { useGetUserDocumentsQuery } from '@/redux/features/document/documentApi'
import {
  Document,
  DocumentStatus,
} from '@/redux/features/document/documentSlice'
import { useGetUserSelfieQuery } from '@/redux/features/selfie/selfieApi'
import { Selfie, SelfieStatus } from '@/redux/features/selfie/selfieSlice'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const UserVerificationDetails: React.FC = () => {
  const token = useSelector(selectCurrentToken)

  const { data } = useGetUserProfileQuery(token)
  const user = data?.data

  const {
    data: documentsResponse,
    isLoading: isDocumentsLoading,
    refetch: refetchDocuments,
  } = useGetUserDocumentsQuery()
  const {
    data: selfieResponse,
    isLoading: isSelfieLoading,
    refetch: refetchSelfie,
  } = useGetUserSelfieQuery()

  const [documents, setDocuments] = useState<Document[]>([])
  const [selfie, setSelfie] = useState<Selfie | null>(null)

  useEffect(() => {
    if (documentsResponse?.success && documentsResponse.data) {
      setDocuments(documentsResponse.data)
    }
  }, [documentsResponse])

  useEffect(() => {
    if (selfieResponse?.success && selfieResponse.data) {
      setSelfie(selfieResponse.data)
    }
  }, [selfieResponse])

  const getStatusBadgeClass = (status: DocumentStatus | SelfieStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
      case SelfieStatus.APPROVED:
        return 'bg-green-100 text-green-800'
      case DocumentStatus.REJECTED:
      case SelfieStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      case DocumentStatus.PENDING:
      case SelfieStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRefresh = () => {
    refetchDocuments()
    refetchSelfie()
  }

  if (isDocumentsLoading || isSelfieLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Verification Details
        </h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">
          User Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user?.username || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <p className="font-medium">{user?._id || 'N/A'}</p>
          </div>
          {/* <div>
            <p className="text-sm text-gray-500">Verification Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full ${verificationStatus.class}`}
            >
              {verificationStatus.text}
            </span>
          </div> */}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">
          Selfie Verification
        </h3>
        {selfie ? (
          <div>
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Selfie Image</p>
                <div className="border rounded-lg overflow-hidden h-64 bg-gray-100">
                  <img
                    src={selfie.selfieImageUrl}
                    alt="User Selfie"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                    selfie.status
                  )}`}
                >
                  {selfie.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selfie.isVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {selfie.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
              {selfie.rejectionReason && (
                <div>
                  <p className="text-sm text-gray-500">Rejection Reason</p>
                  <p className="text-red-600">{selfie.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded text-gray-500">
            No selfie uploaded. Please upload a selfie for verification.
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">
          Document Verification
        </h3>
        {documents.length > 0 ? (
          <div className="space-y-8">
            {documents.map((document) => (
              <div key={document._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-md font-medium">
                    {document.documentName}
                  </h4>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                      document.status
                    )}`}
                  >
                    {document.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Document Type</p>
                    <p>{document.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Document Number
                    </p>
                    <p>{document.documentNumber}</p>
                  </div>
                  {document.issuedDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Issued Date</p>
                      <p>
                        {new Date(document.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {document.expiryDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Expiry Date</p>
                      <p>
                        {new Date(document.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Front Image</p>
                    <div className="border rounded-lg overflow-hidden h-48 bg-gray-100">
                      <img
                        src={document.documentFrontImageUrl}
                        alt={`${document.documentName} Front`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  {document.documentBackImageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Back Image</p>
                      <div className="border rounded-lg overflow-hidden h-48 bg-gray-100">
                        <img
                          src={document.documentBackImageUrl}
                          alt={`${document.documentName} Back`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Verified</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        document.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {document.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {document.rejectionReason && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Rejection Reason
                      </p>
                      <p className="text-red-600">{document.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded text-gray-500">
            No documents uploaded. Please upload identification documents for
            verification.
          </div>
        )}
      </div>
    </div>
  )
}

export default UserVerificationDetails
