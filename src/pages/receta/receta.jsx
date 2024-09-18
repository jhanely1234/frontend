'use client'

import React, { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function Prescription() {
  const [pdfSrc, setPdfSrc] = useState(null)
  const prescriptionRef = useRef(null)
  const iframeRef = useRef(null)

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Add watermark
    doc.setTextColor(200, 200, 200)
    doc.setFontSize(60)
    doc.text('MEDICONSULTA', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    })

    // Reset text color for content
    doc.setTextColor(0, 0, 0)

    // Header
    doc.setFontSize(22)
    doc.text('MEDICONSULTA', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(16)
    doc.text('Centro de Salud', pageWidth / 2, 30, { align: 'center' })
    doc.setFontSize(12)
    doc.text('Dirección: Calle Principal #123, Ciudad', pageWidth / 2, 40, { align: 'center' })
    doc.text('Teléfono: (123) 456-7890', pageWidth / 2, 45, { align: 'center' })

    // Patient Information
    doc.setFontSize(14)
    doc.text('Fecha: 15/9/2024', 20, 60)
    doc.text('Paciente: ________________________', 20, 70)
    doc.text('Edad: ______   Sexo: ______', 20, 80)

    // Prescription
    doc.setFontSize(16)
    doc.text('Receta', 20, 100)
    doc.setFontSize(14)
    doc.text('Rp.', 20, 110)
    doc.line(20, 120, pageWidth - 20, 120)
    doc.line(20, 130, pageWidth - 20, 130)
    doc.line(20, 140, pageWidth - 20, 140)

    // Instructions
    doc.text('Indicaciones:', 20, 160)
    doc.line(20, 170, pageWidth - 20, 170)
    doc.line(20, 180, pageWidth - 20, 180)

    // Signature
    doc.text('Firma del médico', pageWidth / 2, 220, { align: 'center' })
    doc.line(pageWidth / 2 - 30, 218, pageWidth / 2 + 30, 218)
    doc.text('Cédula Profesional: __________', pageWidth / 2, 230, { align: 'center' })

    // Generate PDF and update preview
    const pdfDataUri = doc.output('datauristring')
    setPdfSrc(pdfDataUri)
  }

  const handleDownloadPDF = () => {
    if (pdfSrc) {
      const link = document.createElement('a')
      link.href = pdfSrc
      link.download = 'receta_mediconsulta.pdf'
      link.click()
    }
  }

  const handleDownloadJPG = () => {
    if (prescriptionRef.current) {
      html2canvas(prescriptionRef.current).then(canvas => {
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/jpeg')
        link.download = 'receta_mediconsulta.jpg'
        link.click()
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div ref={prescriptionRef} className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">MEDICONSULTA</h1>
                  <p className="text-lg">Centro de Salud</p>
                  <p className="text-sm">Dirección: Calle Principal #123, Ciudad</p>
                  <p className="text-sm">Teléfono: (123) 456-7890</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-semibold">Fecha:</span> 15/9/2024</p>
                  <p><span className="font-semibold">Paciente:</span> ________________________</p>
                  <div className="flex space-x-4">
                    <p><span className="font-semibold">Edad:</span> ______</p>
                    <p><span className="font-semibold">Sexo:</span> ______</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Receta</h2>
                  <p className="font-semibold">Rp.</p>
                  <div className="space-y-4">
                    <div className="border-b border-gray-300 h-6"></div>
                    <div className="border-b border-gray-300 h-6"></div>
                    <div className="border-b border-gray-300 h-6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Indicaciones:</h2>
                  <div className="space-y-4">
                    <div className="border-b border-gray-300 h-6"></div>
                    <div className="border-b border-gray-300 h-6"></div>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="border-t border-gray-300 w-64 mx-auto pt-2">
                    <p>Firma del médico</p>
                  </div>
                  <p className="mt-2"><span className="font-semibold">Cédula Profesional:</span> __________</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <p className="text-8xl font-bold text-gray-300 transform -rotate-45">MEDICONSULTA</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300"
          >
            Generar Vista Previa
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors duration-300"
          >
            Descargar PDF
          </button>
          <button
            onClick={handleDownloadJPG}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition-colors duration-300"
          >
            Descargar JPG
          </button>
        </div>
      </div>
      {pdfSrc && (
        <div className="mt-8 max-w-3xl mx-auto">
          <iframe
            ref={iframeRef}
            src={pdfSrc}
            className="w-full h-[600px] border border-gray-300 rounded"
          />
        </div>
      )}
    </div>
  )
}