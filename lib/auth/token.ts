import { TokenResponse } from '../types'

const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token'

interface TokenCache {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

export async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken
  }

  try {
    // Prepare the token request body
    const params = new URLSearchParams({
      client_id: process.env.DYNAMICS_CLIENT_ID!,
      client_secret: process.env.DYNAMICS_CLIENT_SECRET!,
      scope: process.env.DYNAMICS_SCOPE || 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    })

    // Make the token request
    const response = await fetch(
      TOKEN_ENDPOINT.replace('{tenant}', process.env.DYNAMICS_TENANT_ID!),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      }
    )

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`)
    }

    const data: TokenResponse = await response.json()

    // Cache the token with expiration
    tokenCache = {
      accessToken: data.access_token,
      // Set expiration 5 minutes before actual expiry to be safe
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    }

    return data.access_token
  } catch (error) {
    console.error('Failed to acquire access token:', error)
    throw new Error('Authentication failed: Unable to acquire access token')
  }
}

