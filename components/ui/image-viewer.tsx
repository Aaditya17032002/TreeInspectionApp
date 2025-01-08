'use client'

import { Dialog, DialogContent } from '../ui/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '../ui/button'
import { useState, useEffect, useMemo } from 'react'

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageViewer({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageViewerProps) {
  // Use useMemo to deduplicate images array only when images prop changes
  const uniqueImages = useMemo(() => {
    const seen = new Set<string>()
    return images.filter(img => {
      if (seen.has(img)) return false
      seen.add(img)
      return true
    })
  }, [images])

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (open) {
      const validIndex = Math.min(Math.max(initialIndex, 0), uniqueImages.length - 1)
      setCurrentIndex(validIndex)
    }
  }, [open, initialIndex, uniqueImages])

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % uniqueImages.length)
  }

  const showPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length)
  }

  if (!open || uniqueImages.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90">
        <div className="relative h-[80vh] flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-white hover:bg-white/20 rounded-full z-50"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {uniqueImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 text-white hover:bg-white/20 rounded-full"
                onClick={showPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 text-white hover:bg-white/20 rounded-full"
                onClick={showNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          <img
            src={`data:image/jpeg;base64,${uniqueImages[currentIndex]}`}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {uniqueImages.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

