'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'
import { Inspection } from '../../lib/types'
import { Badge } from '../../components/ui/badge'

interface CalendarProps {
  inspections: Inspection[]
  onSelectDate: (date: Date) => void
}

export function Calendar({ inspections, onSelectDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const weeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
  }

  const getInspectionsForDate = (date: Date) => {
    return inspections.filter(
      inspection =>
        new Date(inspection.scheduledDate).toDateString() === date.toDateString()
    )
  }

  const getStatusColor = (status: Inspection['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500'
      case 'In-Progress':
        return 'bg-blue-500'
      default:
        return 'bg-purple-500'
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-card p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: weeks * 7 }, (_, i) => {
          const dayNumber = i - firstDayOfMonth + 1
          const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            dayNumber
          )
          const dayInspections = isCurrentMonth ? getInspectionsForDate(date) : []
          const isToday = isCurrentMonth && date.toDateString() === new Date().toDateString()

          return (
            <button
              key={i}
              className={cn(
                'relative bg-card p-2 min-h-[80px] text-left transition-colors',
                isCurrentMonth
                  ? 'hover:bg-accent cursor-pointer'
                  : 'text-muted-foreground cursor-default',
                isToday && 'bg-accent'
              )}
              onClick={() => isCurrentMonth && onSelectDate(date)}
              disabled={!isCurrentMonth}
            >
              <span className="text-sm">{isCurrentMonth ? dayNumber : ''}</span>
              
              {dayInspections.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                  {dayInspections.map((inspection) => (
                    <Badge
                      key={inspection.id}
                      variant="secondary"
                      className={cn(
                        'w-2 h-2 p-0 rounded-full',
                        getStatusColor(inspection.status)
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

