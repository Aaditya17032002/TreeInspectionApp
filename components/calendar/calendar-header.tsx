'use client'

import { Button } from '../../components/ui/button'
import { Plus } from 'lucide-react'

interface CalendarHeaderProps {
  onSchedule: () => void
}

export function CalendarHeader({ onSchedule }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          Schedule and manage your inspections
        </p>
      </div>
      <Button onClick={onSchedule}>
        <Plus className="mr-2 h-4 w-4" />
        Schedule Inspection
      </Button>
    </div>
  )
}

