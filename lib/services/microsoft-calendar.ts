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
      throw new Error('No Microsoft account found')
    }

    // Get access token silently
    const result = await msalInstance.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
      account: accounts[0]
    })

    // Initialize Microsoft Graph client
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, result.accessToken)
      },
    })

    // Add event to calendar using Microsoft Graph API
    const response = await graphClient
      .api('/me/events')
      .post(event)

    return response
  } catch (error: any) {
    if (error.name === 'InteractionRequiredAuthError') {
      // If silent token acquisition fails, try interactive
      try {
        const result = await msalInstance.acquireTokenPopup({
          scopes: ['Calendars.ReadWrite']
        })
        
        const graphClient = Client.init({
          authProvider: (done) => {
            done(null, result.accessToken)
          },
        })

        const response = await graphClient
          .api('/me/events')
          .post(event)

        return response
      } catch (interactiveError) {
        console.error('Error in interactive token acquisition:', interactiveError)
        throw new Error('Failed to authenticate with Microsoft')
      }
    }
    console.error('Error adding event to calendar:', error)
    throw new Error('Failed to add event to calendar')
  }
}

