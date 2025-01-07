'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, Clock, X, Mic, MicOff } from 'lucide-react'
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
import { recognizeSpeech } from '../../lib/azure-speech-service'

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
  const [isRecording, setIsRecording] = useState(false)
  const { toast } = useToast()

  // Update date when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate)
    }
  }, [initialDate])

  // Check Microsoft authentication status
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

  const getScheduledDateTime = (selectedDate: Date, selectedTime: string) => {
    const [hours, minutes] = selectedTime.split(':').map(Number)
    return setMinutes(setHours(selectedDate, hours), minutes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !title || !location || !time) return

    setLoading(true)
    try {
      const scheduledDateTime = getScheduledDateTime(date, time)
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
        synced: true,
      }

      // Try to add to Microsoft Calendar first
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        try {
          await addToOutlookCalendar({
            subject: title,
            start: {
              dateTime: scheduledDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: addHours(scheduledDateTime, 1).toISOString(),
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
        } catch (error) {
          console.error('Failed to add to Microsoft Calendar:', error)
          toast({
            title: "Warning",
            description: "Failed to sync with Microsoft Calendar. The inspection will still be scheduled.",
            variant: "destructive",
          })
        }
      }

      // Schedule the inspection in our system
      await onSchedule(inspection)

      toast({
        title: "Success",
        description: accounts.length > 0 
          ? "Inspection scheduled and synced with Microsoft Calendar"
          : "Inspection scheduled successfully",
      })

      onOpenChange(false)
      setTitle('')
      setDate(undefined)
      setTime('09:00')
      setLocation('')
      setDetails('')
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

  const toggleSpeechRecognition = async () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      try {
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: "Speak clearly into your microphone.",
        });
        const recognizedText = await recognizeSpeech();
        setDetails(prev => prev + (prev ? '\n' : '') + recognizedText);
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast({
          title: "Speech Recognition Error",
          description: "Speech-to-text is not available. Please check your Azure Speech Service configuration.",
          variant: "destructive",
        });
      } finally {
        setIsRecording(false);
      }
    }
  };

  const resetForm = () => {
    setTitle('')
    setDate(undefined)
    setTime('09:00')
    setLocation('')
    setDetails('')
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
            <div className="flex items-center justify-between">
              <Label htmlFor="details">Details</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`gap-2 ${isRecording ? 'bg-red-50 text-red-600 hover:bg-red-100' : ''}`}
                onClick={toggleSpeechRecognition}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter inspection details or use voice input"
              className="min-h-[100px] rounded-xl"
            />
          </div>

          {/* Microsoft Calendar Integration */}
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
              onClick={() => onOpenChange(false)}
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

