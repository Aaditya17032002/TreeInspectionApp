import { NextResponse } from 'next/server'
import { BlobServiceClient } from "@azure/storage-blob"

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!
const CONTAINER_NAME = "tree-inspection-images"

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body || !body.base64Data || !body.fileName) {
      return NextResponse.json({ 
        error: 'Missing required fields: base64Data and fileName are required' 
      }, { status: 400 })
    }

    const { base64Data, fileName } = body

    // Ensure base64Data is a string
    if (typeof base64Data !== 'string') {
      return NextResponse.json({ 
        error: 'base64Data must be a string' 
      }, { status: 400 })
    }

    // Handle both with and without data URI prefix
    let buffer: Buffer
    if (base64Data.includes(',')) {
      // If it has a data URI prefix
      buffer = Buffer.from(base64Data.split(',')[1], 'base64')
    } else {
      // If it's just the base64 string
      buffer = Buffer.from(base64Data, 'base64')
    }

    const blockBlobClient = containerClient.getBlockBlobClient(fileName)

    // Upload the file
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: 'image/jpeg'
      }
    })

    return NextResponse.json({ url: blockBlobClient.url })
  } catch (error) {
    console.error('Error uploading to blob storage:', error)
    return NextResponse.json(
      { error: `Failed to upload to blob storage: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    
    if (!body || !body.fileName) {
      return NextResponse.json({ 
        error: 'Missing required field: fileName' 
      }, { status: 400 })
    }

    const { fileName } = body

    const blockBlobClient = containerClient.getBlockBlobClient(fileName)
    await blockBlobClient.delete()

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting from blob storage:', error)
    return NextResponse.json(
      { error: `Failed to delete from blob storage: ${error.message}` },
      { status: 500 }
    )
  }
}

