/** Smooth SVG path through the given points (centripetal-ish Catmull-Rom converted to cubic Béziers). */
export function smoothPath(points: [number, number][], tension = 0.5): string {
  if (points.length === 0) return ""
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`
  const fmt = (n: number) => Math.round(n * 10) / 10
  let d = `M${fmt(points[0][0])},${fmt(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const t = tension / 3
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = p1[1] + (p2[1] - p0[1]) * t
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = p2[1] - (p3[1] - p1[1]) * t
    d += ` C${fmt(c1x)},${fmt(c1y)} ${fmt(c2x)},${fmt(c2y)} ${fmt(p2[0])},${fmt(p2[1])}`
  }
  return d
}
