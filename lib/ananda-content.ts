export const driveTypeContent = {
  mid: { title: 'Mid-drive', description: 'Central motor uses the bicycle gears for strong climbing and balanced handling.' },
  hub: { title: 'Hub motor', description: 'Wheel motor gives simple, quiet assistance for everyday riding.' },
}

export const voltageContent = {
  36: 'Efficient platform for urban and light-duty applications.',
  48: 'Higher headroom for cargo, hills, speed, and performance use.',
}

export const drivetrainContent = {
  chain: 'Efficient, familiar, and easy to service.',
  belt: 'Clean, quiet, and low-maintenance for compatible frames.',
}

export const bikeCategoryContent: Record<string, string> = {
  City: 'Daily urban riding and practical commuting.',
  Trekking: 'Longer mixed-surface rides and touring.',
  MTB: 'Trail riding with dynamic climbing demands.',
  'Cargo bike': 'Two-wheel or tricycle utility platform for load carrying.',
  'Fat bike': 'Wide tyres for loose or soft terrain.',
  'Folding bike': 'Compact frame for storage and multi-modal commuting.',
  'Speed pedelec': 'Higher-speed assisted mobility platform.',
  Other: 'Special application requiring custom review.',
}
