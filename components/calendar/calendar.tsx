'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical, Circle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'
import { Inspection } from '../../lib/types'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { format } from 'date-fns'

interface CalendarProps {
    inspections: Inspection[]
    onSelectDate: (date: Date) => void
    currentUser: { name: string; email: string; initials: string }
  }
  
  export function Calendar({ inspections, onSelectDate, currentUser }: CalendarProps) {
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
  
    const hasInspections = (date: Date) => {
      return getInspectionsForDate(date).length > 0
    }
  
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
  
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-[#C3B1E1] dark:bg-primary/5 rounded-3xl overflow-hidden max-w-2xl mx-auto shadow-lg mb-20 md:mb-0">
        {/* Calendar Header */}
        <div className="flex-none p-6 border-b border-primary/20 shadow-sm bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousMonth}
                className="text-primary-foreground hover:bg-primary/10"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous month</span>
              </Button>
              <h2 className="text-2xl font-bold text-primary-foreground">
                {currentDate.toLocaleString('default', { month: 'long' })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="text-primary-foreground hover:bg-primary/10"
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
          </div>
  
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-primary-foreground/70">
                {day}
              </div>
            ))}
          </div>
        </div>
  
        {/* Calendar Days */}
        <div className="flex-none p-6 bg-[#C3B1E1]/50 dark:bg-primary/5">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: weeks * 7 }, (_, i) => {
              const dayNumber = i - firstDayOfMonth + 1
              const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth
              const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                dayNumber
              )
              const isToday = isCurrentMonth && date.toDateString() === new Date().toDateString()
              const isSelected = isCurrentMonth && date.getDate() === currentDate.getDate()
              const hasInspectionsOnDate = isCurrentMonth && hasInspections(date)
  
              return (
                <button
                  key={i}
                  className={cn(
                    'relative aspect-square rounded-full flex items-center justify-center text-sm transition-colors',
                    isCurrentMonth ? 'hover:bg-primary/20' : 'text-primary-foreground/30',
                    isSelected ? 'bg-primary text-primary-foreground' : '',
                    isToday && !isSelected ? 'border-2 border-primary' : ''
                  )}
                  onClick={() => isCurrentMonth && onSelectDate(date)}
                  disabled={!isCurrentMonth}
                  aria-label={isCurrentMonth ? `Select ${date.toLocaleDateString()}` : undefined}
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                >
                  {isCurrentMonth && (
                    <>
                      <span>{dayNumber}</span>
                      {hasInspectionsOnDate && (
                        <Circle 
                          className="absolute bottom-1 h-1.5 w-1.5 fill-primary" 
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>
  
        {/* Inspections List */}
        <div className="flex-1 min-h-0 bg-white/50 dark:bg-gray-800/50 overflow-hidden">
          <div className="h-full overflow-y-auto pb-20 md:pb-4">
            <div className="p-4 space-y-3">
              {getInspectionsForDate(currentDate).map((inspection) => (
                <div
                  key={inspection.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(inspection.scheduledDate), 'h:mm a')}
                      </p>
                      <h3 className="font-semibold mt-1 text-foreground">{inspection.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {inspection.location.address}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      aria-label="More options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <Avatar className="border-2 border-background h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {inspection.inspector.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }