import { initDB } from '../db'
import { blobStorageService } from './blob-storage'
import { dynamics365Service } from './dynamics365'
import { Inspection } from '../types'

class SyncService {
  private syncInProgress = false
  private networkStatus: boolean = navigator.onLine

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleNetworkChange.bind(this))
    window.addEventListener('offline', this.handleNetworkChange.bind(this))
  }

  private handleNetworkChange(event: Event) {
    this.networkStatus = event.type === 'online'
    if (this.networkStatus) {
      this.syncPendingData()
    }
  }

  async syncPendingData(): Promise<void> {
    if (this.syncInProgress || !this.networkStatus) return

    try {
      this.syncInProgress = true
      const db = await initDB()
      const pendingInspections = await db.getAll('offlineInspections')

      for (const inspection of pendingInspections) {
        try {
          // First, upload images to blob storage
          const imageUrls = await this.uploadImages(inspection.images)
          
          // Update inspection with image URLs
          const inspectionWithUrls: Inspection = {
            ...inspection,
            images: imageUrls
          }

          // Sync to Dynamics 365
          const dynamicsId = await dynamics365Service.createInspection(inspectionWithUrls)
          
          // Update local DB with synced status and dynamics ID
          const syncedInspection: Inspection = {
            ...inspectionWithUrls,
            synced: true,
            dynamicsId
          }
          await db.put('inspections', syncedInspection)

          // Remove from offline store
          await db.delete('offlineInspections', inspection.id)

        } catch (error) {
          console.error(`Failed to sync inspection ${inspection.id}:`, error)
          // Update sync attempts and last error
          await db.put('offlineInspections', {
            ...inspection,
            syncAttempts: (inspection.syncAttempts || 0) + 1,
            lastSyncError: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  private async uploadImages(images: File[]): Promise<string[]> {
    const uploadPromises = images.map(async (image) => {
      const fileName = `inspection-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      return blobStorageService.uploadImage(image, fileName)
    })

    return Promise.all(uploadPromises)
  }

  async saveInspection(inspection: Inspection, images: File[]): Promise<Inspection> {
    const db = await initDB()

    try {
      if (this.networkStatus) {
        // Online flow: Upload images first
        const imageUrls = await this.uploadImages(images)
        const inspectionWithUrls: Inspection = {
          ...inspection,
          images: imageUrls
        }

        // Sync to Dynamics
        const dynamicsId = await dynamics365Service.createInspection(inspectionWithUrls)
        
        // Save to local DB with synced status
        const syncedInspection: Inspection = {
          ...inspectionWithUrls,
          synced: true,
          dynamicsId
        }
        await db.put('inspections', syncedInspection)
        return syncedInspection
      } else {
        // Offline flow: Save to offline store
        const offlineInspection = {
          ...inspection,
          images, // Store original files
          synced: false,
          syncAttempts: 0,
          createdAt: new Date().toISOString()
        }
        await db.put('offlineInspections', offlineInspection)
        return inspection
      }
    } catch (error) {
      console.error('Error saving inspection:', error)
      // Always save to offline store if there's an error
      const offlineInspection = {
        ...inspection,
        images,
        synced: false,
        syncAttempts: 0,
        createdAt: new Date().toISOString()
      }
      await db.put('offlineInspections', offlineInspection)
      return inspection
    }
  }
}

export const syncService = new SyncService()

