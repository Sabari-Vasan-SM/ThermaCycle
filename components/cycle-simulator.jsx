"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, ChevronDown, ChevronUp, Zap } from "lucide-react"
import { calculateRankineCycle, calculateOttoCycle, calculateDieselCycle } from "@/lib/thermodynamics"
import PVDiagram from "@/components/pv-diagram"
import TSDiagram from "@/components/ts-diagram"
import CycleParameters from "@/components/cycle-parameters"
import CycleResults from "@/components/cycle-results"
import { motion } from "framer-motion"
import PistonAnimation from "@/components/piston-animation"
import ExportDialog from "@/components/export-dialog"

export default function CycleSimulator() {
  const [cycleType, setCycleType] = useState("rankine")
  const [parameters, setParameters] = useState({
    rankine: {
      boilerPressure: 8.0, // MPa
      boilerTemperature: 500, // °C
      condenserPressure: 0.008, // MPa
      pumpEfficiency: 0.85,
      turbineEfficiency: 0.87,
    },
    otto: {
      initialPressure: 0.1, // MPa
      initialTemperature: 25, // °C
      compressionRatio: 8,
      heatInput: 1800, // kJ/kg
    },
    diesel: {
      initialPressure: 0.1, // MPa
      initialTemperature: 25, // °C
      compressionRatio: 16,
      cutoffRatio: 2,
      heatInput: 1800, // kJ/kg
    },
  })

  const [cycleData, setCycleData] = useState(null)
  const [activeTab, setActiveTab] = useState("pv")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Calculate cycle data when parameters change
  useEffect(() => {
    calculateCycle()
  }, [cycleType, parameters])

  const calculateCycle = () => {
    setIsCalculating(true)

    // Small delay to show calculation animation
    setTimeout(() => {
      let result

      try {
        switch (cycleType) {
          case "rankine":
            result = calculateRankineCycle(parameters.rankine)
            break
          case "otto":
            result = calculateOttoCycle(parameters.otto)
            break
          case "diesel":
            result = calculateDieselCycle(parameters.diesel)
            break
          default:
            result = null
        }
      } catch (error) {
        console.error("Error calculating cycle:", error)
        result = {
          efficiency: 0,
          workOutput: 0,
          heatInput: 0,
          heatRejected: 0,
          pvData: [],
          tsData: [],
        }
      }

      setCycleData(result)
      setIsCalculating(false)
    }, 500)
  }

  const handleParameterChange = (paramName, value) => {
    setParameters((prev) => ({
      ...prev,
      [cycleType]: {
        ...prev[cycleType],
        [paramName]: value,
      },
    }))
  }

  const handleExport = () => {
    if (!cycleData) return

    // Show export options dialog
    setShowExportDialog(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Cycle Type</h2>
            <div className="grid grid-cols-3 gap-2">
              {["rankine", "otto", "diesel"].map((type) => (
                <Button
                  key={type}
                  variant={cycleType === type ? "default" : "outline"}
                  onClick={() => setCycleType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={cycleType}
          >
            <CycleParameters
              cycleType={cycleType}
              parameters={parameters[cycleType]}
              onChange={handleParameterChange}
              showAdvanced={showAdvanced}
            />
          </motion.div>

          <div className="mt-4">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Advanced Parameters</span>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={calculateCycle} className="flex-1" disabled={isCalculating}>
              {isCalculating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              Calculate
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!cycleData || isCalculating}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="pv">P-V Diagram</TabsTrigger>
              <TabsTrigger value="ts">T-S Diagram</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
            </TabsList>

            <TabsContent value="pv" className="mt-0">
              <div className="h-[300px] md:h-[400px]">
                <PVDiagram cycleData={cycleData} cycleType={cycleType} isCalculating={isCalculating} />
              </div>
            </TabsContent>

            <TabsContent value="ts" className="mt-0">
              <div className="h-[300px] md:h-[400px]">
                <TSDiagram cycleData={cycleData} cycleType={cycleType} isCalculating={isCalculating} />
              </div>
            </TabsContent>

            <TabsContent value="animation" className="mt-0">
              <div className="h-[300px] md:h-[400px]">
                <PistonAnimation cycleData={cycleData} cycleType={cycleType} isCalculating={isCalculating} />
              </div>
            </TabsContent>
          </Tabs>

          {cycleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <CycleResults cycleData={cycleData} cycleType={cycleType} />
            </motion.div>
          )}
        </CardContent>
      </Card>
      {showExportDialog && (
        <ExportDialog
          cycleData={cycleData}
          cycleType={cycleType}
          parameters={parameters[cycleType]}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  )
}
