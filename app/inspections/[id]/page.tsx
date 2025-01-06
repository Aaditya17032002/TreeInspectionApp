'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { ChevronLeft, MapPin, Calendar, User, Building2, FileText, TreeDeciduous } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { getInspection, updateInspectionStatus, initDB } from '../../../lib/db'
import { Inspection } from '../../../lib/types'
import { cn } from '../../../lib/utils'
import { ImageViewer } from '../../../components/ui/image-viewer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { useToast } from "../../../components/ui/use-toast"
import { getAddressFromCoordinates } from '../../../lib/services/geolocation'

export default function InspectionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    const loadInspection = async () => {
      try {
        await initDB()
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
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-gradient-to-b from-purple-100 to-white dark:from-purple-900 dark:to-background px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-foreground hover:bg-accent"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </header>
        <div className="p-4 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (!inspection) {
    return (
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-gradient-to-b from-purple-100 to-white dark:from-purple-900 dark:to-background px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-foreground hover:bg-accent"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </header>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Inspection not found</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-background pb-16 md:pb-0">
        <div className="bg-gradient-to-b from-purple-100 to-white dark:from-purple-900 dark:to-background">
          <header className="sticky top-0 z-10 px-4 py-2 border-b backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 text-foreground hover:bg-accent"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </header>

          <div className="px-4 pb-4">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-purple-100/80 dark:bg-purple-900/80 p-3 rounded-lg backdrop-blur-sm">
                  <TreeDeciduous className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  <h1 className="text-xl font-bold text-purple-600 dark:text-purple-300">
                    Complaint #{inspection.id}
                  </h1>
                </div>
                <Badge variant="secondary" className="bg-purple-100/80 dark:bg-purple-900/80 backdrop-blur-sm text-purple-700 dark:text-purple-300">
                  {inspection.status}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{inspection.title}</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="space-y-6 rounded-lg bg-card p-4">
            <InfoItem
              icon={MapPin}
              label="Location"
              value={
                <>
                  {currentAddress}
                  <div className="text-sm text-muted-foreground mt-1">
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
              className="whitespace-pre-line"
            />

            {inspection.images && inspection.images.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-foreground mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {inspection.images.map((img, index) => (
                    <div 
                      key={index}
                      className="relative cursor-pointer"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={`data:image/jpeg;base64,${img}`}
                        alt={`Inspection image ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Update Status:</span>
              <Select
                value={inspection.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px] bg-background text-foreground">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In-Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800">
              Update Status
            </Button>
            <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent">
              Add Note
            </Button>
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
  value, 
  className 
}: { 
  icon: any
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
      </div>
      <div>
        <div className="font-medium text-foreground">{label}</div>
        <div className={cn("mt-1 text-muted-foreground", className)}>{value}</div>
      </div>
    </div>
  )
}

