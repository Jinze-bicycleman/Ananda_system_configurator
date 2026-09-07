"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Responsive inline-SVG climbing-grade visualization: a rising road with a
 * single spinning wheel resting tangent to its surface, plus rise/run
 * labels. Container width is measured with `ResizeObserver` and used
 * directly as the SVG `viewBox`, so on-screen text stays a constant size
 * instead of shrinking as a fixed-size drawing is scaled down for mobile.
 */

const RUN_LABEL = "100 m horizontal run"
const MARGIN_LEFT = 20
const MARGIN_RIGHT = 92
const MARGIN_TOP = 34
const MARGIN_BOTTOM = 40
const WHEEL_RADIUS = 17
const WHEEL_POSITION_FRACTION = 2 / 3

export function ClimbingSlopeVisual({
  gradePercent,
  angleDegrees,
  riseMetres,
}: {
  /** True (uncapped) grade as a percentage, e.g. 12.4. */
  gradePercent: number
  /** True equivalent slope angle in degrees, derived via atan(grade / 100). */
  angleDegrees: number
  /** Vertical rise, in metres, over the 100 m horizontal run. */
  riseMetres: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 340, height: 200 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (!width || width <= 0) return
      const height = Math.max(170, Math.min(260, width * 0.55))
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { width, height } = size
  const baseY = height - MARGIN_BOTTOM
  const roadLeftX = MARGIN_LEFT
  const maxRunPx = width - MARGIN_LEFT - MARGIN_RIGHT
  const maxRisePx = baseY - MARGIN_TOP - WHEEL_RADIUS

  // Preserve the true rise/run ratio. If the natural rise would overflow the
  // available drawing height, scale the whole triangle down uniformly (both
  // axes together) so the angle is never visually clamped or exaggerated.
  const trueRiseFraction = Math.max(gradePercent, 0) / 100
  const naturalRisePx = maxRunPx * trueRiseFraction
  const fitScale = naturalRisePx > maxRisePx && naturalRisePx > 0 ? maxRisePx / naturalRisePx : 1
  const runPx = maxRunPx * fitScale
  const risePx = naturalRisePx * fitScale

  const roadTopX = roadLeftX + runPx
  const roadTopY = baseY - risePx

  const wheelRoadX = roadLeftX + runPx * WHEEL_POSITION_FRACTION
  const wheelRoadY = baseY - risePx * WHEEL_POSITION_FRACTION

  // Unit vector along the road, then the outward (upward) unit normal so the
  // wheel sits exactly tangent to the surface, offset by its own radius.
  const roadLen = Math.hypot(runPx, risePx) || 1
  const dirX = runPx / roadLen
  const dirY = -risePx / roadLen
  const normX = dirY
  const normY = -dirX
  const wheelCx = wheelRoadX + normX * WHEEL_RADIUS
  const wheelCy = wheelRoadY + normY * WHEEL_RADIUS

  const spokeAngles = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
  const spokeInnerR = WHEEL_RADIUS * 0.18
  const spokeOuterR = WHEEL_RADIUS * 0.82

  const runLabelX = roadLeftX + maxRunPx / 2
  const runLabelY = height - 14

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-labelledby="climb-slope-title climb-slope-desc"
        className="block"
      >
        <title id="climb-slope-title">Climbing steepness illustration</title>
        <desc id="climb-slope-desc">
          {`A ${gradePercent.toFixed(1)} percent grade, equivalent to a ${angleDegrees.toFixed(1)} degree slope angle, rising ${riseMetres.toFixed(1)} metres over a 100 metre horizontal run.`}
        </desc>

        {/* Baseline */}
        <line
          x1={roadLeftX}
          y1={baseY}
          x2={roadLeftX + maxRunPx}
          y2={baseY}
          stroke="var(--border-strong)"
          strokeWidth={1.5}
          aria-hidden="true"
        />

        {/* Filled hill triangle */}
        <polygon
          points={`${roadLeftX},${baseY} ${roadTopX},${roadTopY} ${roadTopX},${baseY}`}
          fill="var(--primary)"
          fillOpacity={0.08}
          aria-hidden="true"
        />

        {/* Rising road surface */}
        <line
          x1={roadLeftX}
          y1={baseY}
          x2={roadTopX}
          y2={roadTopY}
          stroke="var(--graphite)"
          strokeWidth={2.5}
          strokeLinecap="round"
          aria-hidden="true"
        />

        {/* Vertical rise indicator */}
        <line
          x1={roadTopX}
          y1={baseY}
          x2={roadTopX}
          y2={roadTopY}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
          aria-hidden="true"
        />
        <text
          x={roadTopX + 6}
          y={(baseY + roadTopY) / 2}
          fontSize={12}
          fontFamily="var(--font-sans)"
          fontWeight={600}
          fill="var(--graphite)"
          dominantBaseline="middle"
          aria-hidden="true"
        >
          {`${riseMetres.toFixed(1)} m rise`}
        </text>

        {/* Horizontal run label */}
        <text
          x={runLabelX}
          y={runLabelY}
          fontSize={12}
          fontFamily="var(--font-sans)"
          fill="var(--muted-foreground)"
          textAnchor="middle"
          aria-hidden="true"
        >
          {RUN_LABEL}
        </text>

        {/* Wheel: outer tire is static; the inner group rotates clockwise to
            suggest uphill movement, without representing calculated speed. */}
        <circle
          cx={wheelCx}
          cy={wheelCy}
          r={WHEEL_RADIUS}
          fill="var(--primary)"
          fillOpacity={0.06}
          stroke="var(--graphite)"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <g
          className="climb-wheel-spin"
          style={{ transformOrigin: `${wheelCx}px ${wheelCy}px` }}
          aria-hidden="true"
        >
          <circle cx={wheelCx} cy={wheelCy} r={WHEEL_RADIUS * 0.9} fill="none" stroke="var(--primary)" strokeWidth={1} />
          {spokeAngles.map((a, i) => (
            <line
              key={i}
              x1={wheelCx + Math.cos(a) * spokeInnerR}
              y1={wheelCy + Math.sin(a) * spokeInnerR}
              x2={wheelCx + Math.cos(a) * spokeOuterR}
              y2={wheelCy + Math.sin(a) * spokeOuterR}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
            />
          ))}
          <circle cx={wheelCx} cy={wheelCy} r={WHEEL_RADIUS * 0.14} fill="var(--primary)" />
          <circle cx={wheelCx} cy={wheelCy - WHEEL_RADIUS * 0.9} r={WHEEL_RADIUS * 0.12} fill="var(--primary)" />
        </g>
      </svg>
      <p className="sr-only">
        {`The road rises at ${gradePercent.toFixed(1)} percent grade, equivalent to a ${angleDegrees.toFixed(1)} degree slope angle, gaining ${riseMetres.toFixed(1)} metres over a 100 metre horizontal run. A single wheel is shown spinning in place on the slope to indicate uphill travel.`}
      </p>
    </div>
  )
}
