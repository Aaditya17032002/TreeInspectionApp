'use client'

import { Home, Map, FileText, Bell, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { useToast } from "../../components/ui/use-toast"
import React from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center py-2 px-3 text-sm',
                isActive
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="mt-1">{item.name}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center py-2 px-3 text-sm text-gray-600 hover:text-purple-600"
        >
          <LogOut className="h-6 w-6" />
          <span className="mt-1">Logout</span>
        </button>
      </div>
    </nav>
  )
}

