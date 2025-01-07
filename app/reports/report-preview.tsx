'use client'

import { Dialog, DialogContent } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { X, Download, Loader2 } from 'lucide-react'
import type { Inspection } from "../../lib/types"
import { useEffect, useRef, useState } from "react"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { useToast } from "../../components/ui/use-toast"
import axios from 'axios'

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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function ReportPreview({ inspection, open, onOpenChange, onDownload }: ReportPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiContent, setAiContent] = useState<AIReportContent | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const formatAIContent = (content: string): string[] => {
    const lines = content.split('\n')
    return lines.map(line => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return line.slice(2, -2) // Remove ** from start and end
      }
      if (line.match(/^\d+\./)) {
        return `• ${line.split('. ')[1]}` // Convert numbered list to bullet points
      }
      return line
    })
  }

  const generateAIReport = async () => {
    setIsGenerating(true);
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const response = await axios.post('https://gemini-fastapi-1.onrender.com/generate_report_content', {
          description: inspection.details
        }, {
          timeout: 10000, // 10 seconds timeout
        });

        // Log the response for debugging
        console.log('Response received from Gemini API:', response.data);

        const data = response.data;
        // Extract and format the required fields from the response
        const aiContent: AIReportContent = {
          summary: formatAIContent(data.summary || '').join('\n'),
          observations: formatAIContent(data.observations || '').join('\n'),
          recommendations: formatAIContent(data.recommendations || '').join('\n'),
        };
        setAiContent(aiContent);
        return aiContent;
      } catch (error) {
        console.error(`Error generating AI report (attempt ${retries + 1}):`, error);

        if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
          if (retries === MAX_RETRIES - 1) {
            toast({
              title: "Network Error",
              description: "Unable to connect to the AI service after multiple attempts. Please try again later.",
              variant: "destructive",
            });
            throw new Error('Network error: Unable to connect to the AI service after multiple attempts.');
          }
          await wait(RETRY_DELAY * (retries + 1)); // Exponential backoff
          retries++;
        } else {
          toast({
            title: "Error",
            description: "Failed to generate AI report. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      } finally {
        setIsGenerating(false);
      }
    }

    throw new Error('Max retries reached. Unable to generate AI report.');
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
      if (aiReport) {
        const aiStartY = yPos + splitDetails.length * 10 + 30;
        
        // AI Summary
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.text('AI Analysis', 20, aiStartY)
        
        const addFormattedSection = (title: string, content: string, startY: number) => {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(14)
          doc.text(title, 20, startY)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(12)
          
          let currentY = startY + 10
          const lines = content.split('\n')
          lines.forEach(line => {
            if (line.startsWith('•')) {
              doc.text('•', 25, currentY)
              const bulletText = doc.splitTextToSize(line.slice(2), 160)
              doc.text(bulletText, 30, currentY)
              currentY += bulletText.length * 7
            } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
              doc.setFont('helvetica', 'bold')
              const boldText = doc.splitTextToSize(line.slice(2, -2), 170)
              doc.text(boldText, 20, currentY)
              doc.setFont('helvetica', 'normal')
              currentY += boldText.length * 7
            } else {
              const normalText = doc.splitTextToSize(line, 170)
              doc.text(normalText, 20, currentY)
              currentY += normalText.length * 7
            }
            currentY += 3 // Add some space between lines
          })
          return currentY
        }

        let currentY = aiStartY + 20
        currentY = addFormattedSection('Summary', aiReport.summary, currentY)
        currentY = addFormattedSection('Observations', aiReport.observations, currentY + 10)
        addFormattedSection('Recommendations', aiReport.recommendations, currentY + 10)
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

