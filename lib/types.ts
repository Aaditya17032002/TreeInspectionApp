export * from './types/index';

// Add types for the token response
export interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
}