import { openDB, DBSchema } from 'idb'
import { Inspection } from './types'
import {AdminComment, Notification} from '../lib/types/index'

interface TreeInspectionDB extends DBSchema {
  inspections: {
    key: string
    value: Inspection
    indexes: {
      'by-status': string
      'by-date': string
    }
  }
}

let db: any = null

export async function initDB() {
  if (db) return db

  try {
    db = await openDB<TreeInspectionDB>('tree-inspection-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('inspections')) {
          const inspectionStore = db.createObjectStore('inspections', {
            keyPath: 'id',
          })
          inspectionStore.createIndex('by-status', 'status')
          inspectionStore.createIndex('by-date', 'scheduledDate')
        }
      },
    })

    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      // Remove the data URL prefix to get just the base64 string
      const base64Data = base64String.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function saveInspection(inspection: Inspection, images: File[] = []): Promise<Inspection> {
  const db = await initDB()

  try {
    // Process images if provided
    const processedImages = await Promise.all(images.map(processImage))
    
    // Generate a unique ID if not provided
    const inspectionWithId = {
      ...inspection,
      id: inspection.id || crypto.randomUUID(),
      createdAt: inspection.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
      // Keep existing images if available, add new ones if provided
      images: [...(inspection.images || []), ...processedImages],
    }

    await db.put('inspections', inspectionWithId)
    return inspectionWithId
  } catch (error) {
    console.error('Error saving inspection:', error)
    throw error
  }
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  const db = await initDB()
  const inspection = await db.get('inspections', id)
  
  // Ensure images array exists
  if (inspection && !inspection.images) {
    inspection.images = []
  }
  
  return inspection
}

export async function getAllInspections(): Promise<Inspection[]> {
  const db = await initDB()
  const inspections = await db.getAll('inspections')
  
  // Ensure images array exists for all inspections
  return inspections.map(inspection => ({
    ...inspection,
    images: inspection.images || []
  }))
}

export async function updateInspectionStatus(id: string, status: Inspection['status']): Promise<Inspection> {
  const db = await initDB()
  const inspection = await db.get('inspections', id)
  if (!inspection) {
    throw new Error('Inspection not found')
  }

  const updatedInspection = {
    ...inspection,
    status,
    updatedAt: new Date().toISOString(),
    // Preserve existing images
    images: inspection.images || []
  }

  await db.put('inspections', updatedInspection)
  return updatedInspection
}


export async function addAdminComment(
  inspectionId: string,
  comment: string,
  adminUser: { id: string; name: string }
): Promise<Inspection> {
  const db = await initDB()
  const inspection = await db.get('inspections', inspectionId)

  if (!inspection) {
    throw new Error('Inspection not found')
  }

  const adminComment: AdminComment = {
    id: crypto.randomUUID(),
    text: comment,
    createdAt: new Date().toISOString(),
    adminId: adminUser.id,
    adminName: adminUser.name,
    read: false,
  }

  const updatedInspection = {
    ...inspection,
    adminComments: [...(inspection.adminComments || []), adminComment],
    updatedAt: new Date().toISOString(),
  }

  await db.put('inspections', updatedInspection)

  // Create notification
  const notification: Notification = {
    id: crypto.randomUUID(),
    type: 'comment',
    inspectionId: inspection.id,
    message: `New comment from ${adminUser.name} on inspection #${inspection.id}`,
    createdAt: new Date().toISOString(),
    read: false,
    recipientEmail: inspection.inspector.email,
  }

  await db.put('notifications', notification)

  // Send email notification (implement this based on your email service)
  await sendEmailNotification(
    inspection.inspector.email,
    'New Comment on Inspection',
    `Admin ${adminUser.name} has added a comment to inspection #${inspection.id}: ${comment}`
  )

  return updatedInspection
}

export async function updateInspectionPriority(
  inspectionId: string,
  priority: Inspection['priority'],
  adminUser: { id: string; name: string }
): Promise<Inspection> {
  const db = await initDB()
  const inspection = await db.get('inspections', inspectionId)

  if (!inspection) {
    throw new Error('Inspection not found')
  }

  const updatedInspection = {
    ...inspection,
    priority,
    updatedAt: new Date().toISOString(),
  }

  await db.put('inspections', updatedInspection)

  // Create notification
  const notification: Notification = {
    id: crypto.randomUUID(),
    type: 'priority_change',
    inspectionId: inspection.id,
    message: `Inspection #${inspection.id} priority changed to ${priority} by ${adminUser.name}`,
    createdAt: new Date().toISOString(),
    read: false,
    recipientEmail: inspection.inspector.email,
  }

  await db.put('notifications', notification)

  return updatedInspection
}

function sendEmailNotification(email: any, arg1: string, arg2: string) {
  throw new Error('Function not implemented.')
}
