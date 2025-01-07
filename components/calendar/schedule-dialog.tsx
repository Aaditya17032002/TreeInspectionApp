'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, Clock, X } from 'lucide-react'
import { format, addHours, setHours, setMinutes } from 'date-fns'
import { Dialog, DialogContent, DialogHeader } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Calendar } from '../../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Textarea } from '../../components/ui/textarea'
import { cn } from '../../lib/utils'
import { Inspection } from '../../lib/types'
import { addToOutlookCalendar } from '../../lib/services/microsoft-calendar'
import { useToast } from '../../components/ui/use-toast'
import { msalInstance } from '../../lib/msal-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (inspection: Omit<Inspection, 'id' | 'images'>) => Promise<void>
  initialDate?: Date
}

export function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
  initialDate
}: ScheduleDialogProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [time, setTime] = useState<string>('09:00')
  const [location, setLocation] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [microsoftAuthChecked, setMicrosoftAuthChecked] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate)
    }
  }, [initialDate])

  useEffect(() => {
    if (open && !microsoftAuthChecked) {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length === 0) {
        toast({
          title: "Microsoft Calendar",
          description: "Sign in to Microsoft to sync with Outlook Calendar",
          variant: "default",
        })
      }
      setMicrosoftAuthChecked(true)
    }
  }, [open, microsoftAuthChecked, toast])

  const handleMicrosoftLogin = async () => {
    try {
      await msalInstance.loginPopup({
        scopes: ['Calendars.ReadWrite']
      })
      toast({
        title: "Success",
        description: "Successfully connected to Microsoft Calendar",
      })
    } catch (error) {
      console.error('Microsoft login failed:', error)
      toast({
        title: "Error",
        description: "Failed to connect to Microsoft Calendar",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setTitle('')
    setDate(undefined)
    setTime('09:00')
    setLocation('')
    setDetails('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !title || !location || !time) return

    setLoading(true)
    try {
      const scheduledDateTime = setMinutes(
        setHours(date, parseInt(time.split(':')[0])), 
        parseInt(time.split(':')[1])
      )
      
      const inspection: Omit<Inspection, 'id' | 'images'> = {
        title,
        status: 'Pending' as const,
        location: {
          address: location,
          latitude: 0,
          longitude: 0,
        },
        scheduledDate: scheduledDateTime.toISOString(),
        inspector: {
          name: 'Current User',
          id: 'current-user-id',
        },
        communityBoard: '211',
        details,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      }

      // First save to our system
      await onSchedule(inspection)

      // Then try to sync with Microsoft Calendar if authenticated
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        const endDateTime = addHours(scheduledDateTime, 2) // Consistently use 2 hours duration
        
        await addToOutlookCalendar({
          subject: title,
          start: {
            dateTime: scheduledDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          location: {
            displayName: location,
          },
          body: {
            contentType: 'text',
            content: details || 'No additional details provided.',
          },
        })
      }

      toast({
        title: "Success",
        description: "Inspection scheduled successfully",
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error scheduling inspection:', error)
      toast({
        title: "Error",
        description: "Failed to schedule inspection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-primary/20 dark:bg-primary/30 text-primary-foreground">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Schedule Inspection</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              className="rounded-full text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter inspection title"
              className="rounded-xl"
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
                    'w-full justify-start text-left font-normal rounded-xl',
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
            <Label htmlFor="time">Time</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {format(setHours(new Date(), hour), 'h:mm a')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="rounded-xl"
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
              className="min-h-[100px] rounded-xl"
            />
          </div>
          
          {msalInstance.getAllAccounts().length === 0 && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="text-sm">
                <p className="font-medium">Microsoft Calendar</p>
                <p className="text-muted-foreground">Sync with Outlook Calendar</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleMicrosoftLogin}
                className="rounded-xl"
              >
                Connect
              </Button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 dark:bg-primary/30 dark:text-primary-foreground dark:hover:bg-primary/40"
              disabled={loading}
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

