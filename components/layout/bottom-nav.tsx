'use client'

import { Home, Map, FileText, Bell, Settings, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { useToast } from "../../components/ui/use-toast"
import { useState } from 'react'
import { Sheet, SheetContent } from "../../components/ui/sheet"
import { useMsal, useIsAuthenticated } from "@azure/msal-react"

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
  const [isOpen, setIsOpen] = useState(false)
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

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="grid h-full grid-cols-4 mx-auto"> {/* Changed to 4 columns */}
          {navigation.slice(0, 3).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center",
                "hover:bg-gray-50 dark:hover:bg-gray-900",
                pathname === item.href && "text-purple-600 dark:text-purple-400"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="inline-flex flex-col items-center justify-center text-red-600 dark:text-red-400"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>
    )
  }

  // Desktop/Tablet Sidebar Navigation
  return (
    <nav className={cn(
      "hidden md:flex fixed left-0 top-0 z-40 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800",
      "transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-4">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                pathname === item.href && "bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
              )}
            >
              <item.icon className="h-6 w-6" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2 p-4 text-red-600 dark:text-red-400",
            "hover:bg-red-50 dark:hover:bg-red-900/50",
            "border-t border-gray-200 dark:border-gray-800"
          )}
        >
          <LogOut className="h-6 w-6" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </nav>
  )
}

