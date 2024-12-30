'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '../../components/ui/button'
import { Plus } from 'lucide-react'
import { InspectionSheet } from './components/inspection-sheet'
import { NewInspectionDialog } from './components/new-inspection-dialog'
import type { Inspection } from '../../lib/types'

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpdHlhMTcwMzIwMDIiLCJhIjoiY201NTk0eGE1MmhsYzJtcHpwZHkxYzI1YSJ9.-crvgtTpoASRfBDF9PvHGA'

export default function InspectionMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState(false)
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

  const handleNewInspection = (newInspection: Omit<Inspection, "id">) => {
    const inspectionWithId: Inspection = {
      ...newInspection,
      id: Date.now().toString(),
      location: {
        ...newInspection.location,
        coordinates: currentLocation,
      },
    }
    setInspections(prev => [...prev, inspectionWithId])
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Map View</h1>
        <Button 
          onClick={() => setIsNewInspectionOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </header>

      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      <InspectionSheet
        inspection={selectedInspection}
        onClose={() => setSelectedInspection(null)}
      />

      <NewInspectionDialog
        open={isNewInspectionOpen}
        onOpenChange={setIsNewInspectionOpen}
        onSave={handleNewInspection}
      />
    </div>
  )
}
