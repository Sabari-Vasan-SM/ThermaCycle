import CycleSimulator from "@/components/cycle-simulator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">
          Thermodynamic Cycle Simulator
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Simulate and analyze Rankine, Otto, and Diesel cycles with interactive controls
        </p>
        <CycleSimulator />
      </div>
    </main>
  )
}
