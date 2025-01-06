'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { MsalProvider } from "@azure/msal-react"
import { PublicClientApplication } from "@azure/msal-browser"
import { msalConfig } from "../lib/msal-config"

// Initialize MSAL outside of component
const msalInstance = new PublicClientApplication(msalConfig)

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </MsalProvider>
  )
}

