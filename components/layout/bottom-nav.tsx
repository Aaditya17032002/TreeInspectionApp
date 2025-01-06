'use client'

import { Home, Map, Calendar, FileText, MoreHorizontal, Bell, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { useToast } from "../../components/ui/use-toast"
import { useState } from 'react'
import { useMsal } from "@azure/msal-react"
import { MoreSheet } from './more-sheet'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: FileText },
]

interface BottomNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export function BottomNav({ isOpen, setIsOpen, isMobile }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false)
  const { instance, accounts } = useMsal()

  const handleLogout = async () => {
    try {
      if (accounts.length > 0) {
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

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isActive
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="truncate">{item.name}</span>}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {isMobile ? (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
          <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <item.icon className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={() => setIsMoreSheetOpen(true)}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <MoreHorizontal className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
            </button>
          </div>
        </div>
      ) : (
        <nav 
          className={cn(
            "fixed left-0 top-0 z-40 h-full bg-white border-r shadow-sm transition-all duration-300 ease-in-out",
            isOpen ? "w-64" : "w-20"
          )}
        >
          <div className="flex flex-col h-full py-4">
            <div className="flex-1 overflow-y-auto px-4 space-y-2">
              <NavLinks />
              <Link
                href="/notifications"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
                  !isOpen && "justify-center"
                )}
              >
                <Bell className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span>Notifications</span>}
              </Link>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
                  !isOpen && "justify-center"
                )}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span>Settings</span>}
              </Link>
            </div>
            <div className="px-4 mt-auto">
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors",
                  !isOpen && "justify-center"
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span>Logout</span>}
              </button>
            </div>
          </div>
        </nav>
      )}

      <MoreSheet open={isMoreSheetOpen} onOpenChange={setIsMoreSheetOpen} onLogout={handleLogout} />
    </>
  )
}

