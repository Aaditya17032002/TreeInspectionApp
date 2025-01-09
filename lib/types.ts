import { Inspection as InspectionType, User, Note } from './types/index';

export type Inspection = InspectionType;

export interface GeolocationResponse {
  latitude: number;
  longitude: number;
}

export interface AddressUpdate {
  latitude: number;
  longitude: number;
  timestamp: number;
  address?: string;
  status: 'pending' | 'synced' | 'failed';
}

export interface LocationCache {
  address: string;
  timestamp: number;
  expiresAt: number;
}

export interface SyncStatus {
  lastSync: number;
  pending: number;
  failed: number;
}

export interface OfflineInspection extends Omit<Inspection, 'images'> {
  images: File[];
  syncAttempts: number;
  lastSyncError?: string;
}

export interface RephraseResponse {
  rephrasedText: string;
  error?: string;
  details?: string;
}

