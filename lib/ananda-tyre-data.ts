export const wheelSizeOptions = ['20"', '24"', '26"', '27.5"', '29"', '700c']
export const tyreWidthOptions = ['1.75"', '2.0"', '2.25"', '2.35"', '2.6"', '3.0"', '4.0" fat']

export type TyreLookupRecord = { wheel: string; width: string; circumferenceMm: number }

export const tyreLookup: TyreLookupRecord[] = [
  { wheel: '20"', width: '1.75"', circumferenceMm: 1540 }, { wheel: '20"', width: '2.0"', circumferenceMm: 1580 }, { wheel: '20"', width: '4.0" fat', circumferenceMm: 1700 },
  { wheel: '24"', width: '1.75"', circumferenceMm: 1900 }, { wheel: '24"', width: '2.25"', circumferenceMm: 1950 },
  { wheel: '26"', width: '1.75"', circumferenceMm: 2070 }, { wheel: '26"', width: '2.25"', circumferenceMm: 2120 }, { wheel: '26"', width: '2.6"', circumferenceMm: 2180 },
  { wheel: '27.5"', width: '2.25"', circumferenceMm: 2190 }, { wheel: '27.5"', width: '2.6"', circumferenceMm: 2230 },
  { wheel: '29"', width: '2.25"', circumferenceMm: 2300 }, { wheel: '29"', width: '2.6"', circumferenceMm: 2340 },
  { wheel: '700c', width: '1.75"', circumferenceMm: 2200 }, { wheel: '700c', width: '2.0"', circumferenceMm: 2240 },
]

export const lookupCircumference = (wheel: string | null, width: string | null) => tyreLookup.find((item) => item.wheel === wheel && item.width === width)?.circumferenceMm ?? null
