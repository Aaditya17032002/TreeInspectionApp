'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '../../components/calendar/calendar'
import { CalendarHeader } from '../../components/calendar/calendar-header'
import { ScheduleDialog } from '../../components/calendar/schedule-dialog'
import { DayDetailsSheet } from '../../components/calendar/day-details-sheet'
import { getAllInspections } from '../../lib/db'
import { Inspection } from '../../lib/types'
import { addToOutlookCalendar } from '../../lib/services/microsoft-calendar'
import { useToast } from '../../components/ui/use-toast'

export default function CalendarPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    try {
      const data = await getAllInspections()
      setInspections(data)
    } catch (error) {
      console.error('Error loading inspections:', error)
      toast({
        title: 'Error',
        description: 'Failed to load inspections',
        variant: 'destructive',
      })
    }
  }

  const handleSchedule = async (inspection: Omit<Inspection, 'id' | 'images'>) => {
    try {
      // Add to Outlook calendar
      await addToOutlookCalendar({
        subject: inspection.title,
        start: new Date(inspection.scheduledDate),
        end: new Date(new Date(inspection.scheduledDate).getTime() + 2 * 60 * 60 * 1000), // 2 hours duration
        location: inspection.location.address,
        body: inspection.details,
      })

      toast({
        title: 'Success',
        description: 'Inspection scheduled and added to calendar',
      })

      await loadInspections()
    } catch (error) {
      console.error('Error scheduling inspection:', error)
      toast({
        title: 'Error',
        description: 'Failed to schedule inspection',
        variant: 'destructive',
      })
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-4 space-y-4">
        <CalendarHeader onSchedule={() => setIsScheduleOpen(true)} />
        
        <div className="rounded-lg border bg-card">
          <Calendar
            inspections={inspections}
            onSelectDate={setSelectedDate}
          />
        </div>

        <ScheduleDialog
          open={isScheduleOpen}
          onOpenChange={setIsScheduleOpen}
          onSchedule={handleSchedule}
        />

        <DayDetailsSheet
          date={selectedDate}
          inspections={inspections.filter(
            inspection => 
              new Date(inspection.scheduledDate).toDateString() === selectedDate?.toDateString()
          )}
          onClose={() => setSelectedDate(null)}
        />
      </div>
    </main>
  )
}

