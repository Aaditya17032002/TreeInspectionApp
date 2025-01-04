'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Camera, Loader2, X } from 'lucide-react'
import { useNotificationStore } from '../../../lib/stores/notification-store'
import { getCurrentLocation, getAddressFromCoordinates } from '../../../lib/services/geolocation'
import { saveInspection } from '../../../lib/db'
import { Inspection } from '../../../lib/types'

interface NewInspectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (inspection: Omit<Inspection, "id">, images: File[]) => Promise<void>;
}

export function NewInspectionDialog({ open, onOpenChange, onSave }: NewInspectionDialogProps) {
  const { addNotification } = useNotificationStore()
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Camera error:', error)
      addNotification({
        type: 'error',
        title: 'Camera Error',
        message: 'Could not access camera. Please check permissions.',
      })
    }
  }

  const captureImage = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setImages((prev) => [...prev, file])
    }, 'image/jpeg', 0.8)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || images.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide a title and at least one image.',
      })
      return
    }

    setLoading(true)
    try {
      const { latitude, longitude } = await getCurrentLocation()
      const address = await getAddressFromCoordinates(latitude, longitude)

      const inspection: Omit<Inspection, "id"> = {
        title,
        status: 'Pending',
        location: {
          address,
          latitude,
          longitude,
        },
        scheduledDate: new Date().toISOString(),
        inspector: {
          name: 'Victor Smith',
          id: 'VS001',
        },
        communityBoard: '211',
        details: details || `LOCATION: ${address}\nINSPECTION DATE: ${new Date().toLocaleString()}`,
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      }

      await onSave(inspection, images)

      addNotification({
        type: 'success',
        title: 'Inspection Created',
        message: 'New inspection has been created successfully.',
      })

      // Reset form and close dialog
      setTitle('')
      setDetails('')
      setImages([])
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating inspection:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create inspection. Please try again.',
      })
    } finally {
      setLoading(false)
      stopCamera()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Inspection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter inspection title"
            />
          </div>
          <div>
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter inspection details"
            />
          </div>
          <div>
            <Label>Camera</Label>
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video bg-black rounded-lg"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={startCamera}
                >
                  Start Camera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={captureImage}
                >
                  Capture
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Label>Captured Images</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Captured image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImages(prev => prev.filter((_, i) => i !== index))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Inspection'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}