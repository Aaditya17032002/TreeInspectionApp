import { openDB, DBSchema } from 'idb'
import { compressImage } from './utils/image-compression'
import { dynamics365Service } from './services/dynamics365'
import { Inspection } from './types'

interface PendingSync {
  id?: number
  inspectionId: string
  type: 'create' | 'update'
  data: any
  timestamp: number
  retryCount: number
}

interface TreeInspectionDB extends DBSchema {
  inspections: {
    key: string
    value: Inspection
    indexes: {
      'by-status': string
      'by-date': string
      'by-sync': number
    }
  }
  images: {
    key: string
    value: string
  }
  'pending-syncs': {
    key: number
    value: PendingSync
    indexes: {
      'by-inspection': string
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
          inspectionStore.createIndex('by-sync', 'synced')
        }
        
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images')
        }

        if (!db.objectStoreNames.contains('pending-syncs')) {
          const syncStore = db.createObjectStore('pending-syncs', {
            keyPath: 'id',
            autoIncrement: true,
          })
          syncStore.createIndex('by-inspection', 'inspectionId')
        }
      },
    })

    if (navigator.onLine) {
      syncPendingInspections()
    }

    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export async function saveInspection(inspection: Inspection, imageFiles: File[]) {
  const db = await initDB()

  try {
    const inspectionWithImages = await saveLocalInspection(inspection, imageFiles)

    if (navigator.onLine) {
      try {
        const dynamicsId = await dynamics365Service.createInspection(inspectionWithImages)
        
        await db.put('inspections', {
          ...inspectionWithImages,
          synced: true,
          dynamicsId
        })

        return {
          ...inspectionWithImages,
          synced: true,
          dynamicsId
        }
      } catch (error) {
        console.error('Failed to sync to Dynamics 365:', error)
        await addToPendingSync(inspectionWithImages)
      }
    } else {
      await addToPendingSync(inspectionWithImages)
    }

    return inspectionWithImages
  } catch (error) {
    console.error('Error saving inspection:', error)
    throw error
  }
}

async function saveLocalInspection(inspection: Inspection, imageFiles: File[]) {
  const db = await initDB()

  const compressedImages = await Promise.all(
    imageFiles.map(async (file) => {
      const compressed = await compressImage(file)
      const imageId = `${inspection.id}-${Math.random().toString(36).substring(7)}`
      
      // Convert the compressed string to a Blob
      const blob = await fetch(compressed).then(res => res.blob())
      
      const formData = new FormData()
      formData.append('file', blob, imageId)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await response.json()
      return url
    })
  )

  const inspectionWithImages = {
    ...inspection,
    images: compressedImages,
    synced: false,
  }

  await db.put('inspections', inspectionWithImages)
  return inspectionWithImages
}

async function addToPendingSync(inspection: Inspection) {
  const db = await initDB()
  await db.add('pending-syncs', {
    inspectionId: inspection.id,
    type: 'create',
    data: inspection,
    timestamp: Date.now(),
    retryCount: 0,
  })
}

export async function syncPendingInspections() {
  const db = await initDB()
  const pendingSyncs = await db.getAll('pending-syncs')

  for (const sync of pendingSyncs) {
    try {
      if (sync.type === 'create') {
        const dynamicsId = await dynamics365Service.createInspection(sync.data)
        
        const inspection = await db.get('inspections', sync.inspectionId)
        if (inspection) {
          await db.put('inspections', {
            ...inspection,
            synced: true,
            dynamicsId
          })
        }
      } else if (sync.type === 'update') {
        await dynamics365Service.updateInspection(sync.data.dynamicsId, sync.data)
        
        const inspection = await db.get('inspections', sync.inspectionId)
        if (inspection) {
          await db.put('inspections', {
            ...inspection,
            synced: true
          })
        }
      }

      await db.delete('pending-syncs', sync.id)
    } catch (error) {
      console.error(`Failed to sync inspection ${sync.inspectionId}:`, error)
      
      sync.retryCount++
      if (sync.retryCount < 5) {
        await db.put('pending-syncs', sync)
      }
    }
  }
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  const db = await initDB()
  return db.get('inspections', id)
}

export async function getAllInspections(): Promise<Inspection[]> {
  const db = await initDB()
  return db.getAll('inspections')
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
    synced: false,
  }

  await db.put('inspections', updatedInspection)

  if (navigator.onLine) {
    try {
      await dynamics365Service.updateInspection(updatedInspection.dynamicsId!, { status })
      updatedInspection.synced = true
      await db.put('inspections', updatedInspection)
    } catch (error) {
      console.error('Failed to sync status update to Dynamics 365:', error)
      await addToPendingSync(updatedInspection)
    }
  } else {
    await addToPendingSync(updatedInspection)
  }

  return updatedInspection
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, starting sync...')
    syncPendingInspections()
  })
}

