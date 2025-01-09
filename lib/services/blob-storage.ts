import { BlobServiceClient, ContainerClient } from "@azure/storage-blob"

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || ""
const CONTAINER_NAME = "tree-inspection-images"

class BlobStorageService {
  private containerClient: ContainerClient | null = null

  constructor() {
    if (AZURE_STORAGE_CONNECTION_STRING) {
      try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
        this.containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME)
      } catch (error) {
        console.error("Failed to initialize BlobStorageService:", error)
      }
    } else {
      console.warn("Azure Storage connection string is not set.")
    }
  }

  async uploadImage(file: File, fileName: string): Promise<string> {
    if (!this.containerClient) {
      throw new Error("BlobStorageService is not properly initialized")
    }

    try {
      await this.containerClient.createIfNotExists()
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName)
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: { 
          blobContentType: file.type,
          blobCacheControl: 'public, max-age=31536000' // 1 year cache
        }
      })
      
      return blockBlobClient.url
    } catch (error) {
      console.error('Error uploading to blob storage:', error)
      throw new Error('Failed to upload image to blob storage')
    }
  }

  async deleteImage(fileName: string): Promise<void> {
    if (!this.containerClient) {
      throw new Error("BlobStorageService is not properly initialized")
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName)
      await blockBlobClient.delete()
    } catch (error) {
      console.error('Error deleting from blob storage:', error)
      throw new Error('Failed to delete image from blob storage')
    }
  }
}

export const blobStorageService = new BlobStorageService()

