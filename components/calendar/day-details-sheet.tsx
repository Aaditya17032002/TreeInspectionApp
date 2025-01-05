'use client'

import { Sheet, SheetContent, SheetHeader } from '../../components/ui/sheet'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Calendar, MapPin, Clock, X, Share2, Plus } from 'lucide-react'
import { Inspection } from '../../lib/types'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'

interface DayDetailsSheetProps {
  date: Date | null
  inspections: Inspection[]
  onClose: () => void
}

export function DayDetailsSheet({
  date,
  inspections,
  onClose,
}: DayDetailsSheetProps) {
  if (!date) return null

  return (
    <Sheet open={!!date} onOpenChange={() => onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] p-0 rounded-t-3xl overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 text-white p-3 rounded-2xl">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {format(date, 'MMMM d, yyyy')}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {inspections.length} inspections scheduled
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onClose()}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.location.href = '/calendar/schedule'}
                  className="rounded-full bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/30 dark:text-primary-foreground dark:hover:bg-primary/40"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {inspections.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No inspections scheduled for this day
              </p>
            ) : (
              inspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="bg-gray-50 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{inspection.title}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          {format(new Date(inspection.scheduledDate), 'h:mm a')}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {inspection.location.address}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        inspection.status === 'Completed'
                          ? 'default'
                          : 'secondary'
                      }
                      className="rounded-full"
                    >
                      {inspection.status}
                    </Badge>
                  </div>

                  {inspection.details && (
                    <p className="text-gray-600 text-sm">{inspection.details}</p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2">
                      <Avatar className="border-2 border-white">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback>
                          {inspection.inspector.name[0]}
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
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
