import { Metadata } from 'next'

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

