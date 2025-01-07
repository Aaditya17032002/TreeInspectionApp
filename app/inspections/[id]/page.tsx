'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { ChevronLeft, MapPin, Calendar, User, Building2, FileText, TreeDeciduous } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { getInspection, updateInspectionStatus } from '../../../lib/db'
import { Inspection } from '../../../lib/types'
import { ImageViewer } from '../../../components/ui/image-viewer'
import { getAddressFromCoordinates } from '../../../lib/services/geolocation'
import { useToast } from '../../../components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { getUserInfo } from '../../../lib/msal-utils';

export default function InspectionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const loadInspection = async () => {
      try {
        const data = await getInspection(params.id as string)
        setInspection(data)
        if (data) {
          const address = await getAddressFromCoordinates(
            data.location.latitude,
            data.location.longitude
          )
          setCurrentAddress(address)
        }
      } catch (error) {
        console.error('Error loading inspection:', error)
        toast({
          title: "Error",
          description: "Failed to load inspection details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadInspection()
  }, [params.id, toast])

  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (!inspection) return

    try {
      const updatedInspection = await updateInspectionStatus(inspection.id, newStatus as Inspection['status'])
      setInspection(updatedInspection)
      toast({
        title: "Status Updated",
        description: `Inspection status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update inspection status.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="h-48 bg-purple-100" />
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </main>
    )
  }

  if (!inspection) {
    return (
      <main className="min-h-screen bg-white">
        <div className="p-4 text-center">
          <p className="text-gray-500">Inspection not found</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="bg-gradient-to-b from-purple-500 to-purple-100">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 overflow-hidden">
              <TreeDeciduous className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300/20 h-48 w-48" />
            </div>
            
            <header className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="m-4 text-white hover:bg-white/20"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
            </header>

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

        <div className="max-w-5xl mx-auto">
          <div className="bg-white -mt-4 rounded-t-3xl">
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
                value={`${userInfo?.name || 'Unknown'} (ID: ${userInfo?.email || 'Unknown'})`}
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

            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-gray-900">Update Status:</span>
                <Select
                  value={inspection.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In-Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </main>

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

