'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '../../components/calendar/calendar'
import { CalendarHeader } from '../../components/calendar/calendar-header'
import { ScheduleDialog } from '../../components/calendar/schedule-dialog'
import { DayDetailsSheet } from '../../components/calendar/day-details-sheet'
import { getAllInspections, saveInspection } from '../../lib/db'
import { Inspection } from '../../lib/types'
import { addToOutlookCalendar } from '../../lib/services/microsoft-calendar'
import { useToast } from '../../components/ui/use-toast'
import { getUserInfo } from '../../lib/msal-utils'

export default function CalendarPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; initials: string }>({ name: '', email: '', initials: '' })
  const { toast } = useToast()

  useEffect(() => {
    loadInspections()
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const userInfo = await getUserInfo()
      if (!userInfo) {
        throw new Error('User information not available')
      }
      const nameParts = userInfo.name.split(' ')
      const initials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : userInfo.name.slice(0, 2).toUpperCase()
      setCurrentUser({ name: userInfo.name, email: userInfo.email, initials })
    } catch (error) {
      console.error('Error fetching user info:', error)
      toast({
        title: 'Error',
        description: 'Failed to load user information',
        variant: 'destructive',
      })
    }
  }

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

  const handleSchedule = async (inspectionData: Omit<Inspection, 'id' | 'images' | 'createdAt' | 'updatedAt' | 'synced'>) => {
    try {
      // Create a new inspection object with required fields
      const newInspection: Inspection = {
        ...inspectionData,
        id: crypto.randomUUID(),
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      }

      // Save the inspection to the local database
      const savedInspection = await saveInspection(newInspection)

      // Add to Outlook Calendar
      await addToOutlookCalendar({
        subject: savedInspection.title,
        start: {
          dateTime: new Date(savedInspection.scheduledDate).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(new Date(savedInspection.scheduledDate).getTime() + 2 * 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: {
          displayName: savedInspection.location.address,
        },
        body: {
          contentType: 'text',
          content: savedInspection.details || '',
        },
      })

      toast({
        title: 'Success',
        description: 'Inspection scheduled and added to calendar',
      })
      await loadInspections()
      setIsScheduleOpen(false)
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
      <div className="container mx-auto py-4">
        <CalendarHeader />
        <div className="mx-auto max-w-2xl px-4">
          <Calendar
            inspections={inspections}
            onSelectDate={setSelectedDate}
            currentUser={currentUser}
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
            (inspection) =>
              new Date(inspection.scheduledDate).toDateString() ===
              selectedDate?.toDateString()
          )}
          onClose={() => setSelectedDate(null)}
          onSchedule={() => setIsScheduleOpen(true)}
        />
      </div>
    </main>
  )
}

