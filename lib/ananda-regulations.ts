export type RegulationOption = { id: string; label: string; speedLimitKmh: number | null; ratedPowerW: number | null; note: string }

export const sellMarkets = ['European Union', 'North America', 'United Kingdom', 'Japan', 'Australia / New Zealand', 'China', 'Other'] as const

export const regulationsByMarket: Record<string, RegulationOption[]> = {
  'European Union': [
    { id: 'en15194', label: 'EN 15194', speedLimitKmh: 25, ratedPowerW: 250, note: 'EPAC bicycle: assistance cuts off at 25 km/h.' },
    { id: 'speed-pedelec', label: 'Speed pedelec / L1e-B', speedLimitKmh: 45, ratedPowerW: null, note: 'Requires separate vehicle type approval in most markets.' },
  ],
  'North America': [
    { id: 'class-1', label: 'Class 1', speedLimitKmh: 32, ratedPowerW: 750, note: 'Pedal assist only; limits vary by state or province.' },
    { id: 'class-2', label: 'Class 2', speedLimitKmh: 32, ratedPowerW: 750, note: 'Throttle-enabled class; confirm local access rules.' },
    { id: 'class-3', label: 'Class 3', speedLimitKmh: 45, ratedPowerW: 750, note: 'Speed-pedelec-style class with local restrictions.' },
    { id: 'na-other', label: 'Other', speedLimitKmh: null, ratedPowerW: null, note: 'Enter the applicable speed and rated-power limits manually.' },
  ],
  'United Kingdom': [{ id: 'uk-epac', label: 'UK EPAC', speedLimitKmh: 25, ratedPowerW: 250, note: 'UK electrically assisted pedal cycle limits.' }],
  Japan: [{ id: 'jp-pas', label: 'Japan PAS', speedLimitKmh: 24, ratedPowerW: null, note: 'Assist-ratio rules apply; validate the final application.' }],
  'Australia / New Zealand': [{ id: 'au-nz', label: 'AU / NZ EPAC', speedLimitKmh: 25, ratedPowerW: 250, note: 'Common EPAC configuration; state-level rules may differ.' }],
  China: [{ id: 'gb-17761', label: 'GB 17761', speedLimitKmh: 25, ratedPowerW: 400, note: 'China e-bike requirements; confirm current local implementation.' }],
  Other: [{ id: 'custom', label: 'Custom regulation', speedLimitKmh: null, ratedPowerW: null, note: 'Enter the applicable speed and rated-power limits manually.' }],
}

export const regulationsForMarket = (market: string | null) => (market ? regulationsByMarket[market] ?? regulationsByMarket.Other : [])
