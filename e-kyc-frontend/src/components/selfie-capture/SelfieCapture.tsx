/* eslint-disable @typescript-eslint/no-explicit-any */

import { Camera, Loader2, RefreshCw, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import Webcam from 'react-webcam'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  useGetUserSelfieQuery,
  useUploadSelfieMutation,
} from '@/redux/features/selfie/selfieApi'
import { selectUploadProgress } from '@/redux/features/selfie/selfieSlice'
import { useSelector } from 'react-redux'

export function SelfieCapture() {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadSelfie, { isLoading }] = useUploadSelfieMutation()
  const { data: existingSelfie, isLoading: isFetchingExistingSelfie } =
    useGetUserSelfieQuery()
  const uploadProgress = useSelector(selectUploadProgress)

  useEffect(() => {
    if (existingSelfie?.data?.selfieImageUrl) {
      setCapturedImage(existingSelfie.data.selfieImageUrl)
    }
  }, [existingSelfie])

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      setCapturedImage(imageSrc)
    }
  }, [webcamRef])

  const resetCapture = () => {
    setCapturedImage(null)
  }

  const handleSubmit = async () => {
    if (!capturedImage) {
      toast.error('Please capture a selfie first')
      return
    }

    try {
      const result = await uploadSelfie({
        selfieImage: capturedImage,
        metadata: { capturedAt: new Date().toISOString() },
      }).unwrap()

      if (result.success) {
        toast.success('Selfie uploaded successfully')
      } else {
        toast.error(result.message || 'Failed to upload selfie')
      }
    } catch (error: any) {
      console.error('Error uploading selfie:', error)
      toast.error(error.message || 'Failed to upload selfie')
    }
  }

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: 'user',
  }

  if (isFetchingExistingSelfie) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>
          {existingSelfie?.data ? 'Your Selfie' : 'Take Selfie'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg overflow-hidden border border-gray-200">
          {capturedImage ? (
            <div className="relative">
              <img
                src={capturedImage || '/placeholder.svg'}
                alt="Captured selfie"
                className="w-full max-h-96 object-cover"
              />
              {existingSelfie?.data && (
                <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs">
                  {existingSelfie.data.status.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full max-h-96 object-cover"
            />
          )}
        </div>

        <div className="flex justify-center space-x-4">
          {capturedImage ? (
            <Button
              type="button"
              variant="outline"
              onClick={resetCapture}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {existingSelfie?.data ? 'Take New Selfie' : 'Retake'}
            </Button>
          ) : (
            <Button type="button" onClick={captureImage} disabled={isLoading}>
              <Camera className="mr-2 h-4 w-4" />
              Capture Selfie
            </Button>
          )}
        </div>

        {existingSelfie?.data && (
          <div className="text-sm space-y-2 bg-muted p-4 rounded-md">
            <p>
              <span className="font-medium">Status:</span>{' '}
              {existingSelfie.data.status}
            </p>
            {existingSelfie.data.rejectionReason && (
              <p>
                <span className="font-medium">Rejection Reason:</span>{' '}
                {existingSelfie.data.rejectionReason}
              </p>
            )}
            <p>
              <span className="font-medium">Verification Status:</span>
              {existingSelfie.data.isVerified ? (
                <span className="text-green-600 ml-1">Verified</span>
              ) : (
                <span className="text-amber-600 ml-1">
                  Pending Verification
                </span>
              )}
            </p>
            <p>
              <span className="font-medium">Uploaded:</span>
              {new Date(existingSelfie.data.createdAt).toLocaleString()}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {uploadProgress}% Complete
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {(!existingSelfie?.data || !existingSelfie.data.isVerified) && (
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!capturedImage || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {existingSelfie?.data ? 'Update Selfie' : 'Upload Selfie'}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
