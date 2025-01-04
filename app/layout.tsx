import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '../components/ui/toast'
import { ProtectedRoute } from '../components/auth/protected-route'
import { InstallPrompt } from '../components/pwa/install-prompt'
import { Providers } from './providers'
import { ServiceWorkerRegister } from './service-worker-register'
import { NotificationToast } from '../components/notifications/notification-toast'
import { metadata } from './metadata'

const inter = Inter({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Tree Inspections" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons-192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
              {/* BottomNav and other components would go here */}
              <div className={`flex-1 transition-all duration-300 ease-in-out`}>
                <main className="min-h-screen w-full">
                  {children}
                </main>
              </div>
              <NotificationToast />
              <InstallPrompt />
              <ServiceWorkerRegister />
            </div>
          </ProtectedRoute>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

