"use client"

import { CONNECTION_TOPOLOGY, type ConnectionKey, type FrameKey, type Side } from "@/lib/system-diagram-layout"
import type { DiagramConnectionData } from "@/lib/use-fixed-system-diagram-data"

interface Point {
  x: number
  y: number
}

function portPoint(rect: DOMRect, containerRect: DOMRect, side: Side): Point {
  const left = rect.left - containerRect.left
  const top = rect.top - containerRect.top
  if (side === "top") return { x: left + rect.width / 2, y: top }
  if (side === "bottom") return { x: left + rect.width / 2, y: top + rect.height }
  if (side === "left") return { x: left, y: top + rect.height / 2 }
  return { x: left + rect.width, y: top + rect.height / 2 }
}

function orthogonalPath(from: Point, to: Point, order: "vh" | "hv"): string {
  if (Math.abs(from.x - to.x) < 2 || Math.abs(from.y - to.y) < 2) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  }
  if (order === "vh") {
    return `M ${from.x} ${from.y} L ${from.x} ${to.y} L ${to.x} ${to.y}`
  }
  return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`
}

interface DiagramConnectionsProps {
  rects: Partial<Record<FrameKey, DOMRect>>
  containerRect: DOMRect | null
  connections: Record<ConnectionKey, DiagramConnectionData>
  reducedMotion: boolean
}

/**
 * SVG connection layer for the fixed System Diagram: two-segment orthogonal
 * cable routes between measured card rects, a distinct neutral bracket for
 * the battery↔cage docking interface, and animated flow dots on active
 * editable/fixed cables (omitted for reduced-motion or inactive
 * connections). The charging-port lead never gets a line — its endpoint
 * isn't modeled, so it renders as an unlinked label only.
 */
export function DiagramConnections({ rects, containerRect, connections, reducedMotion }: DiagramConnectionsProps) {
  if (!containerRect) return null

  return (
    <svg className="pointer-events-none absolute inset-0" aria-hidden="true" width={containerRect.width} height={containerRect.height}>
      {(Object.keys(CONNECTION_TOPOLOGY) as ConnectionKey[]).map((key) => {
        const topology = CONNECTION_TOPOLOGY[key]
        const data = connections[key]
        if (topology.kind === "orphan" || !data.active) return null

        const fromRect = rects[topology.from]
        const toRect = rects[topology.to]
        if (!fromRect || !toRect) return null

        const from = portPoint(fromRect, containerRect, topology.fromSide)
        const to = portPoint(toRect, containerRect, topology.toSide)
        const path = orthogonalPath(from, to, topology.route)
        const isDocking = topology.kind === "docking"

        return (
          <g key={key}>
            <path
              d={path}
              fill="none"
              stroke={topology.color}
              strokeWidth={isDocking ? 3 : 2.5}
              strokeDasharray={isDocking ? "2 4" : undefined}
              strokeLinecap="round"
            />
            {!isDocking && (
              <>
                <circle cx={from.x} cy={from.y} r={4} fill="var(--card)" stroke={topology.color} strokeWidth={2} />
                <circle cx={to.x} cy={to.y} r={4} fill="var(--card)" stroke={topology.color} strokeWidth={2} />
                {!reducedMotion && (
                  <circle r={3} fill={topology.color}>
                    <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
                  </circle>
                )}
              </>
            )}
            {isDocking && (
              <>
                <line
                  x1={from.x}
                  y1={from.y - 8}
                  x2={from.x}
                  y2={from.y + 8}
                  stroke={topology.color}
                  strokeWidth={2}
                />
                <line x1={to.x} y1={to.y - 8} x2={to.x} y2={to.y + 8} stroke={topology.color} strokeWidth={2} />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
