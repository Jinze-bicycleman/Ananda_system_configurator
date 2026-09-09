"use client"

import type React from "react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, CheckCircle2, Lock, Minus, Plus, RotateCcw, Save, Unlock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CANVAS_W,
  CANVAS_H,
  CONNECTION_TOPOLOGY,
  DEFAULT_FRAMES,
  DEFAULT_LABELS,
  clearDiagramLayout,
  loadDiagramLayout,
  saveDiagramLayout,
  type ConnectionKey,
  type FrameKey,
  type FrameRect,
  type LabelRect,
} from "@/lib/system-diagram-layout"
import { useFixedSystemDiagramData } from "@/lib/use-fixed-system-diagram-data"
import { DiagramCard } from "./diagram-card"
import { DiagramCableLabel } from "./diagram-cable-label"
import { DiagramConnections } from "./diagram-connections"

const FRAME_KEYS = Object.keys(DEFAULT_FRAMES) as FrameKey[]
const LABEL_KEYS = Object.keys(DEFAULT_LABELS) as ConnectionKey[]
const MIN_CARD_W = 160
const MIN_CARD_H = 72
const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.5
const ZOOM_STEP = 0.1

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = () => setReduced(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

type Selection = { kind: "frame"; key: FrameKey } | { kind: "label"; key: ConnectionKey } | null

type DragState = {
  kind: "frame" | "label"
  key: FrameKey | ConnectionKey
  mode: "move" | "resize"
  startX: number
  startY: number
  startRect: FrameRect | LabelRect
}

function describeForScreenReader(nodes: ReturnType<typeof useFixedSystemDiagramData>["nodes"], statusMessage: string): string {
  const nodeList = Object.values(nodes)
    .map((n) => `${n.category}: ${n.model}`)
    .join("; ")
  return `System diagram. Components: ${nodeList}. ${statusMessage}.`
}

/**
 * Fixed 1000×900 System Diagram canvas (Stage 7, mid-drive): 7 component
 * cards, 6 cable/interface labels, a measured SVG connection layer, and an
 * editable layout mode with drag/resize, zoom, and localStorage-backed
 * save/reset. Replaces the radial diagram on the "System Diagram" tab.
 */
export function FixedSystemDiagram() {
  const data = useFixedSystemDiagramData()
  const reducedMotion = usePrefersReducedMotion()

  const [frames, setFrames] = useState<Record<FrameKey, FrameRect>>(DEFAULT_FRAMES)
  const [labels, setLabels] = useState<Record<ConnectionKey, LabelRect>>(DEFAULT_LABELS)
  const [editing, setEditing] = useState(false)
  const [selection, setSelection] = useState<Selection>(null)
  const [zoom, setZoom] = useState(1)
  const [justSaved, setJustSaved] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const frameRefs = useRef<Partial<Record<FrameKey, HTMLDivElement | null>>>({})
  const labelRefs = useRef<Partial<Record<ConnectionKey, HTMLDivElement | null>>>({})
  const [rects, setRects] = useState<Partial<Record<FrameKey, DOMRect>>>({})
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const dragStateRef = useRef<DragState | null>(null)

  useEffect(() => {
    const savedLayout = loadDiagramLayout("mid-drive")
    if (savedLayout) {
      setFrames(savedLayout.frames)
      setLabels(savedLayout.labels)
    }
  }, [])

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    setContainerRect(container.getBoundingClientRect())
    const next: Partial<Record<FrameKey, DOMRect>> = {}
    FRAME_KEYS.forEach((key) => {
      const el = frameRefs.current[key]
      if (el) next[key] = el.getBoundingClientRect()
    })
    setRects(next)
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [measure, frames, zoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => measure())
    observer.observe(container)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const state = dragStateRef.current
      if (!state) return
      const dx = (e.clientX - state.startX) / zoom
      const dy = (e.clientY - state.startY) / zoom
      if (state.kind === "frame") {
        setFrames((prev) => {
          const rect = prev[state.key as FrameKey]
          if (!rect) return prev
          const start = state.startRect as FrameRect
          if (state.mode === "move") {
            return { ...prev, [state.key]: { ...rect, x: Math.max(0, start.x + dx), y: Math.max(0, start.y + dy) } }
          }
          return { ...prev, [state.key]: { ...rect, w: Math.max(MIN_CARD_W, start.w + dx), h: Math.max(MIN_CARD_H, start.h + dy) } }
        })
      } else {
        setLabels((prev) => {
          const rect = prev[state.key as ConnectionKey]
          if (!rect) return prev
          const start = state.startRect as LabelRect
          return { ...prev, [state.key]: { ...rect, x: Math.max(0, start.x + dx), y: Math.max(0, start.y + dy) } }
        })
      }
    },
    [zoom],
  )

  const handlePointerUp = useCallback(() => {
    dragStateRef.current = null
    window.removeEventListener("pointermove", handlePointerMove)
    window.removeEventListener("pointerup", handlePointerUp)
  }, [handlePointerMove])

  const beginDrag = useCallback(
    (kind: "frame" | "label", key: FrameKey | ConnectionKey, mode: "move" | "resize", e: React.PointerEvent) => {
      if (!editing) return
      e.preventDefault()
      e.stopPropagation()
      const startRect = kind === "frame" ? frames[key as FrameKey] : labels[key as ConnectionKey]
      dragStateRef.current = { kind, key, mode, startX: e.clientX, startY: e.clientY, startRect }
      setSelection({ kind, key } as Selection)
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    },
    [editing, frames, labels, handlePointerMove, handlePointerUp],
  )

  const handleLockToggle = () => {
    setEditing((prev) => !prev)
    setSelection(null)
  }

  const handleSave = () => {
    saveDiagramLayout({ frames, labels }, "mid-drive")
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1800)
  }

  const handleReset = () => {
    setFrames(DEFAULT_FRAMES)
    setLabels(DEFAULT_LABELS)
    clearDiagramLayout("mid-drive")
    setSelection(null)
  }

  const accentOrientationFor = useMemo(() => {
    const result: Record<ConnectionKey, "horizontal" | "vertical"> = {} as Record<ConnectionKey, "horizontal" | "vertical">
    LABEL_KEYS.forEach((key) => {
      const topology = CONNECTION_TOPOLOGY[key]
      const from = frames[topology.from]
      const to = frames[topology.to]
      const dx = Math.abs(from.x + from.w / 2 - (to.x + to.w / 2))
      const dy = Math.abs(from.y + from.h / 2 - (to.y + to.h / 2))
      result[key] = dx >= dy ? "horizontal" : "vertical"
    })
    return result
  }, [frames])

  const description = describeForScreenReader(data.nodes, data.statusMessage)
  const statusOk = Object.values(data.nodes).every((n) => n.status === "ok")

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-graphite-light">
            System Diagram — Mid-Drive
          </p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wide",
            statusOk ? "border-primary/30 bg-primary/5 text-primary" : "border-warning/40 bg-warning/10 text-warning",
          )}
        >
          {statusOk ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
          {data.statusMessage}
        </span>
      </div>

      <p className="sr-only" id="fixed-diagram-description">
        {description}
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleLockToggle}
          className={cn(
            "flex items-center gap-1.5 border-2 px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide transition-colors",
            editing ? "border-primary bg-primary/5 text-primary" : "border-border text-graphite hover:border-primary/40",
          )}
        >
          {editing ? <Unlock className="h-3.5 w-3.5" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
          {editing ? "Editing layout" : "Edit layout"}
        </button>
        {editing && (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 border-2 border-border px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide text-graphite transition-colors hover:border-primary/40"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {justSaved ? "Saved" : "Save layout"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 border-2 border-border px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide text-graphite transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset layout
            </button>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 100) / 100))}
            className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="w-10 text-center text-[11px] font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 100) / 100))}
            className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="overflow-auto border border-border bg-surface" style={{ maxHeight: 780 }}>
        <div style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom }}>
          <div
            ref={containerRef}
            role="group"
            aria-describedby="fixed-diagram-description"
            className="relative bg-surface"
            style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            <DiagramConnections rects={rects} containerRect={containerRect} connections={data.connections} reducedMotion={reducedMotion} />

            {FRAME_KEYS.map((key) => {
              const rect = frames[key]
              return (
                <div key={key} style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
                  <DiagramCard
                    ref={(el) => {
                      frameRefs.current[key] = el
                    }}
                    frameKey={key}
                    node={data.nodes[key]}
                    accessories={key === "accessories" ? data.accessories : undefined}
                    orientation={rect.orientation}
                    editing={editing}
                    selected={selection?.kind === "frame" && selection.key === key}
                    onSelect={() => editing && setSelection({ kind: "frame", key })}
                    onDragPointerDown={(e) => beginDrag("frame", key, "move", e)}
                    onResizePointerDown={(e) => beginDrag("frame", key, "resize", e)}
                  />
                </div>
              )
            })}

            {LABEL_KEYS.map((key) => {
              const rect = labels[key]
              return (
                <div key={key} style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, minHeight: rect.h }}>
                  <DiagramCableLabel
                    ref={(el) => {
                      labelRefs.current[key] = el
                    }}
                    connectionKey={key}
                    topology={CONNECTION_TOPOLOGY[key]}
                    data={data.connections[key]}
                    mode={rect.mode}
                    accentOrientation={accentOrientationFor[key]}
                    editing={editing}
                    onDragPointerDown={(e) => beginDrag("label", key, "move", e)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {editing && selection && (
        <SelectionPanel
          selection={selection}
          frames={frames}
          labels={labels}
          onChangeFrame={(key, patch) => setFrames((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))}
          onChangeLabel={(key, patch) => setLabels((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))}
        />
      )}

      <p className="mt-2 text-[10px] font-body text-muted-foreground sm:hidden">Pinch or scroll to pan the diagram.</p>
    </div>
  )
}

function SelectionPanel({
  selection,
  frames,
  labels,
  onChangeFrame,
  onChangeLabel,
}: {
  selection: NonNullable<Selection>
  frames: Record<FrameKey, FrameRect>
  labels: Record<ConnectionKey, LabelRect>
  onChangeFrame: (key: FrameKey, patch: Partial<FrameRect>) => void
  onChangeLabel: (key: ConnectionKey, patch: Partial<LabelRect>) => void
}) {
  const numberField = (label: string, value: number, onChange: (v: number) => void) => (
    <label className="flex flex-col gap-1 text-[10px] font-sans font-bold uppercase tracking-wide text-muted-foreground">
      {label}
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 border border-border bg-white px-2 py-1 text-xs font-sans text-foreground focus:outline-none focus:border-primary"
      />
    </label>
  )

  if (selection.kind === "frame") {
    const rect = frames[selection.key]
    return (
      <div className="mt-3 flex flex-wrap items-end gap-3 border border-border bg-card p-3">
        <p className="w-full text-[11px] font-sans font-bold uppercase tracking-wider text-primary">Editing: {selection.key}</p>
        {numberField("X", rect.x, (v) => onChangeFrame(selection.key, { x: v }))}
        {numberField("Y", rect.y, (v) => onChangeFrame(selection.key, { y: v }))}
        {numberField("Width", rect.w, (v) => onChangeFrame(selection.key, { w: Math.max(MIN_CARD_W, v) }))}
        {numberField("Height", rect.h, (v) => onChangeFrame(selection.key, { h: Math.max(MIN_CARD_H, v) }))}
        <label className="flex flex-col gap-1 text-[10px] font-sans font-bold uppercase tracking-wide text-muted-foreground">
          Orientation
          <select
            value={rect.orientation}
            onChange={(e) => onChangeFrame(selection.key, { orientation: e.target.value as FrameRect["orientation"] })}
            className="w-32 border border-border bg-white px-2 py-1 text-xs font-sans text-foreground focus:outline-none focus:border-primary"
          >
            <option value="image-left">Image left</option>
            <option value="image-top">Image top</option>
          </select>
        </label>
      </div>
    )
  }

  const rect = labels[selection.key]
  return (
    <div className="mt-3 flex flex-wrap items-end gap-3 border border-border bg-card p-3">
      <p className="w-full text-[11px] font-sans font-bold uppercase tracking-wider text-primary">Editing label: {selection.key}</p>
      {numberField("X", rect.x, (v) => onChangeLabel(selection.key, { x: v }))}
      {numberField("Y", rect.y, (v) => onChangeLabel(selection.key, { y: v }))}
      {numberField("Width", rect.w, (v) => onChangeLabel(selection.key, { w: v }))}
      {numberField("Height", rect.h, (v) => onChangeLabel(selection.key, { h: v }))}
      <label className="flex flex-col gap-1 text-[10px] font-sans font-bold uppercase tracking-wide text-muted-foreground">
        Label mode
        <select
          value={rect.mode}
          onChange={(e) => onChangeLabel(selection.key, { mode: e.target.value as LabelRect["mode"] })}
          className="w-32 border border-border bg-white px-2 py-1 text-xs font-sans text-foreground focus:outline-none focus:border-primary"
        >
          <option value="compact">Compact</option>
          <option value="expanded">Expanded</option>
        </select>
      </label>
    </div>
  )
}
