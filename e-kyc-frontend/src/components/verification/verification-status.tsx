import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetUserDocumentsQuery } from '@/redux/features/document/documentApi'
import {
  DocumentStatus,
  DocumentType,
} from '@/redux/features/document/documentSlice'
import { useGetUserSelfieQuery } from '@/redux/features/selfie/selfieApi'
import { SelfieStatus } from '@/redux/features/selfie/selfieSlice'

export function VerificationStatus() {
  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetUserDocumentsQuery()
  const { data: selfieData, isLoading: isLoadingSelfie } =
    useGetUserSelfieQuery()
  const [verificationStatus, setVerificationStatus] = useState<
    'complete' | 'pending' | 'rejected' | 'incomplete'
  >('incomplete')

  useEffect(() => {
    if (!isLoadingDocuments && !isLoadingSelfie) {
      const documents = documentsData?.data || []
      const selfie = selfieData?.data

      const hasAadhaar = documents.some(
        (doc) => doc.documentType === DocumentType.AADHAAR
      )
      const hasPan = documents.some(
        (doc) => doc.documentType === DocumentType.PAN
      )

      const hasRejectedDocument = documents.some(
        (doc) => doc.status === DocumentStatus.REJECTED
      )

      const hasSelfie = !!selfie
      const isSelfieRejected = selfie?.status === SelfieStatus.REJECTED

      if (!hasAadhaar || !hasPan || !hasSelfie) {
        setVerificationStatus('incomplete')
      } else if (hasRejectedDocument || isSelfieRejected) {
        setVerificationStatus('rejected')
      } else if (
        documents.every((doc) => doc.status === DocumentStatus.APPROVED) &&
        selfie?.status === SelfieStatus.APPROVED
      ) {
        setVerificationStatus('complete')
      } else {
        setVerificationStatus('pending')
      }
    }
  }, [documentsData, selfieData, isLoadingDocuments, isLoadingSelfie])

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'complete':
        return <CheckCircle className="h-10 w-10 text-green-500" />
      case 'pending':
        return <Clock className="h-10 w-10 text-amber-500" />
      case 'rejected':
        return <XCircle className="h-10 w-10 text-red-500" />
      case 'incomplete':
        return <Clock className="h-10 w-10 text-gray-400" />
    }
  }

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'complete':
        return 'Verification Complete'
      case 'pending':
        return 'Verification Pending'
      case 'rejected':
        return 'Verification Rejected'
      case 'incomplete':
        return 'Verification Incomplete'
    }
  }

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'complete':
        return 'Your identity has been verified successfully.'
      case 'pending':
        return 'Your documents are under review. This process may take 1-2 business days.'
      case 'rejected':
        return 'One or more of your documents were rejected. Please check the details and resubmit.'
      case 'incomplete':
        return 'Please upload all required documents and a selfie to complete verification.'
    }
  }

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'complete':
        return 'bg-green-50 border-green-200'
      case 'pending':
        return 'bg-amber-50 border-amber-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      case 'incomplete':
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (isLoadingDocuments || isLoadingSelfie) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`shadow-sm border ${getStatusColor()}`}>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold">{getStatusTitle()}</h3>
            <p className="text-muted-foreground">{getStatusDescription()}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="font-medium">Required Documents:</h4>
          <ul className="space-y-2">
            <li className="flex items-center">
              {documentsData?.data?.some(
                (doc) => doc.documentType === DocumentType.AADHAAR
              ) ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span>Aadhaar Card</span>
            </li>
            <li className="flex items-center">
              {documentsData?.data?.some(
                (doc) => doc.documentType === DocumentType.PAN
              ) ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span>PAN Card</span>
            </li>
            <li className="flex items-center">
              {selfieData?.data ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
              )}
              <span>Selfie</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
