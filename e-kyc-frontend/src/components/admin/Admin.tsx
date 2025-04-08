/* eslint-disable @typescript-eslint/no-explicit-any */
import { logout } from '@/redux/features/auth/authSlice'
import {
  Document,
  DocumentStatus,
  DocumentType,
} from '@/redux/features/document/documentSlice'
import { Selfie, SelfieStatus } from '@/redux/features/selfie/selfieSlice'
import { RootState } from '@/redux/store'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../shared/navbar'

interface User {
  _id: string
  username: string
  email: string
  isVerified: boolean
}

interface UserVerificationData {
  selfie: Selfie | null
  documents: Document[]
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserVerificationData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const token = useSelector((state: RootState) => state.auth.token)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:8040/api/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('Response data:', response.data)

        if (response.data.success) {
          if (response.data.data && !Array.isArray(response.data.data)) {
            setUsers([response.data.data])
          } else if (Array.isArray(response.data.data)) {
            setUsers(response.data.data)
          } else {
            console.error('Unexpected data format:', response.data.data)
            setUsers([])
          }
        } else {
          setUsers([])
        }
      } catch (err: any) {
        console.error('API error:', err)
        setError(err.response?.data?.message || 'Failed to fetch users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [token])

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true)
      const response = await axios.get(
        `http://localhost:8040/api/selfie/verification/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        setUserData(response.data.data)
      }
      setSelectedUser(userId)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  const updateDocumentStatus = async (
    documentId: string,
    status: DocumentStatus,
    rejectionReason?: string
  ) => {
    try {
      setLoading(true)
      const response = await axios.patch(
        `http://localhost:8040/api/${documentId}/status`,
        {
          status,
          rejectionReason: rejectionReason || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.success) {
        if (selectedUser) {
          fetchUserData(selectedUser)
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to update document status'
      )
    } finally {
      setLoading(false)
    }
  }

  const updateSelfieStatus = async (
    selfieId: string,
    status: SelfieStatus,
    rejectionReason?: string
  ) => {
    try {
      setLoading(true)
      const response = await axios.patch(
        `http://localhost:8040/api/selfie/${selfieId}/status`,
        {
          status,
          rejectionReason: rejectionReason || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.success) {
        if (selectedUser) {
          fetchUserData(selectedUser)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update selfie status')
    } finally {
      setLoading(false)
    }
  }

  const updateUserVerification = async (
    userId: string,
    isVerified: boolean
  ) => {
    try {
      setLoading(true)
      const response = await axios.patch(
        `http://localhost:8040/api/users/${userId}/verification`,
        {
          isVerified,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isVerified } : user
          )
        )
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to update user verification'
      )
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      setLoading(true)
      const response = await axios.delete(
        `http://localhost:8040/api/document/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        if (selectedUser) {
          fetchUserData(selectedUser)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document')
    } finally {
      setLoading(false)
    }
  }

  const deleteSelfie = async (selfieId: string) => {
    try {
      setLoading(true)
      const response = await axios.delete(
        `http://localhost:8040/api/selfie/${selfieId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.success) {
        if (selectedUser) {
          fetchUserData(selectedUser)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete selfie')
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: DocumentStatus | SelfieStatus) => {
    switch (status) {
      case DocumentStatus.PENDING:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
            Pending
          </span>
        )
      case DocumentStatus.APPROVED:
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
            Approved
          </span>
        )
      case DocumentStatus.REJECTED:
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">
            Rejected
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">
            Unknown
          </span>
        )
    }
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case DocumentType.AADHAAR:
        return 'Aadhaar Card'
      case DocumentType.PAN:
        return 'PAN Card'
      case DocumentType.PASSPORT:
        return 'Passport'
      case DocumentType.DRIVING_LICENSE:
        return 'Driving License'
      case DocumentType.OTHER:
        return 'Other Document'
      default:
        return 'Unknown Document'
    }
  }
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      <Navbar handleLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              className="float-right text-red-700"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              {loading && users.length === 0 ? (
                <p className="text-center py-4">Loading users...</p>
              ) : Array.isArray(users) && users.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user._id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{user.username}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="mt-1">
                            {user.isVerified ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">
                                Not Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => fetchUserData(user._id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-2/3">
            {selectedUser ? (
              loading ? (
                <div className="text-center py-8">Loading user data...</div>
              ) : userData ? (
                <div>
                  <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">
                        User Verification
                      </h2>
                      {users.find((u) => u._id === selectedUser) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateUserVerification(selectedUser, true)
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Verify User
                          </button>
                          <button
                            onClick={() =>
                              updateUserVerification(selectedUser, false)
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject Verification
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="text-lg font-medium mb-2">Selfie</h3>
                      {userData.selfie ? (
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-1/3">
                            <img
                              src={userData.selfie.selfieImageUrl}
                              alt="User Selfie"
                              className="w-full h-auto object-cover rounded-lg"
                            />
                          </div>
                          <div className="w-full md:w-2/3">
                            <div className="mb-2">
                              <span className="font-medium">Status: </span>
                              {getStatusLabel(userData.selfie.status)}
                            </div>

                            {userData.selfie.rejectionReason && (
                              <div className="mb-2">
                                <span className="font-medium">
                                  Rejection Reason:{' '}
                                </span>
                                <span className="text-red-600">
                                  {userData.selfie.rejectionReason}
                                </span>
                              </div>
                            )}

                            <div className="mb-2">
                              <span className="font-medium">Uploaded: </span>
                              {new Date(
                                userData.selfie.createdAt
                              ).toLocaleString()}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  updateSelfieStatus(
                                    userData.selfie!._id,
                                    SelfieStatus.APPROVED
                                  )
                                }
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt(
                                    'Enter rejection reason:'
                                  )
                                  if (reason) {
                                    updateSelfieStatus(
                                      userData.selfie!._id,
                                      SelfieStatus.REJECTED,
                                      reason
                                    )
                                  }
                                }}
                                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      'Are you sure you want to delete this selfie?'
                                    )
                                  ) {
                                    deleteSelfie(userData.selfie!._id)
                                  }
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No selfie uploaded</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Documents</h3>
                      {userData.documents && userData.documents.length > 0 ? (
                        <div className="space-y-6">
                          {userData.documents.map((doc) => (
                            <div
                              key={doc._id}
                              className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                            >
                              <div className="flex justify-between mb-2">
                                <h4 className="font-medium">
                                  {getDocumentTypeLabel(doc.documentType)}
                                </h4>
                                {getStatusLabel(doc.status)}
                              </div>

                              <div className="mb-2">
                                <span className="font-medium">
                                  Document Number:{' '}
                                </span>
                                {doc.documentNumber}
                              </div>

                              <div className="mb-2">
                                <span className="font-medium">
                                  Document Name:{' '}
                                </span>
                                {doc.documentName}
                              </div>

                              {doc.rejectionReason && (
                                <div className="mb-2">
                                  <span className="font-medium">
                                    Rejection Reason:{' '}
                                  </span>
                                  <span className="text-red-600">
                                    {doc.rejectionReason}
                                  </span>
                                </div>
                              )}

                              {doc.expiryDate && (
                                <div className="mb-2">
                                  <span className="font-medium">
                                    Expiry Date:{' '}
                                  </span>
                                  {new Date(
                                    doc.expiryDate
                                  ).toLocaleDateString()}
                                </div>
                              )}

                              {doc.issuedDate && (
                                <div className="mb-2">
                                  <span className="font-medium">
                                    Issued Date:{' '}
                                  </span>
                                  {new Date(
                                    doc.issuedDate
                                  ).toLocaleDateString()}
                                </div>
                              )}

                              <div className="mb-2">
                                <span className="font-medium">Uploaded: </span>
                                {new Date(doc.createdAt).toLocaleString()}
                              </div>

                              <div className="flex flex-col md:flex-row gap-4 mt-3">
                                <div className="w-full md:w-1/2">
                                  <h5 className="font-medium mb-1">Front</h5>
                                  <img
                                    src={doc.documentFrontImageUrl}
                                    alt={`${doc.documentName} Front`}
                                    className="w-full h-auto object-cover rounded-lg"
                                  />
                                </div>

                                {doc.documentBackImageUrl && (
                                  <div className="w-full md:w-1/2">
                                    <h5 className="font-medium mb-1">Back</h5>
                                    <img
                                      src={doc.documentBackImageUrl}
                                      alt={`${doc.documentName} Back`}
                                      className="w-full h-auto object-cover rounded-lg"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  onClick={() =>
                                    updateDocumentStatus(
                                      doc._id,
                                      DocumentStatus.APPROVED
                                    )
                                  }
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt(
                                      'Enter rejection reason:'
                                    )
                                    if (reason) {
                                      updateDocumentStatus(
                                        doc._id,
                                        DocumentStatus.REJECTED,
                                        reason
                                      )
                                    }
                                  }}
                                  className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        'Are you sure you want to delete this document?'
                                      )
                                    ) {
                                      deleteDocument(doc._id)
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No documents uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <p className="text-gray-500">
                    No data available for selected user
                  </p>
                </div>
              )
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">
                  Select a user to view their documents and verification details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
