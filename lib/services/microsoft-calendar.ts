import { PublicClientApplication } from '@azure/msal-browser'
import { Client } from '@microsoft/microsoft-graph-client'
import { msalConfig } from '../msal-config'

interface CalendarEvent {
  subject: string
  start: Date
  end: Date
  location: string
  body: string
}

export async function addToOutlookCalendar(event: CalendarEvent) {
  try {
    const pca = new PublicClientApplication(msalConfig)
    const accounts = pca.getAllAccounts()
    
    if (accounts.length === 0) {
      throw new Error('No accounts found')
    }

    const result = await pca.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
      account: accounts[0]
    })

    const client = Client.init({
      authProvider: (done) => {
        done(null, result.accessToken)
      },
    })

    await client.api('/me/events').post({
      subject: event.subject,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: {
        displayName: event.location,
      },
      body: {
        contentType: 'text',
        content: event.body,
      },
    })
  } catch (error) {
    console.error('Error adding event to calendar:', error)
    throw new Error('Failed to add event to calendar')
  }
}

