/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from 'react'

import { format } from 'date-fns'
import { CalendarIcon, FileUp, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUploadDocumentMutation } from '@/redux/features/document/documentApi'
import {
  DocumentType,
  selectUploadProgress,
} from '@/redux/features/document/documentSlice'
import { useSelector } from 'react-redux'

const documentSchema = z.object({
  documentType: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: 'Please select a document type' }),
  }),
  documentNumber: z.string().min(1, 'Document number is required'),
  documentName: z.string().min(1, 'Document name is required'),
  expiryDate: z.date().optional(),
  issuedDate: z.date().optional(),
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface DocumentUploadFormProps {
  onUploadSuccess?: () => void
}

export function DocumentUploadForm({
  onUploadSuccess,
}: DocumentUploadFormProps) {
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(
    null
  )
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null)
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation()
  const uploadProgress = useSelector(selectUploadProgress)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    defaultValues: {
      documentType: undefined,
      documentNumber: '',
      documentName: '',
    },
  })

  useEffect(() => {
    return () => {
      if (frontImagePreview) URL.revokeObjectURL(frontImagePreview)
      if (backImagePreview) URL.revokeObjectURL(backImagePreview)
    }
  }, [frontImagePreview, backImagePreview])

  const handleFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }

      if (frontImagePreview) URL.revokeObjectURL(frontImagePreview)
      const preview = URL.createObjectURL(file)

      setFrontImage(file)
      setFrontImagePreview(preview)
    }
  }

  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }

      if (backImagePreview) URL.revokeObjectURL(backImagePreview)
      const preview = URL.createObjectURL(file)

      setBackImage(file)
      setBackImagePreview(preview)
    }
  }

  const removeFrontImage = () => {
    if (frontImagePreview) URL.revokeObjectURL(frontImagePreview)
    setFrontImage(null)
    setFrontImagePreview(null)
  }

  const removeBackImage = () => {
    if (backImagePreview) URL.revokeObjectURL(backImagePreview)
    setBackImage(null)
    setBackImagePreview(null)
  }

  interface UploadDocumentResponse {
    success: boolean
    data?: {
      message?: string
    }
  }

  const onSubmit = async (data: DocumentFormValues) => {
    if (!frontImage) {
      toast.error('Please upload the front image of your document')
      return
    }

    try {
      const documentData = {
        ...data,
        documentFrontImage: frontImage,
        documentBackImage: backImage || undefined,
        expiryDate: data.expiryDate
          ? format(data.expiryDate, 'yyyy-MM-dd')
          : undefined,
        issuedDate: data.issuedDate
          ? format(data.issuedDate, 'yyyy-MM-dd')
          : undefined,
      }

      const result = (await uploadDocument(
        documentData
      ).unwrap()) as UploadDocumentResponse

      if (result.success) {
        toast.success('Document uploaded successfully')
        reset()
        removeFrontImage()
        removeBackImage()

        if (onUploadSuccess) {
          onUploadSuccess()
        }
      } else {
        toast.error(result.data?.message || 'Failed to upload document')
      }
    } catch (error: any) {
      console.error('Document upload error:', error)
      toast.error(error.message || 'Failed to upload document')
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Controller
              name="documentType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    id="documentType"
                    className={errors.documentType ? 'border-destructive' : ''}
                  >
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DocumentType.AADHAAR}>
                      Aadhaar Card
                    </SelectItem>
                    <SelectItem value={DocumentType.PAN}>PAN Card</SelectItem>
                    <SelectItem value={DocumentType.PASSPORT}>
                      Passport
                    </SelectItem>
                    <SelectItem value={DocumentType.DRIVING_LICENSE}>
                      Driving License
                    </SelectItem>
                    <SelectItem value={DocumentType.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.documentType && (
              <p className="text-sm text-destructive">
                {errors.documentType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              placeholder="Enter document number"
              {...register('documentNumber')}
              className={errors.documentNumber ? 'border-destructive' : ''}
            />
            {errors.documentNumber && (
              <p className="text-sm text-destructive">
                {errors.documentNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              placeholder="Enter document name"
              {...register('documentName')}
              className={errors.documentName ? 'border-destructive' : ''}
            />
            {errors.documentName && (
              <p className="text-sm text-destructive">
                {errors.documentName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuedDate">Issued Date (Optional)</Label>
              <Controller
                name="issuedDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value ? 'text-muted-foreground' : ''
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, 'PPP')
                          : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value ? 'text-muted-foreground' : ''
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, 'PPP')
                          : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frontImage">Front Image of Document</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {frontImagePreview ? (
                <div className="relative">
                  <img
                    src={frontImagePreview || '/placeholder.svg'}
                    alt="Front Document Preview"
                    className="max-h-40 mx-auto rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6"
                    onClick={removeFrontImage}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="frontImage" className="cursor-pointer block">
                  <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or JPEG (max. 5MB)
                  </p>
                  <input
                    id="frontImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFrontImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backImage">Back Image of Document (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {backImagePreview ? (
                <div className="relative">
                  <img
                    src={backImagePreview || '/placeholder.svg'}
                    alt="Back Document Preview"
                    className="max-h-40 mx-auto rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6"
                    onClick={removeBackImage}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="backImage" className="cursor-pointer block">
                  <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or JPEG (max. 5MB)
                  </p>
                  <input
                    id="backImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress}% Complete
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
