'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Calendar } from '../../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Textarea } from '../../components/ui/textarea'
import { cn } from '../../lib/utils'
import { Inspection } from '../../lib/types'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (inspection: Omit<Inspection, 'id' | 'images'>) => Promise<void>
}

export function ScheduleDialog({ open, onOpenChange, onSchedule }: ScheduleDialogProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date>()
  const [location, setLocation] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !title || !location) return

    setLoading(true)
    try {
      await onSchedule({
        title,
        status: 'Pending',
        location: {
          address: location,
          latitude: 0,
          longitude: 0,
        },
        scheduledDate: date.toISOString(),
        inspector: {
          name: 'Current User',
          id: 'current-user-id',
        },
        communityBoard: '211',
        details,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: true,
      })
      
      onOpenChange(false)
      setTitle('')
      setDate(undefined)
      setLocation('')
      setDetails('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Inspection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter inspection title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter inspection details"
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

