'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Download, Filter, FileDown } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { getAllInspections } from '../../lib/db'
import { Inspection } from '../../lib/types'
import { Badge } from '../../components/ui/badge'
import { generatePDF } from './components/pdfGenerator'
import { ReportPreview } from './report-preview'

export default function ReportsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [touchStartTime, setTouchStartTime] = useState<number>(0)
  const [touchStartY, setTouchStartY] = useState<number>(0)
  const [isTouchMove, setIsTouchMove] = useState(false)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    try {
      const data = await getAllInspections()
      setInspections(data)
    } catch (error) {
      console.error('Error loading inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTouchStart = useCallback((e: React.TouchEvent, inspection: Inspection) => {
    setTouchStartTime(Date.now())
    setTouchStartY(e.touches[0].clientY)
    setIsTouchMove(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const moveDistance = Math.abs(e.touches[0].clientY - touchStartY)
    if (moveDistance > 10) {
      setIsTouchMove(true)
    }
  }, [touchStartY])

  const handleTouchEnd = useCallback((inspection: Inspection) => {
    const touchDuration = Date.now() - touchStartTime
    if (touchDuration > 500 && !isTouchMove) {
      setSelectedInspection(inspection)
    }
  }, [touchStartTime, isTouchMove])

  const filteredInspections = inspections.filter(inspection => {
    if (filter === 'all') return true
    return inspection.status.toLowerCase() === filter
  })

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalInspections: filteredInspections.length,
      statusBreakdown: {
        pending: filteredInspections.filter(i => i.status === 'Pending').length,
        inProgress: filteredInspections.filter(i => i.status === 'In-Progress').length,
        completed: filteredInspections.filter(i => i.status === 'Completed').length,
      },
      inspections: filteredInspections.map(i => ({
        id: i.id,
        title: i.title,
        status: i.status,
        location: i.location.address,
        scheduledDate: i.scheduledDate,
        inspector: i.inspector.name,
      })),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tree-inspections-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGeneratePDF = (inspection?: Inspection) => {
    if (inspection) {
      generatePDF([inspection], 'single')
    } else {
      generatePDF(filteredInspections, filter)
    }
  }

  return (
    <>
      <main className="pb-16 md:pb-0 min-h-screen bg-background">
        <header className="border-b p-4 bg-background sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl font-bold text-foreground">Reports</h1>
          </div>
        </header>

        <div className="p-4 space-y-4 pb-24">
          <Card className="p-4">
            {/* ... Stats and filter section remains the same ... */}
          </Card>

          <div className="space-y-4">
            {loading ? (
              <Card className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </Card>
            ) : (
              <div className="space-y-4 overflow-visible pb-16">
                {filteredInspections.map(inspection => (
                  <Card 
                    key={inspection.id} 
                    className="p-4 transition-colors touch-pan-y"
                    onTouchStart={(e) => handleTouchStart(e, inspection)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleTouchEnd(inspection)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-600 dark:text-purple-400">
                            #{inspection.id}
                          </span>
                          <Badge variant={
                            inspection.status === 'Pending' ? 'secondary' :
                            inspection.status === 'In-Progress' ? 'default' : 'destructive'
                          }>
                            {inspection.status}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-foreground">{inspection.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {inspection.location.address}
                        </p>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {new Date(inspection.scheduledDate).toLocaleDateString()}
                      </time>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedInspection && (
        <ReportPreview
          inspection={selectedInspection}
          open={!!selectedInspection}
          onOpenChange={(open) => !open && setSelectedInspection(null)}
          onDownload={() => handleGeneratePDF(selectedInspection)}
        />
      )}
    </>
  )
}

