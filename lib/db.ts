import { openDB, DBSchema } from 'idb'
import { compressImage } from './utils/image-compression'

interface Inspection {
  id: string
  title: string
  status: 'Pending' | 'In-Progress' | 'Completed'
  location: {
    address: string
    postalCode: string
    coordinates: [number, number]
  }
  scheduledDate: string
  inspector: {
    name: string
    id: string
  }
  communityBoard: string
  details: string
  images: string[]
  createdAt: string
  updatedAt: string
}

interface TreeInspectionDB extends DBSchema {
  inspections: {
    key: string
    value: Inspection
    indexes: {
      'by-status': string
      'by-date': string
    }
  }
  images: {
    key: string
    value: string // Base64 encoded compressed image
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
        
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images')
        }
      },
    })
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export async function saveInspection(inspection: Inspection, imageFiles: File[]) {
  const db = await initDB()

  // Compress and save images
  const compressedImages = await Promise.all(
    imageFiles.map(async (file) => {
      const compressed = await compressImage(file)
      const imageId = `${inspection.id}-${Math.random().toString(36).substring(7)}`
      await db.put('images', compressed, imageId)
      return imageId
    })
  )

  // Save inspection with image references
  const inspectionWithImages = {
    ...inspection,
    images: compressedImages,
  }

  await db.put('inspections', inspectionWithImages)
  return inspectionWithImages
}

export async function getInspection(id: string) {
  const db = await initDB()
  const inspection = await db.get('inspections', id)
  if (!inspection) return null

  // Load images
  const images = await Promise.all(
    inspection.images.map(async (imageId) => {
      return db.get('images', imageId)
    })
  )

  return {
    ...inspection,
    images,
  }
}

export async function getAllInspections() {
  const db = await initDB()
  try {
    return await db.getAll('inspections')
  } catch (error) {
    console.error('Error getting all inspections:', error)
    throw error
  }
}

export async function updateInspectionStatus(id: string, status: Inspection['status']) {
  const db = await initDB()
  const inspection = await db.get('inspections', id)
  if (!inspection) return null

  const updated = {
    ...inspection,
    status,
    updatedAt: new Date().toISOString(),
  }

  await db.put('inspections', updated)
  return updated
}

export async function clearDatabase() {
  const db = await initDB()
  await db.clear('inspections')
  await db.clear('images')
}

