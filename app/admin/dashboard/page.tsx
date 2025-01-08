'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { getAllInspections, addAdminComment, updateInspectionPriority, updateInspectionStatus } from '../../../lib/db'
import { AlertTriangle, CheckCircle, Clock, MapPin, Calendar, User, FileText } from 'lucide-react'
import type { Inspection } from '../../../lib/types/index'
import { ImageViewer } from '../../../components/ui/image-viewer'

export default function AdminDashboard() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [comment, setComment] = useState('')
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [initialImageIndex, setInitialImageIndex] = useState(0)
  const router = useRouter()

  // Mock admin user (replace with actual admin user data)
  const adminUser = {
    id: 'admin1',
    name: 'Admin User',
  }

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (!isAdminLoggedIn) {
      router.push('/admin/login')
      return
    }

    loadInspections()
  }, [router])

  const loadInspections = async () => {
    try {
      const data = await getAllInspections()
      setInspections(data)
    } catch (error) {
      console.error('Error loading inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!selectedInspection || !comment) return

    try {
      await addAdminComment(selectedInspection.id, comment, adminUser)
      setComment('')
      loadInspections()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handlePriorityChange = async (inspectionId: string, priority: Inspection['priority']) => {
    try {
      await updateInspectionPriority(inspectionId, priority, adminUser)
      loadInspections()
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const handleStatusChange = async (inspectionId: string, status: Inspection['status']) => {
    try {
      await updateInspectionStatus(inspectionId, status)
      loadInspections()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem('adminLoggedIn')
              router.push('/admin/login')
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inspections.map(inspection => (
            <Card key={inspection.id} className="p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inspection #{inspection.id}
                </CardTitle>
                <Badge>{inspection.status}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {inspection.title}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-medium">Priority:</span>
                  <Select
                    value={inspection.priority || 'none'}
                    onValueChange={(value) => handlePriorityChange(inspection.id, value as Inspection['priority'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="flex items-center gap-2">None</span>
                      </SelectItem>
                      <SelectItem value="low">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Low
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Medium
                        </span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          High
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">View Details</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Inspection Details</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="details">
                      <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                        <TabsTrigger value="comments">Comments</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold">Title</h3>
                            <p>{inspection.title}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold">Status</h3>
                            <Select
                              value={inspection.status}
                              onValueChange={(value) => handleStatusChange(inspection.id, value as Inspection['status'])}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In-Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <h3 className="font-semibold">Location</h3>
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {inspection.location.address}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold">Scheduled Date</h3>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(inspection.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold">Inspector</h3>
                            <p className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {inspection.inspector.name} ({inspection.inspector.email})
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold">Details</h3>
                            <p className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {inspection.details}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="images">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {inspection.images.map((image, index) => (
                            <img
                              key={index}
                              src={`data:image/jpeg;base64,${image}`}
                              alt={`Inspection image ${index + 1}`}
                              className="cursor-pointer object-cover w-full h-48 rounded-md"
                              onClick={() => {
                                setSelectedInspection(inspection);
                                setImageViewerOpen(true);
                                setInitialImageIndex(index);
                              }}
                            />
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="comments">
                        <div className="space-y-4">
                          {inspection.adminComments && inspection.adminComments.length > 0 ? (
                            inspection.adminComments.map(comment => (
                              <div key={comment.id} className="bg-muted p-2 rounded-lg text-sm">
                                <p className="text-xs text-muted-foreground">
                                  {comment.adminName} • {new Date(comment.createdAt).toLocaleDateString()}
                                </p>
                                <p>{comment.text}</p>
                              </div>
                            ))
                          ) : (
                            <p>No comments yet.</p>
                          )}
                          <div>
                            <Textarea
                              placeholder="Add a comment..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <Button onClick={handleCommentSubmit} className="mt-2">
                              Add Comment
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      {selectedInspection && (
        <ImageViewer
          images={selectedInspection.images}
          initialIndex={initialImageIndex}
          open={imageViewerOpen}
          onOpenChange={setImageViewerOpen}
        />
      )}
    </div>
  )
}

