// Constants
const R = 0.287 // kJ/kg·K, gas constant for air
const k = 1.4 // specific heat ratio for air
const cv = 0.718 // kJ/kg·K, specific heat at constant volume for air
const cp = 1.005 // kJ/kg·K, specific heat at constant pressure for air

// Rankine Cycle Calculations
export function calculateRankineCycle(params) {
  try {
    const { boilerPressure, boilerTemperature, condenserPressure, pumpEfficiency, turbineEfficiency } = params

    // Convert temperatures to Kelvin
    const T3 = boilerTemperature + 273.15

    // Simplified steam properties (approximations)
    // State 1: Saturated liquid at condenser pressure
    const h1 = 200 // kJ/kg, approximate enthalpy of saturated water at low pressure
    const s1 = 0.6 // kJ/kg·K, approximate entropy of saturated water
    const v1 = 0.001 // m³/kg, specific volume of water

    // State 2: Compressed liquid after pump
    const pumpWork = (v1 * (boilerPressure - condenserPressure) * 1000) / pumpEfficiency
    const h2 = h1 + pumpWork
    const s2 = s1 // Assume incompressible liquid

    // State 3: Superheated steam after boiler
    const h3 = 3400 // kJ/kg, approximate enthalpy of superheated steam
    const s3 = 6.8 // kJ/kg·K, approximate entropy

    // State 4: Wet steam after turbine
    const h4s = h1 + (h3 - h1) * (1 - 0.8) // Isentropic enthalpy drop
    const h4 = h3 - turbineEfficiency * (h3 - h4s)
    const s4 = s3 // Assume isentropic expansion

    // Calculate steam quality at turbine exit
    const steamQuality = 0.85 // Approximate quality

    // Calculate cycle performance
    const heatInput = h3 - h2
    const turbineWork = h3 - h4
    const workOutput = turbineWork - pumpWork
    const heatRejected = h4 - h1
    const efficiency = workOutput / heatInput

    // Generate P-V diagram data points
    const pvData = [
      { x: v1, y: condenserPressure }, // State 1
      { x: v1, y: boilerPressure }, // State 2
      { x: 0.2, y: boilerPressure }, // State 3
      { x: 2.0, y: condenserPressure }, // State 4
      { x: v1, y: condenserPressure }, // Back to State 1
    ]

    // Generate T-S diagram data points
    const tsData = [
      { x: s1, y: 300 }, // State 1
      { x: s2, y: 310 }, // State 2
      { x: s3, y: T3 }, // State 3
      { x: s4, y: 350 }, // State 4
      { x: s1, y: 300 }, // Back to State 1
    ]

    return {
      efficiency,
      workOutput,
      heatInput,
      heatRejected,
      steamQuality,
      pvData,
      tsData,
      maxTemperature: T3,
      maxPressure: boilerPressure,
    }
  } catch (error) {
    console.error("Error in Rankine cycle calculation:", error)
    return {
      efficiency: 0,
      workOutput: 0,
      heatInput: 0,
      heatRejected: 0,
      steamQuality: 0,
      pvData: [],
      tsData: [],
      maxTemperature: 0,
      maxPressure: 0,
    }
  }
}

// Otto Cycle Calculations
export function calculateOttoCycle(params) {
  try {
    const { initialPressure, initialTemperature, compressionRatio, heatInput } = params

    // Convert temperatures to Kelvin
    const T1 = initialTemperature + 273.15

    // State 1: Initial state
    const v1 = (R * T1) / (initialPressure * 1000) // m³/kg
    const p1 = initialPressure // MPa

    // State 2: After compression
    const v2 = v1 / compressionRatio
    const T2 = T1 * Math.pow(compressionRatio, k - 1)
    const p2 = p1 * Math.pow(compressionRatio, k)

    // State 3: After heat addition
    const T3 = T2 + heatInput / cv
    const p3 = p2 * (T3 / T2)
    const v3 = v2

    // State 4: After expansion
    const T4 = T3 / Math.pow(compressionRatio, k - 1)
    const p4 = p3 / Math.pow(compressionRatio, k)
    const v4 = v1

    // Calculate cycle performance
    const heatInput_actual = cv * (T3 - T2)
    const heatRejected = cv * (T4 - T1)
    const workOutput = heatInput_actual - heatRejected
    const efficiency = 1 - 1 / Math.pow(compressionRatio, k - 1)

    // Generate P-V diagram data points
    const pvData = [
      { x: v1, y: p1 }, // State 1
      { x: v2, y: p2 }, // State 2
      { x: v3, y: p3 }, // State 3
      { x: v4, y: p4 }, // State 4
      { x: v1, y: p1 }, // Back to State 1
    ]

    // Generate T-S diagram data points
    const tsData = [
      { x: cv * Math.log(v1 / 0.7), y: T1 }, // State 1
      { x: cv * Math.log(v2 / 0.7), y: T2 }, // State 2
      { x: cv * Math.log(v3 / 0.7), y: T3 }, // State 3
      { x: cv * Math.log(v4 / 0.7), y: T4 }, // State 4
      { x: cv * Math.log(v1 / 0.7), y: T1 }, // Back to State 1
    ]

    return {
      efficiency,
      workOutput,
      heatInput: heatInput_actual,
      heatRejected,
      maxTemperature: T3,
      maxPressure: p3,
      pvData,
      tsData,
      steamQuality: 0, // Include for consistency
    }
  } catch (error) {
    console.error("Error in Otto cycle calculation:", error)
    return {
      efficiency: 0,
      workOutput: 0,
      heatInput: 0,
      heatRejected: 0,
      maxTemperature: 0,
      maxPressure: 0,
      pvData: [],
      tsData: [],
      steamQuality: 0,
    }
  }
}

// Diesel Cycle Calculations
export function calculateDieselCycle(params) {
  try {
    const { initialPressure, initialTemperature, compressionRatio, cutoffRatio, heatInput } = params

    // Convert temperatures to Kelvin
    const T1 = initialTemperature + 273.15

    // State 1: Initial state
    const v1 = (R * T1) / (initialPressure * 1000) // m³/kg
    const p1 = initialPressure // MPa

    // State 2: After compression
    const v2 = v1 / compressionRatio
    const T2 = T1 * Math.pow(compressionRatio, k - 1)
    const p2 = p1 * Math.pow(compressionRatio, k)

    // State 3: After constant pressure heat addition
    const v3 = v2 * cutoffRatio
    const T3 = T2 * cutoffRatio
    const p3 = p2

    // State 4: After expansion
    const T4 = T3 * Math.pow(v3 / v1, 1 - k)
    const p4 = p3 * Math.pow(v3 / v1, -k)
    const v4 = v1

    // Calculate cycle performance
    const heatInput_actual = cp * (T3 - T2)
    const heatRejected = cv * (T4 - T1)
    const workOutput = heatInput_actual - heatRejected
    const efficiency = 1 - (1 / Math.pow(compressionRatio, k - 1)) * ((cutoffRatio ** k - 1) / (k * (cutoffRatio - 1)))

    // Generate P-V diagram data points
    const pvData = [
      { x: v1, y: p1 }, // State 1
      { x: v2, y: p2 }, // State 2
      { x: v3, y: p3 }, // State 3
      { x: v4, y: p4 }, // State 4
      { x: v1, y: p1 }, // Back to State 1
    ]

    // Generate T-S diagram data points
    const tsData = [
      { x: cv * Math.log(v1 / 0.7), y: T1 }, // State 1
      { x: cv * Math.log(v2 / 0.7), y: T2 }, // State 2
      { x: cp * Math.log(v3 / v2) + cv * Math.log(v2 / 0.7), y: T3 }, // State 3
      { x: cv * Math.log(v4 / 0.7), y: T4 }, // State 4
      { x: cv * Math.log(v1 / 0.7), y: T1 }, // Back to State 1
    ]

    return {
      efficiency,
      workOutput,
      heatInput: heatInput_actual,
      heatRejected,
      maxTemperature: T3,
      maxPressure: p3,
      pvData,
      tsData,
      steamQuality: 0, // Include for consistency
    }
  } catch (error) {
    console.error("Error in Diesel cycle calculation:", error)
    return {
      efficiency: 0,
      workOutput: 0,
      heatInput: 0,
      heatRejected: 0,
      maxTemperature: 0,
      maxPressure: 0,
      pvData: [],
      tsData: [],
      steamQuality: 0,
    }
  }
}
