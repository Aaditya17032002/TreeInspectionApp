'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Sheet, SheetContent } from '../../components/ui/sheet'
import { Button } from '../../components/ui/button'
import { Plus, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '../../components/ui/badge'
import { getAllInspections } from '../../lib/db'
import { Inspection } from '../../lib/types'
import { getCurrentLocation } from '../../lib/services/geolocation'

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpdHlhMTcwMzIwMDIiLCJhIjoiY201NTk0eGE1MmhsYzJtcHpwZHkxYzI1YSJ9.-crvgtTpoASRfBDF9PvHGA'

export function InspectionMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const router = useRouter()
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-73.935242, 40.730610])

  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: currentLocation,
      zoom: 13
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [position.coords.longitude, position.coords.latitude]
        setCurrentLocation(newLocation)
        map.current?.flyTo({ center: newLocation })
      },
      (error) => {
        console.error('Error getting location:', error)
      }
    )

    return () => map.current?.remove()
  }, [])

  useEffect(() => {
    if (!map.current) return

    const markers = document.getElementsByClassName('marker')
    while(markers[0]) {
      markers[0].parentNode?.removeChild(markers[0])
    }

    inspections.forEach(inspection => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = '#9333EA'
      el.style.cursor = 'pointer'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'

      new mapboxgl.Marker(el)
        .setLngLat(inspection.location.coordinates)
        .addTo(map.current!)

      el.addEventListener('click', () => {
        setSelectedInspection(inspection)
      })
    })
  }, [inspections])

  const addMarker = (inspection: Inspection) => {
    if (!map.current) return

    const marker = new mapboxgl.Marker({
      color: '#7c3aed'
    })
      .setLngLat(inspection.location.coordinates)
      .addTo(map.current)

    marker.getElement().addEventListener('click', () => {
      setSelectedInspection(inspection)
    })
  }

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <div ref={mapContainer} className="h-full w-full" />
      
      <Button
        className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700"
        onClick={() => router.push('/inspections/new')}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Inspection
      </Button>

      <Sheet open={!!selectedInspection} onOpenChange={() => setSelectedInspection(null)}>
        <SheetContent side="bottom" className="h-[80vh]">
          {selectedInspection && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">#{selectedInspection.id}</h2>
                    <Badge>{selectedInspection.status}</Badge>
                  </div>
                  <p className="text-gray-600">{selectedInspection.title}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedInspection.location.address}</p>
                    <p className="text-gray-600">
                      Postal Code: {selectedInspection.location.postalCode}
                    </p>
                  </div>
                </div>

                {selectedInspection.images && selectedInspection.images.length > 0 && (
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <img
                      src={selectedInspection.images[0]}
                      alt="Inspection"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <Button 
                  className="w-full"
                  onClick={() => router.push(`/inspections/${selectedInspection.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

