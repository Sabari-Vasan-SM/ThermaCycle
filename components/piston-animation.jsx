"use client"

import { useRef, useEffect, useState } from "react"
import { Loader2, Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export default function PistonAnimation({ cycleData, cycleType, isCalculating }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)

  // Animation state
  const stateRef = useRef({
    progress: 0,
    speed: 1,
    lastTimestamp: 0,
  })

  useEffect(() => {
    if (!cycleData || isCalculating) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Set canvas dimensions with higher resolution for retina displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Reset animation
    setAnimationProgress(0)
    stateRef.current.progress = 0

    // Draw initial state
    drawPistonCylinder(ctx, rect.width, rect.height, 0, cycleType, cycleData)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [cycleData, cycleType, isCalculating])

  useEffect(() => {
    stateRef.current.speed = animationSpeed
  }, [animationSpeed])

  useEffect(() => {
    if (isPlaying) {
      stateRef.current.lastTimestamp = performance.now()
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const animate = (timestamp) => {
    if (!canvasRef.current) return

    const deltaTime = timestamp - stateRef.current.lastTimestamp
    stateRef.current.lastTimestamp = timestamp

    // Update progress based on speed
    stateRef.current.progress += (deltaTime / 5000) * stateRef.current.speed

    // Loop the animation
    if (stateRef.current.progress > 1) {
      stateRef.current.progress = stateRef.current.progress % 1
    }

    setAnimationProgress(stateRef.current.progress)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)
    drawPistonCylinder(ctx, rect.width, rect.height, stateRef.current.progress, cycleType, cycleData)

    animationRef.current = requestAnimationFrame(animate)
  }

  const handleSliderChange = (value) => {
    const progress = value[0] / 100
    setAnimationProgress(progress)
    stateRef.current.progress = progress

    if (!isPlaying && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      const rect = canvas.getBoundingClientRect()

      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)
      drawPistonCylinder(ctx, rect.width, rect.height, progress, cycleType, cycleData)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setAnimationProgress(0)
    stateRef.current.progress = 0

    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      const rect = canvas.getBoundingClientRect()

      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)
      drawPistonCylinder(ctx, rect.width, rect.height, 0, cycleType, cycleData)
    }
  }

  if (isCalculating) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Calculating...</span>
      </div>
    )
  }

  if (!cycleData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Adjust parameters and calculate to view animation
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" style={{ touchAction: "none" }} />

        <div className="absolute top-2 left-2 text-sm font-medium bg-white/80 dark:bg-black/80 px-2 py-1 rounded-md">
          {getCycleStage(animationProgress, cycleType)}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={resetAnimation}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 px-4">
            <Slider value={[animationProgress * 100]} onValueChange={handleSliderChange} max={100} step={1} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <Slider
              value={[animationSpeed]}
              onValueChange={(value) => setAnimationSpeed(value[0])}
              min={0.5}
              max={3}
              step={0.5}
              className="w-24"
            />
            <span className="text-sm w-6">{animationSpeed}x</span>
          </div>
        </div>

        <div className="text-sm text-center text-gray-500">
          {cycleType === "rankine"
            ? "Note: Rankine cycle animation is simplified as it uses a turbine, not a piston-cylinder."
            : "Drag the slider to see different stages of the cycle."}
        </div>
      </div>
    </div>
  )
}

// Helper function to draw the piston-cylinder
function drawPistonCylinder(ctx, width, height, progress, cycleType, cycleData) {
  // Set dimensions
  const margin = 40
  const cylinderWidth = Math.min(width * 0.6, 200)
  const cylinderHeight = height - margin * 2
  const cylinderX = (width - cylinderWidth) / 2
  const cylinderY = margin

  // Calculate piston position based on cycle type and progress
  let pistonPosition, compression, expansion

  if (cycleType === "otto" || cycleType === "diesel") {
    const compressionRatio =
      cycleType === "otto"
        ? cycleData.pvData[1].x / cycleData.pvData[0].x
        : cycleData.pvData[1].x / cycleData.pvData[0].x

    // Normalize to animation
    compression = 0.25
    expansion = cycleType === "otto" ? 0.75 : 0.85

    if (progress < compression) {
      // Compression stroke (0 to 0.25)
      const normalizedProgress = progress / compression
      pistonPosition = cylinderHeight * (1 - normalizedProgress * (1 - 1 / compressionRatio))
    } else if (progress < 0.5) {
      // Combustion/Power (0.25 to 0.5)
      pistonPosition = cylinderHeight / compressionRatio
    } else if (progress < expansion) {
      // Expansion stroke (0.5 to 0.75/0.85)
      const normalizedProgress = (progress - 0.5) / (expansion - 0.5)
      pistonPosition =
        cylinderHeight / compressionRatio + normalizedProgress * (cylinderHeight - cylinderHeight / compressionRatio)
    } else {
      // Exhaust stroke (0.75/0.85 to 1)
      const normalizedProgress = (progress - expansion) / (1 - expansion)
      pistonPosition = cylinderHeight - normalizedProgress * (cylinderHeight - cylinderHeight / compressionRatio)
    }
  } else {
    // Rankine cycle - simplified animation
    if (progress < 0.25) {
      // Pump compression
      pistonPosition = cylinderHeight * (0.8 - progress * 0.6)
    } else if (progress < 0.5) {
      // Boiler heating
      pistonPosition = cylinderHeight * 0.65
    } else if (progress < 0.75) {
      // Turbine expansion
      const normalizedProgress = (progress - 0.5) / 0.25
      pistonPosition = cylinderHeight * (0.65 + normalizedProgress * 0.25)
    } else {
      // Condenser cooling
      const normalizedProgress = (progress - 0.75) / 0.25
      pistonPosition = cylinderHeight * (0.9 - normalizedProgress * 0.1)
    }
  }

  // Draw cylinder
  ctx.lineWidth = 3
  ctx.strokeStyle = "#555"
  ctx.fillStyle = "#f0f0f0"
  ctx.beginPath()
  ctx.rect(cylinderX, cylinderY, cylinderWidth, cylinderHeight)
  ctx.fill()
  ctx.stroke()

  // Draw piston
  ctx.fillStyle = "#888"
  ctx.beginPath()
  ctx.rect(cylinderX, cylinderY + pistonPosition - 20, cylinderWidth, 20)
  ctx.fill()
  ctx.stroke()

  // Draw piston rod
  ctx.lineWidth = 8
  ctx.strokeStyle = "#666"
  ctx.beginPath()
  ctx.moveTo(cylinderX + cylinderWidth / 2, cylinderY + pistonPosition)
  ctx.lineTo(cylinderX + cylinderWidth / 2, cylinderY + cylinderHeight + 30)
  ctx.stroke()

  // Draw crank and connecting rod if not Rankine
  if (cycleType !== "rankine") {
    const crankRadius = 25
    const crankCenterX = cylinderX + cylinderWidth / 2
    const crankCenterY = cylinderY + cylinderHeight + 60

    // Draw crank circle
    ctx.lineWidth = 2
    ctx.fillStyle = "#ddd"
    ctx.beginPath()
    ctx.arc(crankCenterX, crankCenterY, crankRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Draw crank arm
    const crankAngle = progress * Math.PI * 2
    const crankPinX = crankCenterX + Math.sin(crankAngle) * crankRadius
    const crankPinY = crankCenterY - Math.cos(crankAngle) * crankRadius

    ctx.lineWidth = 6
    ctx.strokeStyle = "#777"
    ctx.beginPath()
    ctx.moveTo(crankCenterX, crankCenterY)
    ctx.lineTo(crankPinX, crankPinY)
    ctx.stroke()

    // Draw connecting rod
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(cylinderX + cylinderWidth / 2, cylinderY + pistonPosition)
    ctx.lineTo(crankPinX, crankPinY)
    ctx.stroke()

    // Draw crank pin
    ctx.fillStyle = "#555"
    ctx.beginPath()
    ctx.arc(crankPinX, crankPinY, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw gas inside cylinder with color based on temperature
  let gasColor
  if (progress < 0.25) {
    // Compression - getting hotter
    const t = progress / 0.25
    gasColor = interpolateColor("#ccccff", "#ff6666", t)
  } else if (progress < 0.5) {
    // Combustion/heat addition - hot
    gasColor = "#ff3333"
  } else if (progress < 0.75) {
    // Expansion - cooling down
    const t = (progress - 0.5) / 0.25
    gasColor = interpolateColor("#ff3333", "#ccccff", t)
  } else {
    // Exhaust/intake - cool
    gasColor = "#ccccff"
  }

  // Fill the cylinder with gas
  ctx.fillStyle = gasColor
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.rect(cylinderX, cylinderY, cylinderWidth, pistonPosition)
  ctx.fill()
  ctx.globalAlpha = 1.0

  // Draw pressure indicator
  const pressureHeight = 100
  const pressureWidth = 20
  const pressureX = cylinderX - 60
  const pressureY = cylinderY + 20

  // Get normalized pressure from cycle data
  let normalizedPressure
  if (cycleData && cycleData.pvData && cycleData.pvData.length > 0) {
    const pressures = cycleData.pvData.map((point) => point.y)
    const maxPressure = Math.max(...pressures)
    const minPressure = Math.min(...pressures)

    // Interpolate pressure based on progress
    let currentPressure
    if (progress < 0.25) {
      // 0 to 1 (compression)
      currentPressure = interpolate(pressures[0], pressures[1], progress * 4)
    } else if (progress < 0.5) {
      // 1 to 2 (heat addition)
      currentPressure = interpolate(pressures[1], pressures[2], (progress - 0.25) * 4)
    } else if (progress < 0.75) {
      // 2 to 3 (expansion)
      currentPressure = interpolate(pressures[2], pressures[3], (progress - 0.5) * 4)
    } else {
      // 3 to 0 (exhaust/intake)
      currentPressure = interpolate(pressures[3], pressures[0], (progress - 0.75) * 4)
    }

    normalizedPressure = (currentPressure - minPressure) / (maxPressure - minPressure)
  } else {
    normalizedPressure = 0.5
  }

  // Draw pressure gauge
  ctx.lineWidth = 2
  ctx.strokeStyle = "#555"
  ctx.fillStyle = "#eee"
  ctx.beginPath()
  ctx.rect(pressureX, pressureY, pressureWidth, pressureHeight)
  ctx.fill()
  ctx.stroke()

  // Draw pressure level
  const pressureLevel = pressureHeight * (1 - normalizedPressure)
  ctx.fillStyle = "#ff6666"
  ctx.beginPath()
  ctx.rect(pressureX, pressureY + pressureLevel, pressureWidth, pressureHeight - pressureLevel)
  ctx.fill()

  // Draw pressure markings
  for (let i = 0; i <= 5; i++) {
    const y = pressureY + (pressureHeight * i) / 5
    ctx.beginPath()
    ctx.moveTo(pressureX - 5, y)
    ctx.lineTo(pressureX, y)
    ctx.stroke()
  }

  // Draw pressure label
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Pressure", pressureX + pressureWidth / 2, pressureY - 10)

  // Draw temperature indicator
  const tempHeight = 100
  const tempWidth = 20
  const tempX = cylinderX + cylinderWidth + 40
  const tempY = cylinderY + 20

  // Get normalized temperature
  let normalizedTemp
  if (cycleData && cycleData.tsData && cycleData.tsData.length > 0) {
    const temps = cycleData.tsData.map((point) => point.y)
    const maxTemp = Math.max(...temps)
    const minTemp = Math.min(...temps)

    // Interpolate temperature based on progress
    let currentTemp
    if (progress < 0.25) {
      // 0 to 1 (compression)
      currentTemp = interpolate(temps[0], temps[1], progress * 4)
    } else if (progress < 0.5) {
      // 1 to 2 (heat addition)
      currentTemp = interpolate(temps[1], temps[2], (progress - 0.25) * 4)
    } else if (progress < 0.75) {
      // 2 to 3 (expansion)
      currentTemp = interpolate(temps[2], temps[3], (progress - 0.5) * 4)
    } else {
      // 3 to 0 (exhaust/intake)
      currentTemp = interpolate(temps[3], temps[0], (progress - 0.75) * 4)
    }

    normalizedTemp = (currentTemp - minTemp) / (maxTemp - minTemp)
  } else {
    normalizedTemp = 0.5
  }

  // Draw temperature gauge
  ctx.lineWidth = 2
  ctx.strokeStyle = "#555"
  ctx.fillStyle = "#eee"
  ctx.beginPath()
  ctx.rect(tempX, tempY, tempWidth, tempHeight)
  ctx.fill()
  ctx.stroke()

  // Draw temperature level
  const tempLevel = tempHeight * (1 - normalizedTemp)
  ctx.fillStyle = "#ff6666"
  ctx.beginPath()
  ctx.rect(tempX, tempY + tempLevel, tempWidth, tempHeight - tempLevel)
  ctx.fill()

  // Draw temperature markings
  for (let i = 0; i <= 5; i++) {
    const y = tempY + (tempHeight * i) / 5
    ctx.beginPath()
    ctx.moveTo(tempX + tempWidth, y)
    ctx.lineTo(tempX + tempWidth + 5, y)
    ctx.stroke()
  }

  // Draw temperature label
  ctx.fillStyle = "#000"
  ctx.font = "12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Temperature", tempX + tempWidth / 2, tempY - 10)
}

// Helper function to get the current stage of the cycle
function getCycleStage(progress, cycleType) {
  if (cycleType === "otto") {
    if (progress < 0.25) return "Compression Stroke"
    if (progress < 0.5) return "Combustion (Constant Volume)"
    if (progress < 0.75) return "Power Stroke"
    return "Exhaust/Intake Stroke"
  } else if (cycleType === "diesel") {
    if (progress < 0.25) return "Compression Stroke"
    if (progress < 0.5) return "Combustion (Constant Pressure)"
    if (progress < 0.85) return "Power Stroke"
    return "Exhaust/Intake Stroke"
  } else {
    // Rankine
    if (progress < 0.25) return "Pump (Compression)"
    if (progress < 0.5) return "Boiler (Heat Addition)"
    if (progress < 0.75) return "Turbine (Expansion)"
    return "Condenser (Heat Rejection)"
  }
}

// Helper function to interpolate between two values
function interpolate(a, b, t) {
  return a + (b - a) * t
}

// Helper function to interpolate between two colors
function interpolateColor(color1, color2, factor) {
  const result = color1.replace(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, (m, r, g, b) => {
    const r1 = Number.parseInt(r, 16)
    const g1 = Number.parseInt(g, 16)
    const b1 = Number.parseInt(b, 16)

    const r2 = Number.parseInt(color2.substr(1, 2), 16)
    const g2 = Number.parseInt(color2.substr(3, 2), 16)
    const b2 = Number.parseInt(color2.substr(5, 2), 16)

    const r3 = Math.round(r1 + factor * (r2 - r1))
    const g3 = Math.round(g1 + factor * (g2 - g1))
    const b3 = Math.round(b1 + factor * (b2 - b1))

    return `#${r3.toString(16).padStart(2, "0")}${g3.toString(16).padStart(2, "0")}${b3.toString(16).padStart(2, "0")}`
  })

  return result
}
