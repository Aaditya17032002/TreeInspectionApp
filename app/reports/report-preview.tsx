'use client'

import { Dialog, DialogContent } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { X, Download, Loader2 } from 'lucide-react'
import type { Inspection } from "../../lib/types"
import { useEffect, useRef, useState } from "react"
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

interface ReportPreviewProps {
  inspection: Inspection
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: () => void
}

interface AIReportContent {
  summary: string;
  observations: string;
  recommendations: string;
}

export function ReportPreview({ inspection, open, onOpenChange, onDownload }: ReportPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiContent, setAiContent] = useState<AIReportContent | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const generateAIReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://gemini-fastapi-1.onrender.com/generate_report_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inspection_details: {
            title: inspection.title,
            details: inspection.details,
            status: inspection.status,
            location: inspection.location,
            scheduledDate: inspection.scheduledDate,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI report');
      }

      const data = await response.json();
      // Extract the required fields from the response
      const aiContent: AIReportContent = {
        summary: data.summary || '',
        observations: data.observations || '',
        recommendations: data.recommendations || '',
      };
      setAiContent(aiContent);
      return aiContent;
    } catch (error) {
      console.error('Error generating AI report:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const generatePDF = async () => {
      // First, generate AI content
      const aiReport = await generateAIReport();
      
      const doc = new jsPDF() as ExtendedJsPDF;
      
      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.text('Tree Inspection Report', 105, 15, { align: 'center' })

      // Header Info
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text(`Report generated on: ${new Date().toLocaleString()}`, 20, 25)
      doc.text(`Report ID: ${inspection.id}`, 20, 30)

      // Status Badge
      doc.setFillColor(102, 45, 145)
      doc.setDrawColor(102, 45, 145)
      doc.setTextColor(255)
      doc.roundedRect(20, 35, 40, 10, 5, 5, 'FD')
      doc.text(inspection.status, 25, 42)

      // Reset text color
      doc.setTextColor(0)
      
      // Main Content
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Inspection Details', 20, 60)

      // Details Grid
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      const details = [
        ['Title', inspection.title],
        ['Date', new Date(inspection.scheduledDate).toLocaleString()],
        ['Location', inspection.location.address],
        ['Coordinates', `${inspection.location.latitude.toFixed(6)}, ${inspection.location.longitude.toFixed(6)}`],
        ['Inspector', `${inspection.inspector.name} (ID: ${inspection.inspector.id})`],
        ['Community Board', inspection.communityBoard],
      ]

      let yPos = 70
      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(`${label}:`, 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(value.toString(), 70, yPos)
        yPos += 10
      })

      // Description
      doc.setFont('helvetica', 'bold')
      doc.text('Details:', 20, yPos + 10)
      doc.setFont('helvetica', 'normal')
      const splitDetails = doc.splitTextToSize(inspection.details, 170)
      doc.text(splitDetails, 20, yPos + 20)

      // AI Generated Content
      if (aiContent) {
        const aiStartY = yPos + splitDetails.length * 10 + 30;
        
        // AI Summary
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.text('AI Analysis', 20, aiStartY)
        
        doc.setFontSize(14)
        doc.text('Summary', 20, aiStartY + 10)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        const splitSummary = doc.splitTextToSize(aiContent.summary, 170)
        doc.text(splitSummary, 20, aiStartY + 20)

        // AI Observations
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text('Observations', 20, aiStartY + splitSummary.length * 7 + 25)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        const splitObservations = doc.splitTextToSize(aiContent.observations, 170)
        doc.text(splitObservations, 20, aiStartY + splitSummary.length * 7 + 35)

        // AI Recommendations
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text('Recommendations', 20, aiStartY + splitSummary.length * 7 + splitObservations.length * 7 + 40)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        const splitRecommendations = doc.splitTextToSize(aiContent.recommendations, 170)
        doc.text(splitRecommendations, 20, aiStartY + splitSummary.length * 7 + splitObservations.length * 7 + 50)
      }

      // Images Section
      if (inspection.images && inspection.images.length > 0) {
        const imageStartY = doc.lastAutoTable?.finalY || yPos + splitDetails.length * 10 + 30
        doc.setFont('helvetica', 'bold')
        doc.text('Inspection Images', 20, imageStartY)
        
        let xPos = 20
        let currentY = imageStartY + 10
        inspection.images.forEach((img, index) => {
          try {
            doc.addImage(
              `data:image/jpeg;base64,${img}`,
              'JPEG',
              xPos,
              currentY,
              40,
              40,
              `img${index}`,
              'MEDIUM'
            )
            xPos += 50
            if (xPos > 150) {
              xPos = 20
              currentY += 50
            }
          } catch (error) {
            console.error('Error adding image to PDF:', error)
          }
        })
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        )
      }

      const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' })
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    }

    generatePDF()
  }, [open, inspection])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-full h-[100dvh] max-w-none p-0 rounded-none m-0' : 'max-w-4xl p-0'}`}>
        <div className="sticky top-0 z-50 bg-background border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Report Preview</h2>
          <div className="flex gap-2">
            <Button
              onClick={onDownload}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size={isMobile ? "sm" : "default"}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
              )}
              {!isMobile && (isGenerating ? "Generating..." : "Download AI Report")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`${isMobile ? 'h-[calc(100dvh-64px)]' : 'h-[80vh]'} bg-muted`}>
          {pdfUrl && (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full"
              style={{
                pointerEvents: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
              title="PDF Preview"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

