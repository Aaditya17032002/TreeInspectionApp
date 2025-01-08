import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '../components/ui/toast'
import { RouteProtection } from '../components/auth/route-protection'
import { Providers } from './providers'
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
          <RouteProtection>
            {children}
          </RouteProtection>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

