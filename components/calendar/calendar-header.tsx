'use client'

import { Button } from '../../components/ui/button'
import { Plus } from 'lucide-react'

interface CalendarHeaderProps {
  onSchedule: () => void
}

export function CalendarHeader({ onSchedule }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          Schedule and manage your inspections
        </p>
      </div>
      <Button
        onClick={onSchedule}
        className="rounded-full bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/30 dark:text-primary-foreground dark:hover:bg-primary/40"
      >
        <Plus className="mr-2 h-4 w-4" />
        Schedule Inspection
      </Button>
    </div>
  )
}
