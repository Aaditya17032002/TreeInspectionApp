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
  
  // Add any other interfaces that are specific to the admin functionality
  
  