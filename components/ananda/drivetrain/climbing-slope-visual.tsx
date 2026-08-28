"use client"

/**
 * A responsive side-profile ramp/hillside with a simplified rider silhouette
 * whose position tracks the live slope angle. Pure CSS transforms so it
 * respects `prefers-reduced-motion` (the transition is simply removed).
 */
export function ClimbingSlopeVisual({
  gradePercent,
  capped,
}: {
  /** 0-100+, already capped for layout when `capped` is true. */
  gradePercent: number
  capped: boolean
}) {
  // Cap the *visual* angle so extreme grades don't fully vertical-ize the
  // drawing, while the numeric readout elsewhere shows the true value.
  const visualPercent = Math.min(gradePercent, 45)
  const angleDeg = Math.atan(visualPercent / 100) * (180 / Math.PI)

  const width = 320
  const height = 140
  const baseY = height - 24
  const riseHeight = (Math.tan((angleDeg * Math.PI) / 180) * width) / 2

  const rampPath = `M 12 ${baseY} L ${width - 12} ${baseY - riseHeight} L ${width - 12} ${baseY} Z`

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Side profile illustration of a ${gradePercent.toFixed(1)} percent grade climb, shown as a ramp rising from left to right${capped ? ", visually capped for display" : ""}.`}
        className="w-full motion-reduce:transition-none"
      >
        <line x1="0" y1={baseY} x2={width} y2={baseY} stroke="var(--border)" strokeWidth={1} />
        <path
          d={rampPath}
          fill="var(--muted)"
          stroke="var(--graphite)"
          strokeWidth={1.5}
          className="transition-[d] duration-300 ease-out motion-reduce:transition-none"
        />
        <g
          className="transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{
            transform: `translate(${width - 46}px, ${baseY - riseHeight - 22}px) rotate(${-angleDeg}deg)`,
            transformOrigin: "12px 22px",
          }}
        >
          <circle cx="6" cy="20" r="5" fill="var(--primary)" />
          <circle cx="26" cy="20" r="5" fill="var(--primary)" />
          <line x1="6" y1="20" x2="26" y2="20" stroke="var(--graphite)" strokeWidth={2} />
          <line x1="16" y1="20" x2="12" y2="6" stroke="var(--graphite)" strokeWidth={2} />
          <line x1="16" y1="20" x2="22" y2="4" stroke="var(--graphite)" strokeWidth={2} />
          <circle cx="12" cy="3" r="3" fill="var(--graphite)" />
        </g>
      </svg>
      <p className="sr-only">
        The illustrated ramp rises at approximately {gradePercent.toFixed(1)} percent grade
        {capped ? ", though the illustration angle is capped for layout while the numeric result is not." : "."}
      </p>
    </div>
  )
}
