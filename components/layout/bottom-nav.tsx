'use client'

import { Home, Map, FileText, Bell, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { useToast } from "../../components/ui/use-toast"
import React from 'react'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface BottomNavProps {
  isMobile: boolean;
}

export function BottomNav({ isMobile }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const handleLogout = async () => {
    try {
      localStorage.removeItem('isLoggedIn')
      if (isAuthenticated) {
        await instance.logoutRedirect({
          onRedirectNavigate: () => false
        })
      }
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center",
                  isActive 
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <nav className="fixed left-0 top-0 z-40 h-full w-64 bg-white border-r shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col h-full px-4 py-8 overflow-y-auto">
        <div className="space-y-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 transition-colors dark:text-gray-400',
                  isActive ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-900/10"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}

