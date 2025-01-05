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
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' && navigator.onLine)
  const { addNotification } = useNotificationStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isSystemTheme, setIsSystemTheme] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Check if user has manually set a theme preference
    const userTheme = localStorage.getItem('theme')
    setIsSystemTheme(!userTheme)

    // Initialize theme based on system preference if no user preference exists
    if (!userTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }

    // Listen for changes in system color scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (isSystemTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    // Modern event listener syntax
    try {
      // Modern browsers
      mediaQuery.addEventListener('change', handleChange)
    } catch (e1) {
      try {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
      } catch (e2) {
        console.error('Could not add theme change listener:', e2)
      }
    }

    return () => {
      try {
        // Modern browsers
        mediaQuery.removeEventListener('change', handleChange)
      } catch (e1) {
        try {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange)
        } catch (e2) {
          console.error('Could not remove theme change listener:', e2)
        }
      }
    }
  }, [setTheme, isSystemTheme])

  // Sync with system theme when mounted and in system theme mode
  useEffect(() => {
    if (mounted && isSystemTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [mounted, isSystemTheme, setTheme])

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

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    setTheme(newTheme)
    // Store user preference
    localStorage.setItem('theme', newTheme)
    setIsSystemTheme(false)
  }

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
      // Clear IndexedDB
      const clearDatabase = async () => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.deleteDatabase('tree-inspection-db')
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(true)
        })
      }

      // Clear Cache Storage
      const clearCacheStorage = async () => {
        if ('caches' in window) {
          const keys = await caches.keys()
          return Promise.all(keys.map(key => caches.delete(key)))
        }
        return Promise.resolve()
      }

      // Clear Local Storage
      const clearLocalStorage = () => {
        localStorage.clear()
      }

      // Execute all clearing operations
      await Promise.all([
        clearDatabase(),
        clearCacheStorage(),
      ])
      clearLocalStorage()

      addNotification({
        type: 'success',
        title: 'Cache Cleared',
        message: 'Application cache and data have been cleared successfully.',
      })

      // Force reload after a short delay to ensure everything is cleared
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error clearing cache:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear application cache and data.',
      })
    }
  }

  if (!mounted) {
    return null
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <main className="pb-16 md:pb-0">
      <header className="border-b p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <h2 className="font-medium mb-4 text-foreground">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentTheme === 'dark' ? (
                <Moon className="h-4 w-4 text-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-foreground" />
              )}
              <Label htmlFor="dark-mode" className="text-foreground">Dark Mode</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={currentTheme === 'dark'}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4 text-foreground">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground" />
              <Label htmlFor="notifications" className="text-foreground">Push Notifications</Label>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4 text-foreground">Network Status</h2>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-foreground">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4 text-foreground">Storage</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-foreground" />
              <span className="text-foreground">Cached Data</span>
            </div>
            <Button
              variant="outline"
              className="w-full text-foreground border-border hover:bg-accent"
              onClick={clearCache}
            >
              Clear Cache & Data
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Tree Inspection App v1.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </main>
  )
}

