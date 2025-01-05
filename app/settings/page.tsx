'use client'

import { useEffect, useState } from 'react'
import { SettingsIcon, Moon, Sun, Bell, Database, Wifi, WifiOff } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Button } from '../../components/ui/button'
import { useTheme } from 'next-themes'
import { useNotificationStore } from '../../lib/stores/notification-store'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' && navigator.onLine)
  const { addNotification } = useNotificationStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Set initial theme based on system preference if not already set
    if (!localStorage.getItem('theme')) {
      setTheme(prefersDark ? 'dark' : 'light')
    }

    // Listen for changes in system color scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addListener(handleChange)

    return () => mediaQuery.removeListener(handleChange)
  }, [setTheme])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle notifications permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const handleNotificationToggle = async (checked: boolean) => {
    if (!('Notification' in window)) {
      addNotification({
        type: 'error',
        title: 'Not Supported',
        message: 'Notifications are not supported in this browser.',
      })
      return
    }

    if (checked) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        addNotification({
          type: 'success',
          title: 'Notifications Enabled',
          message: 'You will now receive notifications for new inspections.',
        })
      } else {
        setNotificationsEnabled(false)
        addNotification({
          type: 'error',
          title: 'Permission Denied',
          message: 'Please enable notifications in your browser settings.',
        })
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(key => caches.delete(key)))
        
        // Clear IndexedDB
        const req = indexedDB.deleteDatabase('tree-inspection-db')
        req.onsuccess = () => {
          addNotification({
            type: 'success',
            title: 'Cache Cleared',
            message: 'Application cache and data have been cleared successfully.',
          })
          // Reload to reinitialize the database
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear application cache.',
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="pb-16 md:pb-0">
      <header className="border-b p-4 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <h2 className="font-medium mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => {
                setTheme(checked ? 'dark' : 'light')
                localStorage.setItem('theme', checked ? 'dark' : 'light')
              }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="notifications">Push Notifications</Label>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Network Status</h2>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Storage</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Cached Data</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={clearCache}
            >
              Clear Cache & Data
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Tree Inspection App v1.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </main>
  )
}

