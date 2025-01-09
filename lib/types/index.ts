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
      email: string;
    };
    communityBoard: string;
    details: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
    synced: boolean;
    dynamicsId?: string;
    notes?: Note[];
    adminComments?: AdminComment[];
    priority?: 'low' | 'medium' | 'high';
  }
  
  export interface AdminComment {
    id: string;
    text: string;
    createdAt: string;
    adminId: string;
    adminName: string;
    read: boolean;
  }
  
  export interface Notification {
    id: string;
    type: 'comment' | 'status_change' | 'priority_change';
    inspectionId: string;
    message: string;
    createdAt: string;
    read: boolean;
    recipientEmail: string;
  }
  
  export interface Note {
    text: string;
    timestamp: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'inspector' | 'admin';
    avatar?: string;
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
  
  export interface RephraseResponse {
    rephrasedText: string;
    error?: string;
    details?: string;
  }
  
  export interface Dynamics365InspectionSchema {
    new_treeinspectionid: string;
    new_name: string;
    new_offlineid: string;
    new_latitude: number;
    new_longitude: number;
    new_address: string;
    new_postalcode: string;
    new_status: number;
    new_createdon: string;
    new_modifiedon: string;
    new_inspectorid: string;
    new_inspectorname: string;
    new_description: string;
    new_communityboard: string;
    new_syncstatus: boolean;
    new_lastsyncedon: string;
    new_syncattempts: number;
  }
  
  export const DynamicsStatusMapping = {
    Pending: 1,
    'In-Progress': 2,
    Completed: 3,
  } as const;
  
  export const DynamicsStatusReverseMapping = {
    1: 'Pending',
    2: 'In-Progress',
    3: 'Completed',
  } as const;
  
  