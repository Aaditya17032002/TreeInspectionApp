class BlobStorageService {
  async uploadBase64Image(base64Data: string, fileName: string): Promise<string> {
    try {
      // Validate inputs
      if (!base64Data || !fileName) {
        throw new Error('base64Data and fileName are required')
      }

      const response = await fetch('/api/blob-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Data,
          fileName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error uploading base64 image:', error)
      throw error instanceof Error 
        ? error 
        : new Error('Failed to upload base64 image to blob storage')
    }
  }

  async deleteImage(fileName: string): Promise<void> {
    try {
      if (!fileName) {
        throw new Error('fileName is required')
      }

      const response = await fetch('/api/blob-storage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error instanceof Error 
        ? error 
        : new Error('Failed to delete image from blob storage')
    }
  }
}

export const blobStorageService = new BlobStorageService()

