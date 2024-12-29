import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tree Inspections',
    short_name: 'TreeInspect',
    description: 'Manage and track tree inspections efficiently',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#00ff00',
    icons: [
      {
        src: '/icons-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons-256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  }
}

