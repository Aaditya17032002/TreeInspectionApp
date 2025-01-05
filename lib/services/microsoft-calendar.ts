import { Client } from '@microsoft/microsoft-graph-client'
import { msalInstance } from '../msal-config'

interface CalendarEvent {
  subject: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location: {
    displayName: string
  }
  body: {
    contentType: string
    content: string
  }
}

export async function addToOutlookCalendar(event: CalendarEvent) {
  try {
    const accounts = msalInstance.getAllAccounts()
    
    if (accounts.length === 0) {
      throw new Error('No accounts found')
    }

    const result = await msalInstance.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
      account: accounts[0]
    })

    const client = Client.init({
      authProvider: (done) => {
        done(null, result.accessToken)
      },
    })

    await client.api('/me/events').post(event)
  } catch (error) {
    console.error('Error adding event to calendar:', error)
    throw new Error('Failed to add event to calendar')
  }
}

