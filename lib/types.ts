export interface Inspection {
  id: string;
  title: string;
  status: 'Pending' | 'In-Progress' | 'Completed';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  scheduledDate: string;
  inspector: {
    name: string;
    id: string;
  };
  communityBoard: string;
  details: string;
  images: string[]; // URLs for synced inspections
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  dynamicsId?: string;
  notes?: Note[];
}

  export interface User {
    id: string
    name: string
    email: string
    role: 'inspector' | 'admin'
    avatar?: string
  }

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
  
  export interface Note {
    text: string;
    timestamp: string;
  }
  
  export interface RephraseResponse {
    rephrasedText: string;
    error?: string;
    details?: string;
  }
  
  