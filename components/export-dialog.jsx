"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, FileText, Download, ImageIcon } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export default function ExportDialog({ cycleData, cycleType, parameters, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("pdf")
  const pvCanvasRef = useRef(null)
  const tsCanvasRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    // Generate preview canvases for the diagrams
    if (cycleData) {
      generateDiagramCanvases()
    }

    return () => {
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [cycleData])

  const generateDiagramCanvases = async () => {
    try {
      // Find the diagram elements in the DOM
      const pvDiagramElement = document.querySelector('[data-value="pv"] canvas')
      const tsDiagramElement = document.querySelector('[data-value="ts"] canvas')

      if (pvDiagramElement) {
        const pvCanvas = await html2canvas(pvDiagramElement)
        pvCanvasRef.current = pvCanvas
      }

      if (tsDiagramElement) {
        const tsCanvas = await html2canvas(tsDiagramElement)
        tsCanvasRef.current = tsCanvas
      }
    } catch (error) {
      console.error("Error generating diagram canvases:", error)
    }
  }

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Add title
      pdf.setFontSize(20)
      pdf.text(`${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)} Cycle Analysis`, 105, 20, { align: "center" })
      pdf.setFontSize(12)
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })

      // Add parameters section
      pdf.setFontSize(16)
      pdf.text("Input Parameters", 20, 45)
      pdf.setFontSize(10)

      let yPos = 55
      Object.entries(parameters).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

        let displayValue = value
        if (typeof value === "number") {
          // Format number with appropriate precision
          displayValue = value < 0.01 ? value.toFixed(4) : value.toFixed(2)
        }

        pdf.text(`${formattedKey}: ${displayValue}`, 25, yPos)
        yPos += 7
      })

      // Add results section
      pdf.setFontSize(16)
      pdf.text("Results", 20, yPos + 10)
      pdf.setFontSize(10)

      yPos += 20
      const results = [
        { name: "Thermal Efficiency", value: `${(cycleData.efficiency * 100).toFixed(2)}%` },
        { name: "Work Output", value: `${cycleData.workOutput.toFixed(2)} kJ/kg` },
        { name: "Heat Input", value: `${cycleData.heatInput.toFixed(2)} kJ/kg` },
        { name: "Heat Rejected", value: `${cycleData.heatRejected.toFixed(2)} kJ/kg` },
      ]

      if (cycleType === "rankine" && cycleData.steamQuality !== undefined) {
        results.push({ name: "Steam Quality", value: `${(cycleData.steamQuality * 100).toFixed(2)}%` })
      } else if ((cycleType === "otto" || cycleType === "diesel") && cycleData.maxTemperature !== undefined) {
        results.push({ name: "Max Temperature", value: `${cycleData.maxTemperature.toFixed(1)} K` })

        if (cycleData.maxPressure !== undefined) {
          results.push({ name: "Max Pressure", value: `${cycleData.maxPressure.toFixed(2)} MPa` })
        }
      }

      results.forEach((result) => {
        pdf.text(`${result.name}: ${result.value}`, 25, yPos)
        yPos += 7
      })

      // Add diagrams
      if (pvCanvasRef.current) {
        pdf.addPage()
        pdf.setFontSize(16)
        pdf.text("P-V Diagram", 105, 20, { align: "center" })

        // Add P-V diagram
        const pvImgData = pvCanvasRef.current.toDataURL("image/png")
        pdf.addImage(pvImgData, "PNG", 20, 30, 170, 100)

        // Add T-S diagram on the same page
        if (tsCanvasRef.current) {
          pdf.setFontSize(16)
          pdf.text("T-S Diagram", 105, 140, { align: "center" })
          const tsImgData = tsCanvasRef.current.toDataURL("image/png")
          pdf.addImage(tsImgData, "PNG", 20, 150, 170, 100)
        }

        // Generate PDF blob and create download link
        const pdfBlob = pdf.output("blob")
        const pdfUrl = URL.createObjectURL(pdfBlob)
        setPreviewUrl(pdfUrl)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (previewUrl) {
      const link = document.createElement("a")
      link.href = previewUrl
      link.download = `${cycleType}-cycle-analysis.pdf`
      link.click()
    } else {
      generatePDF()
    }
  }

  const handleDownloadJSON = () => {
    if (!cycleData) return

    const dataObj = {
      cycleType,
      parameters,
      results: cycleData,
    }

    const dataStr = JSON.stringify(dataObj, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const link = document.createElement("a")
    link.href = dataUri
    link.download = `${cycleType}-cycle-data.json`
    link.click()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Cycle Data</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="pdf">PDF Report</TabsTrigger>
            <TabsTrigger value="json">Raw Data (JSON)</TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="min-h-[300px]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p>Generating PDF report...</p>
              </div>
            ) : previewUrl ? (
              <div className="flex flex-col items-center">
                <div className="border rounded-md overflow-hidden mb-4 max-h-[400px]">
                  <iframe src={previewUrl} className="w-full h-[400px]" />
                </div>
                <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-center mb-6">
                  Generate a comprehensive PDF report with cycle parameters, results, and diagrams.
                </p>
                <Button onClick={generatePDF} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generate PDF Report
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="json" className="min-h-[300px]">
            <div className="flex flex-col items-center justify-center h-[300px]">
              <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-center mb-6">
                Export raw cycle data in JSON format for further analysis or processing.
              </p>
              <Button onClick={handleDownloadJSON} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download JSON Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
