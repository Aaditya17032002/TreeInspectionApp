'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMsal } from "@azure/msal-react"
import { BottomNav } from '../layout/bottom-nav'
import { cn } from '../../lib/utils'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { instance, accounts } = useMsal()
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isSideNavOpen, setIsSideNavOpen] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768)
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if it's an admin route
        const isAdminRoute = pathname.startsWith('/admin')
        const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'

        // If it's an admin route and admin is logged in, bypass Microsoft auth
        if (isAdminRoute && isAdminLoggedIn) {
          setIsLoading(false)
          return
        }

        // For non-admin routes or if admin is not logged in, proceed with Microsoft auth
        await instance.handleRedirectPromise()
        const isAuthenticated = accounts.length > 0

        if (!isAuthenticated && pathname !== '/login') {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname, instance, accounts])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  // Show navbar if user is authenticated (either through Microsoft or admin login)
  const showNavbar = (accounts.length > 0 || localStorage.getItem('adminLoggedIn') === 'true') && 
                    pathname !== '/login' && 
                    pathname !== '/admin/login'

  return (
    <div className="flex min-h-screen bg-gray-100">
      {showNavbar && (
        <BottomNav
          isMobile={isMobile}
          isOpen={isSideNavOpen}
          setIsOpen={setIsSideNavOpen}
        />
      )}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          !isMobile && showNavbar && (isSideNavOpen ? "ml-64" : "ml-20")
        )}
      >
        {children}
      </main>
    </div>
  )
}