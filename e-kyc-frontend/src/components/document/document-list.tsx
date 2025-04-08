/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { format } from 'date-fns'
import { FileText, Loader2, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useDeleteDocumentMutation,
  useGetUserDocumentsQuery,
} from '@/redux/features/document/documentApi'
import {
  type Document,
  DocumentStatus,
  DocumentType,
} from '@/redux/features/document/documentSlice'
import { useState } from 'react'

interface GetUserDocumentsResponse {
  data: Document[]
  isLoading: any
  error: any
  refetch: () => void
}

export function DocumentList() {
  const { data, isLoading, error, refetch } = useGetUserDocumentsQuery() as
    | GetUserDocumentsResponse
    | { data: any; isLoading: false; error: any; refetch: () => void }
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation()
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (error) {
      toast.error('Failed to load documents')
    }
  }, [error])

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return

    try {
      await deleteDocument(documentToDelete).unwrap()
      toast.success('Document deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete document')
    } finally {
      setDocumentToDelete(null)
      setIsDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDocumentToDelete(id)
    setIsDialogOpen(true)
  }

  const getDocumentTypeName = (type: DocumentType) => {
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
        return type
    }
  }

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Pending
          </Badge>
        )
      case DocumentStatus.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Approved
          </Badge>
        )
      case DocumentStatus.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'PPP')
    } catch (error) {
      return 'Invalid Date'
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Your Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Failed to load documents</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your documents to complete the verification process
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Document Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((document: Document) => (
                  <TableRow key={document._id}>
                    <TableCell className="font-medium">
                      {getDocumentTypeName(document.documentType)}
                    </TableCell>
                    <TableCell>{document.documentNumber}</TableCell>
                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                    <TableCell>{formatDate(document.issuedDate)}</TableCell>
                    <TableCell>{formatDate(document.expiryDate)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(document._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
