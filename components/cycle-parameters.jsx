"use client"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

export default function CycleParameters({ cycleType, parameters, onChange, showAdvanced }) {
  // Helper function to handle slider changes
  const handleSliderChange = (name, value) => {
    onChange(name, value[0])
  }

  // Helper function to handle input changes
  const handleInputChange = (name, e) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      onChange(name, value)
    }
  }

  // Parameter configurations for each cycle type
  const paramConfig = {
    rankine: [
      {
        name: "boilerPressure",
        label: "Boiler Pressure (MPa)",
        min: 1,
        max: 20,
        step: 0.1,
        advanced: false,
      },
      {
        name: "boilerTemperature",
        label: "Boiler Temperature (°C)",
        min: 300,
        max: 700,
        step: 5,
        advanced: false,
      },
      {
        name: "condenserPressure",
        label: "Condenser Pressure (MPa)",
        min: 0.001,
        max: 0.1,
        step: 0.001,
        advanced: false,
      },
      {
        name: "pumpEfficiency",
        label: "Pump Efficiency",
        min: 0.5,
        max: 1,
        step: 0.01,
        advanced: true,
      },
      {
        name: "turbineEfficiency",
        label: "Turbine Efficiency",
        min: 0.5,
        max: 1,
        step: 0.01,
        advanced: true,
      },
    ],
    otto: [
      {
        name: "initialPressure",
        label: "Initial Pressure (MPa)",
        min: 0.05,
        max: 0.2,
        step: 0.01,
        advanced: false,
      },
      {
        name: "initialTemperature",
        label: "Initial Temperature (°C)",
        min: 0,
        max: 50,
        step: 1,
        advanced: false,
      },
      {
        name: "compressionRatio",
        label: "Compression Ratio",
        min: 4,
        max: 12,
        step: 0.1,
        advanced: false,
      },
      {
        name: "heatInput",
        label: "Heat Input (kJ/kg)",
        min: 500,
        max: 3000,
        step: 50,
        advanced: true,
      },
    ],
    diesel: [
      {
        name: "initialPressure",
        label: "Initial Pressure (MPa)",
        min: 0.05,
        max: 0.2,
        step: 0.01,
        advanced: false,
      },
      {
        name: "initialTemperature",
        label: "Initial Temperature (°C)",
        min: 0,
        max: 50,
        step: 1,
        advanced: false,
      },
      {
        name: "compressionRatio",
        label: "Compression Ratio",
        min: 12,
        max: 24,
        step: 0.5,
        advanced: false,
      },
      {
        name: "cutoffRatio",
        label: "Cutoff Ratio",
        min: 1.2,
        max: 4,
        step: 0.1,
        advanced: false,
      },
      {
        name: "heatInput",
        label: "Heat Input (kJ/kg)",
        min: 500,
        max: 3000,
        step: 50,
        advanced: true,
      },
    ],
  }

  // Filter parameters based on advanced setting
  const filteredParams = paramConfig[cycleType].filter((param) => (showAdvanced ? true : !param.advanced))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Parameters</h2>

      {filteredParams.map((param) => (
        <div key={param.name} className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor={param.name}>{param.label}</Label>
            <span className="text-sm font-medium">
              {parameters[param.name].toFixed(param.step < 0.1 ? 3 : param.step < 1 ? 2 : 0)}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Slider
                id={param.name}
                min={param.min}
                max={param.max}
                step={param.step}
                value={[parameters[param.name]]}
                onValueChange={(value) => handleSliderChange(param.name, value)}
              />
            </div>
            <Input
              type="number"
              value={parameters[param.name]}
              onChange={(e) => handleInputChange(param.name, e)}
              className="w-20"
              min={param.min}
              max={param.max}
              step={param.step}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
