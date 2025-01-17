'use client'

import { useState } from 'react'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { CalendarIcon, MapPin, Clock, Plus } from 'lucide-react'
import { Inspection } from '../../lib/types'
import { format } from 'date-fns'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { cn } from '../../lib/utils'
import { ScheduleDialog } from './schedule-dialog'

interface DayDetailsSheetProps {
  date: Date | null
  inspections: Inspection[]
  onClose: () => void
  onSchedule: () => void // Updated type to match the callback
}

export function DayDetailsSheet({
  date,
  inspections,
  onClose,
  onSchedule,
}: DayDetailsSheetProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)

  if (!date) return null

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#C1E1C1] dark:bg-[#7FB37F] text-green-800 dark:text-green-100'
      case 'Pending':
        return 'bg-[#FFD6D6] dark:bg-[#B37F7F] text-red-800 dark:text-red-100'
      case 'In-Progress':
        return 'bg-[#FFE4C4] dark:bg-[#B39B7F] text-orange-800 dark:text-orange-100'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const handleScheduleClick = () => {
    onSchedule()
  }

  return (
    <Sheet open={!!date} onOpenChange={() => onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-[85vh] p-0 rounded-t-3xl overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b shadow-sm bg-white dark:bg-gray-800">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary-foreground p-3 rounded-2xl">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {format(date, 'MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {inspections.length} inspections scheduled
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="default"
                onClick={handleScheduleClick}
                className="w-full rounded-full bg-primary/10 text-primary-foreground hover:bg-primary/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {inspections.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No inspections scheduled</p>
                <p className="mt-2 text-muted-foreground">
                  Schedule an inspection for this day
                </p>
              </div>
            ) : (
              inspections.map((inspection, index) => (
                <div key={inspection.id}>
                  {index > 0 && <div className="border-t border-gray-200 dark:border-gray-700 my-4" />}
                  <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{inspection.title}</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {format(new Date(inspection.scheduledDate), 'h:mm a')}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {inspection.location.address}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "rounded-full font-medium",
                          getStatusStyles(inspection.status)
                        )}
                      >
                        {inspection.status}
                      </Badge>
                    </div>

                    {inspection.details && (
                      <p className="text-muted-foreground text-sm">{inspection.details}</p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        <Avatar className="border-2 border-background">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {inspection.inspector.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          window.location.href = `/inspections/${inspection.id}`
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

