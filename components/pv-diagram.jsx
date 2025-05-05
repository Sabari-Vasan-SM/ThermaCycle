"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { Loader2 } from "lucide-react"

export default function PVDiagram({ cycleData, cycleType, isCalculating }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    if (!cycleData || isCalculating) return

    const ctx = chartRef.current.getContext("2d")

    // Create chart based on cycle type and data
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: `${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)} Cycle`,
            data: cycleData.pvData,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: "#3b82f6",
            fill: true,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        scales: {
          x: {
            type: "linear",
            title: {
              display: true,
              text: "Volume (m³/kg)",
              font: {
                size: 14,
              },
            },
            beginAtZero: true,
          },
          y: {
            type: "linear",
            title: {
              display: true,
              text: "Pressure (MPa)",
              font: {
                size: 14,
              },
            },
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = context.raw
                return `P: ${point.y.toFixed(3)} MPa, V: ${point.x.toFixed(4)} m³/kg`
              },
            },
          },
          legend: {
            position: "top",
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [cycleData, cycleType, isCalculating])

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
        Adjust parameters and calculate to view P-V diagram
      </div>
    )
  }

  return (
    <div className="h-full">
      <canvas ref={chartRef} />
    </div>
  )
}
