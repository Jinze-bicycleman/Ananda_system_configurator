"use client"

import type React from "react"
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { topologyDefinitions, formatCableLength } from "@/lib/ananda-system-topology"
import type {
  AccessoryRow as AccessoryRowType,
  SystemConnection,
  SystemDiagramData,
  SystemProductNode,
  TopologySlotKey,
} from "@/lib/ananda-system-topology"
import { SystemComponentNode } from "./system-component-node"

type ActiveRef = { kind: "node" | "cable"; id: string } | null
type Side = "top" | "right" | "bottom" | "left"
interface Point {
  x: number
  y: number
}

function opposite(side: Side): Side {
  return side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left"
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === "function") ref(value)
      else (ref as React.MutableRefObject<T | null>).current = value
    })
  }
}

function computeHighlight(active: ActiveRef, connections: SystemConnection[]) {
  const nodeKeys = new Set<string>()
  const cableIds = new Set<string>()
  if (!active) return { nodeKeys, cableIds }
  if (active.kind === "node") {
    nodeKeys.add(active.id)
    connections.forEach((c) => {
      if (c.from === active.id || c.to === active.id) {
        cableIds.add(c.id)
        nodeKeys.add(c.from)
        nodeKeys.add(c.to)
      }
    })
  } else {
    cableIds.add(active.id)
    const conn = connections.find((c) => c.id === active.id)
    if (conn) {
      nodeKeys.add(conn.from)
      nodeKeys.add(conn.to)
    }
  }
  return { nodeKeys, cableIds }
}

/** Direction always describes the position of whichever endpoint is not central. */
function sideForConnection(conn: SystemConnection, nodes: Record<string, SystemProductNode>): { fromSide: Side; toSide: Side } {
  const fromIsCentral = Boolean(nodes[conn.from]?.isCentral)
  return fromIsCentral
    ? { fromSide: conn.direction, toSide: opposite(conn.direction) }
    : { fromSide: opposite(conn.direction), toSide: conn.direction }
}

function portPoint(rect: DOMRect, containerRect: DOMRect, side: Side): Point {
  const left = rect.left - containerRect.left
  const top = rect.top - containerRect.top
  if (side === "top") return { x: left + rect.width / 2, y: top }
  if (side === "bottom") return { x: left + rect.width / 2, y: top + rect.height }
  if (side === "left") return { x: left, y: top + rect.height / 2 }
  return { x: left + rect.width, y: top + rect.height / 2 }
}

function linePath(from: Point, to: Point): string {
  if (Math.abs(from.x - to.x) < 2 || Math.abs(from.y - to.y) < 2) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  }
  return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`
}

function describeSystemForScreenReader(data: SystemDiagramData): string {
  const nodeList = Object.values(data.nodes)
    .map((n) => `${n.category}: ${n.model}`)
    .join("; ")
  const connectionList = data.connections
    .map(
      (c) =>
        `${c.reference} ${c.cableModel} connects ${data.nodes[c.from]?.category ?? c.from} to ${
          data.nodes[c.to]?.category ?? c.to
        }, ${formatCableLength(c.lengthMm)}`,
    )
    .join(". ")
  return `System diagram. Components: ${nodeList}. Connections: ${connectionList}. ${data.statusMessage}.`
}

const AccessoryPanel = forwardRef<
  HTMLDivElement,
  {
    node: SystemProductNode
    accessories: AccessoryRowType[]
    isActive: boolean
    isDimmed: boolean
    onActivate: () => void
    onHover: (hovering: boolean) => void
  }
>(function AccessoryPanel({ node, accessories, isActive, isDimmed, onActivate, onHover }, ref) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={`Accessories: ${accessories.length} item${accessories.length === 1 ? "" : "s"}`}
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onActivate()
        }
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      className={`flex max-h-64 flex-col border bg-card transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isActive ? "border-primary" : "border-border"
      } ${isDimmed ? "opacity-40" : "opacity-100"}`}
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="text-[10px] font-mono text-muted-foreground">{node.reference}</span>
        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-foreground">
          Accessories · {accessories.length}
        </span>
      </div>
      {accessories.length === 0 ? (
        <p className="px-3 py-3 text-[11px] font-body text-muted-foreground">None selected</p>
      ) : (
        <ul className="flex-1 divide-y divide-border overflow-y-auto">
          {accessories.map((accessory) => (
            <li key={accessory.id} className="flex items-center gap-2 px-3 py-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-border bg-white">
                {accessory.imageUrl ? (
                  <img
                    src={accessory.imageUrl || "/placeholder.svg"}
                    alt=""
                    crossOrigin="anonymous"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[8px] text-muted-foreground">{accessory.reference}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-sans font-bold text-foreground">{accessory.name}</p>
                <p className="truncate text-[10px] font-body text-muted-foreground">
                  {accessory.model} · ×{accessory.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})

/**
 * Reusable radial "engineering" system diagram: a fixed center/top/right/
 * bottom/left grid driven entirely by `topologyDefinitions[data.driveType]`,
 * with an SVG connection layer measured against the rendered node cards.
 */
export function RadialSystemDiagram({ data }: { data: SystemDiagramData }) {
  const topology = topologyDefinitions[data.driveType]
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [rects, setRects] = useState<Record<string, DOMRect>>({})
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [active, setActive] = useState<ActiveRef>(null)
  const [hovered, setHovered] = useState<ActiveRef>(null)

  const effectiveActive = hovered ?? active

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    setContainerRect(container.getBoundingClientRect())
    const next: Record<string, DOMRect> = {}
    Object.entries(nodeRefs.current).forEach(([key, el]) => {
      if (el) next[key] = el.getBoundingClientRect()
    })
    setRects(next)
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [measure, data])

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => measure())
    observer.observe(container)
    Object.values(nodeRefs.current).forEach((el) => el && observer.observe(el))
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure, data])

  useEffect(() => {
    const scrollEl = scrollRef.current
    const center = centerRef.current
    if (!scrollEl || !center) return
    const targetLeft = center.offsetLeft + center.offsetWidth / 2 - scrollEl.clientWidth / 2
    scrollEl.scrollLeft = Math.max(0, targetLeft)
  }, [data.driveType])

  const { nodeKeys: activeNodeKeys, cableIds: activeCableIds } = useMemo(
    () => computeHighlight(effectiveActive, data.connections),
    [effectiveActive, data.connections],
  )

  function setNodeRef(key: string) {
    return (el: HTMLDivElement | null) => {
      nodeRefs.current[key] = el
    }
  }

  function toggleNode(key: string) {
    setActive((prev) => (prev?.kind === "node" && prev.id === key ? null : { kind: "node", id: key }))
  }

  function toggleCable(id: string) {
    setActive((prev) => (prev?.kind === "cable" && prev.id === id ? null : { kind: "cable", id }))
  }

  function renderSlotNodes(slotKey: TopologySlotKey) {
    const slot = topology.slots[slotKey]
    const keys = Array.isArray(slot) ? slot : [slot]
    return keys.map((key) => {
      const node = data.nodes[key]
      if (!node) return null
      const isActive = activeNodeKeys.has(key)
      const isDimmed = effectiveActive !== null && !isActive
      const ref = key === topology.slots.center ? mergeRefs(setNodeRef(key), centerRef) : setNodeRef(key)
      if (key === "accessories") {
        return (
          <AccessoryPanel
            key={key}
            ref={ref}
            node={node}
            accessories={data.accessories}
            isActive={isActive}
            isDimmed={isDimmed}
            onActivate={() => toggleNode(key)}
            onHover={(hovering) => setHovered(hovering ? { kind: "node", id: key } : null)}
          />
        )
      }
      return (
        <SystemComponentNode
          key={key}
          ref={ref}
          node={node}
          isActive={isActive}
          isDimmed={isDimmed}
          onActivate={() => toggleNode(key)}
          onHover={(hovering) => setHovered(hovering ? { kind: "node", id: key } : null)}
        />
      )
    })
  }

  const statusIcon =
    data.status === "complete" ? (
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
    ) : data.status === "warning" ? (
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
    )

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-graphite-light">
            Final System Configuration — {topology.label}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{data.revisionLabel}</p>
        </div>
        <span
          className={`flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wide ${
            data.status === "complete"
              ? "border-primary/30 bg-primary/5 text-primary"
              : data.status === "warning"
                ? "border-warning/40 bg-warning/10 text-warning"
                : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {statusIcon}
          {data.statusMessage}
        </span>
      </div>

      <p className="sr-only" id="radial-diagram-description">
        {describeSystemForScreenReader(data)}
      </p>
      <p className="mb-2 text-[10px] font-body text-muted-foreground sm:hidden">Swipe to inspect the complete system diagram</p>

      <div ref={scrollRef} className="overflow-x-auto border border-border bg-card">
        <div
          ref={containerRef}
          role="group"
          aria-describedby="radial-diagram-description"
          className="relative grid gap-6 p-6"
          style={{
            gridTemplateColumns: "minmax(190px,240px) minmax(220px,1fr) minmax(190px,240px)",
            gridTemplateAreas: `". top ." "left center right" ". bottom ."`,
            minWidth: 760,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            width={containerRect?.width ?? 0}
            height={containerRect?.height ?? 0}
          >
            {data.connections.map((conn) => {
              const fromRect = rects[conn.from]
              const toRect = rects[conn.to]
              if (!fromRect || !toRect || !containerRect) return null
              const { fromSide, toSide } = sideForConnection(conn, data.nodes)
              const from = portPoint(fromRect, containerRect, fromSide)
              const to = portPoint(toRect, containerRect, toSide)
              const isActiveCable = activeCableIds.has(conn.id)
              const isDimmedCable = effectiveActive !== null && !isActiveCable
              return (
                <g key={conn.id}>
                  <path
                    d={linePath(from, to)}
                    fill="none"
                    stroke={conn.colorKey}
                    strokeWidth={isActiveCable ? 3.5 : 2}
                    strokeLinecap="round"
                    opacity={isDimmedCable ? 0.25 : 1}
                  />
                  <circle cx={from.x} cy={from.y} r={4} fill="var(--card)" stroke={conn.colorKey} strokeWidth={2} opacity={isDimmedCable ? 0.25 : 1} />
                  <circle cx={to.x} cy={to.y} r={4} fill="var(--card)" stroke={conn.colorKey} strokeWidth={2} opacity={isDimmedCable ? 0.25 : 1} />
                </g>
              )
            })}
          </svg>

          {data.connections.map((conn) => {
            const fromRect = rects[conn.from]
            const toRect = rects[conn.to]
            if (!fromRect || !toRect || !containerRect) return null
            const { fromSide, toSide } = sideForConnection(conn, data.nodes)
            const from = portPoint(fromRect, containerRect, fromSide)
            const to = portPoint(toRect, containerRect, toSide)
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2
            const isVerticalRun = conn.direction === "top" || conn.direction === "bottom"
            const isActiveCable = activeCableIds.has(conn.id)
            const isDimmedCable = effectiveActive !== null && !isActiveCable
            return (
              <button
                key={conn.id}
                type="button"
                onClick={() => toggleCable(conn.id)}
                onMouseEnter={() => setHovered({ kind: "cable", id: conn.id })}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered({ kind: "cable", id: conn.id })}
                onBlur={() => setHovered(null)}
                className={`absolute border bg-card px-1.5 py-1 text-left text-[10px] leading-tight font-mono transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActiveCable ? "border-primary text-foreground" : "border-border-strong text-foreground"
                }`}
                style={{
                  left: midX,
                  top: midY,
                  transform: isVerticalRun ? "translate(8px, -50%)" : "translate(-50%, calc(-100% - 8px))",
                  opacity: isDimmedCable ? 0.35 : 1,
                  minWidth: "max-content",
                }}
              >
                <span className="font-bold" style={{ color: conn.colorKey }}>
                  {conn.reference}
                </span>{" "}
                {conn.cableModel} · {formatCableLength(conn.lengthMm)}
                <br />
                <span className="text-muted-foreground">{conn.connectorLabel}</span>
              </button>
            )
          })}

          <div style={{ gridArea: "top" }} className="flex flex-col gap-2 self-end">
            {renderSlotNodes("top")}
          </div>
          <div style={{ gridArea: "left" }} className="flex flex-col gap-2 self-center">
            {renderSlotNodes("left")}
          </div>
          <div style={{ gridArea: "center" }} className="flex flex-col gap-2 self-center justify-self-center">
            {renderSlotNodes("center")}
          </div>
          <div style={{ gridArea: "right" }} className="flex flex-col gap-2 self-center">
            {renderSlotNodes("right")}
          </div>
          <div style={{ gridArea: "bottom" }} className="flex flex-col gap-2 self-start">
            {renderSlotNodes("bottom")}
          </div>
        </div>
      </div>
    </div>
  )
}
