'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader } from "../../../components/ui/sheet"
import { Button } from "../../../components/ui/button"
import { MapPin, Calendar, User, Building2, FileText, ArrowLeft, TreeDeciduous } from 'lucide-react'
import type { Inspection } from "../../../lib/types"
import { getAddressFromCoordinates, syncPendingAddresses } from '../../../lib/services/geolocation'
import { ImageViewer } from "../../../components/ui/image-viewer"
import { Badge } from '../../../components/ui/badge'

interface InspectionSheetProps {
  inspection: Inspection | null
  onClose: () => void
}

export function InspectionSheet({ inspection, onClose }: InspectionSheetProps) {
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  useEffect(() => {
    if (inspection) {
      setCurrentAddress(inspection.location.address)
      updateAddress(inspection.location.latitude, inspection.location.longitude)
    }
  }, [inspection])

  useEffect(() => {
    const handleAddressUpdate = (event: CustomEvent) => {
      if (!inspection) return
      
      const { latitude, longitude, address } = event.detail
      if (
        latitude === inspection.location.latitude &&
        longitude === inspection.location.longitude
      ) {
        setCurrentAddress(address)
      }
    }

    window.addEventListener('addressUpdated', handleAddressUpdate as EventListener)
    return () => {
      window.removeEventListener('addressUpdated', handleAddressUpdate as EventListener)
    }
  }, [inspection])

  useEffect(() => {
    window.addEventListener('online', syncPendingAddresses)
    return () => {
      window.removeEventListener('online', syncPendingAddresses)
    }
  }, [])

  const updateAddress = async (latitude: number, longitude: number) => {
    try {
      const address = await getAddressFromCoordinates(latitude, longitude)
      setCurrentAddress(address)
    } catch (error) {
      console.error('Error updating address:', error)
    }
  }

  if (!inspection) return null

  return (
    <>
      <Sheet open={!!inspection} onOpenChange={() => onClose()}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 bg-white"
        >
          <div className="flex flex-col h-full">
            <div className="bg-gradient-to-b from-purple-500 to-purple-100">
              <div className="relative">
                <div className="absolute inset-0 overflow-hidden">
                  <TreeDeciduous className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300/20 h-48 w-48" />
                </div>

                <SheetHeader className="relative border-b border-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 p-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                      <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h2 className="text-xl font-semibold text-white">Inspection Details</h2>
                  </div>
                </SheetHeader>

                <div className="relative px-4 pt-2 pb-8">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
                        Complaint #{inspection.id}
                      </h1>
                      <Badge variant="outline" className="bg-white/90 text-purple-600 border-none">
                        {inspection.status}
                      </Badge>
                    </div>
                    <h2 className="text-white/90 font-medium">
                      {inspection.title}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="-mt-4">
                <div className="bg-white rounded-t-3xl">
                  <div className="divide-y divide-gray-100">
                    <InfoItem
                      icon={MapPin}
                      label="Location"
                      value={
                        <>
                          {currentAddress}
                          <div className="text-sm text-gray-500 mt-1">
                            Lat: {inspection.location.latitude.toFixed(6)}, Long: {inspection.location.longitude.toFixed(6)}
                          </div>
                        </>
                      }
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Scheduled Date"
                      value={new Date(inspection.scheduledDate).toLocaleString()}
                    />

                    <InfoItem
                      icon={User}
                      label="Inspector"
                      value={`${inspection.inspector.name} (ID: ${inspection.inspector.id})`}
                    />

                    <InfoItem
                      icon={Building2}
                      label="Community Board"
                      value={inspection.communityBoard}
                    />

                    <InfoItem
                      icon={FileText}
                      label="Details"
                      value={inspection.details}
                    />

                    {inspection.images && inspection.images.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {inspection.images.map((img, index) => (
                            <div 
                              key={index}
                              className="relative cursor-pointer aspect-square"
                              onClick={() => setSelectedImageIndex(index)}
                            >
                              <img
                                src={`data:image/jpeg;base64,${img}`}
                                alt={`Inspection image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-white">
              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Update Status
                </Button>
                <Button variant="outline" className="w-full">
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ImageViewer
        images={inspection.images || []}
        initialIndex={selectedImageIndex || 0}
        open={selectedImageIndex !== null}
        onOpenChange={(open) => !open && setSelectedImageIndex(null)}
      />
    </>
  )
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: any
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="p-4 flex gap-4 items-start">
      <div className="rounded-full bg-purple-100 p-3 flex-shrink-0">
        <Icon className="h-6 w-6 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {label}
        </h3>
        <div className="text-gray-600 break-words">
          {value}
        </div>
      </div>
    </div>
  )
}

