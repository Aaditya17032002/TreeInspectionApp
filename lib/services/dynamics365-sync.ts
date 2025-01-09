import { Inspection, Dynamics365InspectionSchema, DynamicsStatusMapping, DynamicsStatusReverseMapping } from '../types'
import { getAccessToken } from '../auth/token'

const DYNAMICS_API_URL = process.env.DYNAMICS_API_URL
const DYNAMICS_INSPECTION_ENTITY_NAME = process.env.DYNAMICS_INSPECTION_ENTITY_NAME
const DYNAMICS_IMAGE_ENTITY_NAME = process.env.DYNAMICS_IMAGE_ENTITY_NAME

export class Dynamics365Service {
  async syncInspectionToDynamics365(inspection: Inspection): Promise<void> {
    try {
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
        inspection.images.map(async (imageUrl) => {
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

      console.log(`Synced inspection: ${inspection.id}`)
    } catch (error) {
      console.error(`Error syncing inspection ${inspection.id}:`, error)
      throw error
    }
  }

  async fetchInspectionDetails(complaintId: string): Promise<Inspection> {
    try {
      // Fetch inspection details
      const inspectionResponse = await fetch(
        `${DYNAMICS_API_URL}/${DYNAMICS_INSPECTION_ENTITY_NAME}(${complaintId})`,
        {
          headers: {
            'Authorization': `Bearer ${await getAccessToken()}`
          }
        }
      )

      if (!inspectionResponse.ok) {
        throw new Error('Failed to fetch inspection details')
      }

      const inspection = await inspectionResponse.json()

      // Fetch associated images
      const imagesResponse = await fetch(
        `${DYNAMICS_API_URL}/${DYNAMICS_IMAGE_ENTITY_NAME}?$filter=new_complaintid eq '${complaintId}'`,
        {
          headers: {
            'Authorization': `Bearer ${await getAccessToken()}`
          }
        }
      )

      if (!imagesResponse.ok) {
        throw new Error('Failed to fetch inspection images')
      }

      const imagesData = await imagesResponse.json()

      // Combine inspection data with image URLs
      const fullInspectionDetails: Inspection = {
        id: inspection.new_treeinspectionid,
        title: inspection.new_name,
        status: DynamicsStatusReverseMapping[inspection.new_status],
        location: {
          address: inspection.new_address,
          latitude: inspection.new_latitude,
          longitude: inspection.new_longitude,
        },
        scheduledDate: inspection.new_createdon,
        inspector: {
          name: inspection.new_inspectorname,
          id: inspection.new_inspectorid,
          email: '', // This information might not be available in Dynamics 365
        },
        communityBoard: inspection.new_communityboard,
        details: inspection.new_description,
        images: imagesData.value.map((img: any) => img.new_imageurl),
        createdAt: inspection.new_createdon,
        updatedAt: inspection.new_modifiedon,
        synced: inspection.new_syncstatus,
        dynamicsId: inspection.new_treeinspectionid,
      }

      return fullInspectionDetails
    } catch (error) {
      console.error('Error fetching inspection details:', error)
      throw error
    }
  }
}

export const dynamics365Service = new Dynamics365Service()

