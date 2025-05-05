"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, Thermometer, ArrowDownUp, BarChart3, Droplets } from "lucide-react"

export default function CycleResults({ cycleData, cycleType }) {
  if (!cycleData) return null

  // Add default values with null coalescing to prevent undefined errors
  const {
    efficiency = 0,
    workOutput = 0,
    heatInput = 0,
    heatRejected = 0,
    steamQuality = 0,
    maxTemperature = 0,
    maxPressure = 0,
  } = cycleData

  // Define metrics based on cycle type
  const metrics = [
    {
      name: "Thermal Efficiency",
      value: `${((efficiency || 0) * 100).toFixed(2)}%`,
      icon: <Zap className="h-4 w-4" />,
      color: "text-yellow-500",
    },
    {
      name: "Work Output",
      value: `${(workOutput || 0).toFixed(2)} kJ/kg`,
      icon: <ArrowDownUp className="h-4 w-4" />,
      color: "text-blue-500",
    },
    {
      name: "Heat Input",
      value: `${(heatInput || 0).toFixed(2)} kJ/kg`,
      icon: <Thermometer className="h-4 w-4" />,
      color: "text-red-500",
    },
    {
      name: "Heat Rejected",
      value: `${(heatRejected || 0).toFixed(2)} kJ/kg`,
      icon: <Droplets className="h-4 w-4" />,
      color: "text-blue-400",
    },
  ]

  // Add cycle-specific metrics
  if (cycleType === "rankine" && steamQuality !== undefined) {
    metrics.push({
      name: "Steam Quality",
      value: `${(steamQuality * 100).toFixed(2)}%`,
      icon: <BarChart3 className="h-4 w-4" />,
      color: "text-purple-500",
    })
  } else if ((cycleType === "otto" || cycleType === "diesel") && maxTemperature !== undefined) {
    metrics.push({
      name: "Max Temperature",
      value: `${maxTemperature.toFixed(1)} K`,
      icon: <Thermometer className="h-4 w-4" />,
      color: "text-orange-500",
    })

    if (maxPressure !== undefined) {
      metrics.push({
        name: "Max Pressure",
        value: `${maxPressure.toFixed(2)} MPa`,
        icon: <BarChart3 className="h-4 w-4" />,
        color: "text-indigo-500",
      })
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Results</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className={`${metric.color}`}>{metric.icon}</div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</span>
              </div>
              <p className="text-lg font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
