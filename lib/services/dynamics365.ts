import axios from 'axios'
import { Dynamics365InspectionSchema, DynamicsStatusMapping, DynamicsStatusReverseMapping } from '../types/dynamics365'
import { Inspection } from '../types'
require('dotenv').config({ path: '.env.local' });

const DYNAMICS_CONFIG = {
    url: process.env.DYNAMICS_URL,
    apiVersion: process.env.DYNAMICS_API_VERSION,
    entityName: process.env.DYNAMICS_ENTITY_NAME,
    clientId: process.env.DYNAMICS_CLIENT_ID,
    clientSecret: process.env.DYNAMICS_CLIENT_SECRET,
    tenantId: process.env.DYNAMICS_TENANT_ID
}

class Dynamics365Service {
  private api: ReturnType<typeof axios.create>
  private tokenExpiry: number = 0
  private accessToken: string = ''

  constructor() {
    this.api = axios.create({
      baseURL: `${DYNAMICS_CONFIG.url}/api/data/v${DYNAMICS_CONFIG.apiVersion}`,
      headers: {
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    this.api.interceptors.request.use(async (config) => {
      const token = await this.getValidToken()
      config.headers['Authorization'] = `Bearer ${token}`
      return config
    })
  }

  private async getValidToken(): Promise<string> {
    if (Date.now() < this.tokenExpiry && this.accessToken) {
      return this.accessToken
    }

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${DYNAMICS_CONFIG.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: DYNAMICS_CONFIG.clientId,
          client_secret: DYNAMICS_CONFIG.clientSecret,
          grant_type: 'client_credentials',
          scope: `${DYNAMICS_CONFIG.url}/.default`,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      this.accessToken = response.data.access_token
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000
      return this.accessToken
    } catch (error) {
      console.error('Error getting access token:', error)
      throw new Error('Failed to get access token')
    }
  }

  async createInspection(inspection: Inspection): Promise<string> {
    try {
      const [primaryImage, ...additionalImages] = inspection.images

      const dynamicsInspection = {
        new_name: inspection.title,
        new_offlineid: inspection.id,
        new_latitude: inspection.location.coordinates[1],
        new_longitude: inspection.location.coordinates[0],
        new_address: inspection.location.address,
        new_postalcode: inspection.location.postalCode,
        new_status: DynamicsStatusMapping[inspection.status],
        new_inspectorid: inspection.inspector.id,
        new_inspectorname: inspection.inspector.name,
        new_description: inspection.details,
        new_communityboard: inspection.communityBoard,
        new_primaryimageurl: primaryImage,
        new_additionalimages: additionalImages.join(','),
        new_syncstatus: true,
        new_lastsyncedon: new Date().toISOString(),
        new_syncattempts: 1
      }

      const response = await this.api.post(
        `/${DYNAMICS_CONFIG.entityName}`,
        dynamicsInspection
      )

      return response.data.new_treeinspectionid
    } catch (error) {
      console.error('Error creating inspection in Dynamics:', error)
      throw new Error('Failed to create inspection in Dynamics 365')
    }
  }

  async updateInspection(inspectionId: string, inspection: Partial<Inspection>): Promise<void> {
    try {
      const updateData: Partial<Dynamics365InspectionSchema> = {}

      if (inspection.status) {
        updateData.new_status = DynamicsStatusMapping[inspection.status]
      }

      if (inspection.images) {
        const [primaryImage, ...additionalImages] = inspection.images
        updateData.new_primaryimageurl = primaryImage
        updateData.new_additionalimages = additionalImages.join(',')
      }

      if (inspection.location) {
        updateData.new_latitude = inspection.location.coordinates[1]
        updateData.new_longitude = inspection.location.coordinates[0]
        updateData.new_address = inspection.location.address
        updateData.new_postalcode = inspection.location.postalCode
      }

      updateData.new_lastsyncedon = new Date().toISOString()

      await this.api.patch(
        `/${DYNAMICS_CONFIG.entityName}(${inspectionId})`,
        updateData
      )
    } catch (error) {
      console.error('Error updating inspection in Dynamics:', error)
      throw new Error('Failed to update inspection in Dynamics 365')
    }
  }

  async getInspections(): Promise<Inspection[]> {
    try {
      const response = await this.api.get(`/${DYNAMICS_CONFIG.entityName}`)
      
      return response.data.value.map((item: Dynamics365InspectionSchema) => ({
        id: item.new_offlineid,
        title: item.new_name,
        status: DynamicsStatusReverseMapping[item.new_status],
        location: {
          coordinates: [item.new_longitude, item.new_latitude],
          address: item.new_address,
          postalCode: item.new_postalcode,
        },
        scheduledDate: item.new_createdon,
        inspector: {
          id: item.new_inspectorid,
          name: item.new_inspectorname,
        },
        communityBoard: item.new_communityboard,
        details: item.new_description,
        images: [
          item.new_primaryimageurl,
          ...(item.new_additionalimages ? item.new_additionalimages.split(',') : [])
        ].filter(Boolean),
        createdAt: item.new_createdon,
        updatedAt: item.new_modifiedon,
        synced: item.new_syncstatus,
      }))
    } catch (error) {
      console.error('Error fetching inspections from Dynamics:', error)
      throw new Error('Failed to fetch inspections from Dynamics 365')
    }
  }
}

export const dynamics365Service = new Dynamics365Service()

