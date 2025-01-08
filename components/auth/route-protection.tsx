'use client'

import { usePathname } from 'next/navigation'
import { ProtectedRoute } from './protected-route'
import { NotificationToast } from '../notifications/notification-toast'
import { InstallPrompt } from '../pwa/install-prompt'
import { ServiceWorkerRegister } from '../../app/service-worker-register'

const publicRoutes = ['/', '/role-selection', '/login', '/admin/login', '/admin/dashboard']

export function RouteProtection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAdminRoute = pathname.startsWith('/admin')

  if (isPublicRoute || (isAdminRoute && localStorage.getItem('adminLoggedIn') === 'true')) {
    return <>{children}</>
  }

  return (
    <ProtectedRoute>
      {children}
      <NotificationToast />
      <InstallPrompt />
      <ServiceWorkerRegister />
    </ProtectedRoute>
  )
}
