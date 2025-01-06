import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Inspection } from '../../../lib/types'

export const generatePDF = (inspections: Inspection[], filter: string) => {
  const doc = new jsPDF()

  // Set font
  doc.setFont('helvetica', 'bold')

  // Title
  doc.setFontSize(20)
  doc.text('Tree Inspection Report', 105, 15, { align: 'center' })

  // Summary
  doc.setFontSize(16)
  doc.text('Summary', 20, 30)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`Filter: ${filter === 'all' ? 'All Statuses' : filter}`, 20, 40)
  doc.text(`Total Inspections: ${inspections.length}`, 20, 50)
  doc.text(`Pending: ${inspections.filter(i => i.status === 'Pending').length}`, 20, 60)
  doc.text(`In Progress: ${inspections.filter(i => i.status === 'In-Progress').length}`, 20, 70)
  doc.text(`Completed: ${inspections.filter(i => i.status === 'Completed').length}`, 20, 80)

  // Inspection Details
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Inspection Details', 20, 100)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  inspections.forEach((inspection, index) => {
    if (index > 0) {
      doc.addPage()
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`Inspection #${inspection.id}`, 20, 20)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const details = [
      ['Title', inspection.title],
      ['Status', inspection.status],
      ['Date', new Date(inspection.scheduledDate).toLocaleDateString()],
      ['Location', inspection.location.address],
      ['Inspector', inspection.inspector.name],
      ['Community Board', inspection.communityBoard],
    ]

    // @ts-ignore
    doc.autoTable({
      startY: 30,
      head: [['Field', 'Value']],
      body: details,
    })

    // Add images if available
    if (inspection.images && inspection.images.length > 0) {
      const imageStartY = (doc as any).lastAutoTable.finalY + 10
      doc.text('Inspection Images:', 20, imageStartY)

      inspection.images.forEach((img, imgIndex) => {
        try {
          doc.addImage(
            `data:image/jpeg;base64,${img}`,
            'JPEG',
            20,
            imageStartY + 10 + (imgIndex * 60),
            40,
            40
          )
        } catch (error) {
          console.error('Error adding image to PDF:', error)
        }
      })
    }
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(`Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
  }

  // Save the PDF
  doc.save(`tree-inspections-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

