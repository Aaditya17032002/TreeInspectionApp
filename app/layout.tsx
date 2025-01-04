import './globals.css'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from '../components/ui/toast'
import { ProtectedRoute } from '../components/auth/protected-route'
import { InstallPrompt } from '../components/pwa/install-prompt'
import { Providers } from './providers'
import { ServiceWorkerRegister } from './service-worker-register'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tree Inspection App',
  description: 'Manage and track tree inspections',
  manifest: '/manifest.json',
  themeColor: '#9333ea',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tree Inspections',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: '/icons-192.png',
  },
}

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
            {children}
          </ProtectedRoute>
          <ToastContainer />
          <InstallPrompt />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  )
}

