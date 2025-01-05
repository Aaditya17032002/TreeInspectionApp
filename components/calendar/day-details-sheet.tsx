'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { Inspection } from '../../lib/types'
import { format } from 'date-fns'

interface DayDetailsSheetProps {
  date: Date | null
  inspections: Inspection[]
  onClose: () => void
}

export function DayDetailsSheet({ date, inspections, onClose }: DayDetailsSheetProps) {
  if (!date) return null

  return (
    <Sheet open={!!date} onOpenChange={() => onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(date, 'MMMM d, yyyy')}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {inspections.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No inspections scheduled for this day
            </p>
          ) : (
            inspections.map((inspection) => (
              <div
                key={inspection.id}
                className="space-y-4 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{inspection.title}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {inspection.location.address}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(inspection.scheduledDate), 'p')}
                    </div>
                  </div>
                  <Badge
                    variant={
                      inspection.status === 'Completed'
                        ? 'default'
                        : inspection.status === 'In-Progress'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {inspection.status}
                  </Badge>
                </div>

                {inspection.details && (
                  <p className="text-sm text-muted-foreground">
                    {inspection.details}
                  </p>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Navigate to inspection details
                    window.location.href = `/inspections/${inspection.id}`
                  }}
                >
                  View Details
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

