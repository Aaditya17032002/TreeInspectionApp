'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { useState, useRef } from "react"
import { Camera,X } from 'lucide-react'
import type { Inspection } from "../../../lib/types"
import { cn } from "../../../lib/utils"
interface NewInspectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (inspection: Omit<Inspection, "id">) => void;
  }
  
  export function NewInspectionDialog({ open, onOpenChange, onSave }: NewInspectionDialogProps) {
    const [images, setImages] = useState<string[]>([])
    const [title, setTitle] = useState('')
    const [details, setDetails] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (title.trim()) {
        const newInspection: Omit<Inspection, "id"> = {
          status: 'Pending',
          title,
          location: {
            address: 'Fetching address...',
            postalCode: 'Fetching...',
            coordinates: [-73.935242, 40.730610], // This will be overwritten in MapPage
          },
          scheduledDate: new Date().toLocaleString(),
          inspector: {
            name: 'Auto Assigned',
            id: 'AUTO001',
          },
          communityBoard: '211',
          details: details || 'Inspection details pending...',
          images,
          createdAt: "",
          updatedAt: "",
          synced: false
        }
        onSave(newInspection)
        setTitle('')
        setDetails('')
        setImages([])
        onOpenChange(false)
      }
    }
  
    const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files) {
        const newImages: string[] = []
        Array.from(files).forEach(file => {
          const reader = new FileReader()
          reader.onloadend = () => {
            newImages.push(reader.result as string)
            if (newImages.length === files.length) {
              setImages(prev => [...prev, ...newImages])
            }
          }
          reader.readAsDataURL(file)
        })
      }
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(
          "sm:max-w-[425px] p-0 bg-white",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]",
          "duration-200"
        )}>
          <div className="p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">New Inspection</DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter inspection title"
                    className="mt-1.5"
                    required
                  />
                </div>
  
                <div>
                  <Label htmlFor="details" className="text-gray-700">Details (Optional)</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Enter inspection details"
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
  
                <div>
                  <Label className="text-gray-700">Images</Label>
                  <div className="mt-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="hidden"
                      onChange={handleCapture}
                      ref={fileInputRef}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full justify-center py-6 border-dashed"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Images
                    </Button>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Captured ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
  
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setTitle('')
                    setDetails('')
                    setImages([])
                    onOpenChange(false)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Save Inspection
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  
  