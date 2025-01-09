import { openDB } from 'idb'
import { checkInternetConnection } from '../utils/network'
import { blobStorageService } from './blob-storage'
import { Inspection, Dynamics365InspectionSchema, DynamicsStatusMapping } from '../types'
import { getAccessToken } from '../auth/token'

const SYNC_INTERVAL = 1000 * 60 * 5 // 5 minutes
const DYNAMICS_API_URL = process.env.NEXT_PUBLIC_DYNAMICS_API_URL
const DYNAMICS_INSPECTION_ENTITY_NAME = process.env.DYNAMICS_INSPECTION_ENTITY_NAME
const DYNAMICS_IMAGE_ENTITY_NAME = process.env.DYNAMICS_IMAGE_ENTITY_NAME

interface SyncQueue {
  id: string
  type: 'inspection' | 'image'
  data: any
  retryCount: number
}

class SyncService {
  private syncInProgress = false
  private db: any = null

  constructor() {
    this.initDB()
    this.startSyncInterval()
  }

  private async initDB() {
    this.db = await openDB('sync-queue-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' })
        }
      },
    })
  }

  private startSyncInterval() {
    setInterval(() => {
      this.attemptSync()
    }, SYNC_INTERVAL)
  }

  async queueForSync(data: Inspection) {
    await this.db.add('syncQueue', {
      id: data.id,
      type: 'inspection',
      data,
      retryCount: 0,
    })
    this.attemptSync()
  }

  private async attemptSync() {
    if (this.syncInProgress) return
    
    const isOnline = await checkInternetConnection()
    if (!isOnline) {
      console.log('No internet connection. Sync postponed.')
      return
    }

    this.syncInProgress = true

    try {
      const queue = await this.db.getAll('syncQueue')
      
      for (const item of queue) {
        try {
          if (item.type === 'inspection') {
            await this.syncInspection(item.data)
          }
          await this.db.delete('syncQueue', item.id)
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error)
          
          // Update retry count
          item.retryCount++
          if (item.retryCount < 3) {
            await this.db.put('syncQueue', item)
          } else {
            await this.db.delete('syncQueue', item.id)
            console.error(`Sync failed after 3 attempts for item ${item.id}`)
          }
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  private async syncInspection(inspection: Inspection): Promise<void> {
    // First, upload all images to blob storage
    const imageUrls = await Promise.all(
      inspection.images.map(async (base64Image: string, index: number) => {
        const fileName = `${inspection.id}_${index}.jpg`
        return await blobStorageService.uploadBase64Image(base64Image, fileName)
      })
    )

    // Then sync with Dynamics 365
    const dynamicsInspection: Dynamics365InspectionSchema = {
      new_treeinspectionid: inspection.id,
      new_name: inspection.title,
      new_offlineid: inspection.id,
      new_latitude: inspection.location.latitude,
      new_longitude: inspection.location.longitude,
      new_address: inspection.location.address,
      new_postalcode: '', // Assuming this is not in our current schema
      new_status: DynamicsStatusMapping[inspection.status],
      new_createdon: inspection.createdAt,
      new_modifiedon: inspection.updatedAt,
      new_inspectorid: inspection.inspector.id,
      new_inspectorname: inspection.inspector.name,
      new_description: inspection.details,
      new_communityboard: inspection.communityBoard,
      new_syncstatus: true,
      new_lastsyncedon: new Date().toISOString(),
      new_syncattempts: 1
    }

    // Create main inspection record
    const response = await fetch(`${DYNAMICS_API_URL}/${DYNAMICS_INSPECTION_ENTITY_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAccessToken()}`
      },
      body: JSON.stringify(dynamicsInspection)
    })

    if (!response.ok) {
      throw new Error('Failed to sync inspection to Dynamics 365')
    }

    const createdInspection = await response.json()

    // Create image records
    await Promise.all(
      imageUrls.map(async (imageUrl) => {
        const imageData = {
          new_complaintid: createdInspection.new_treeinspectionid,
          new_imageurl: imageUrl
        }

        const imageResponse = await fetch(`${DYNAMICS_API_URL}/${DYNAMICS_IMAGE_ENTITY_NAME}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
          },
          body: JSON.stringify(imageData)
        })

        if (!imageResponse.ok) {
          throw new Error('Failed to sync image to Dynamics 365')
        }
      })
    )
  }
}

export const syncService = new SyncService()

