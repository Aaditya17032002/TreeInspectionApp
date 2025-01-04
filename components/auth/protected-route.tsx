'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMsal, useIsAuthenticated } from "@azure/msal-react"
import { BottomNav } from '../layout/bottom-nav'

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated && pathname !== '/login') {
          await instance.handleRedirectPromise().catch(() => {
            // Ignore redirect promise errors
          })
          localStorage.removeItem('isLoggedIn')
          router.push('/login')
        } else if (isAuthenticated && pathname === '/login') {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isAuthenticated, router, pathname, instance])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <>
      {isAuthenticated && <BottomNav isMobile={isMobile} />}
      <main className={`${isAuthenticated && !isMobile ? 'md:ml-64' : ''} ${isMobile ? 'pb-16' : ''}`}>
        {children}
      </main>
    </>
  )
}

