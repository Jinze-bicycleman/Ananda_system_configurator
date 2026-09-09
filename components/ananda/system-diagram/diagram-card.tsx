"use client"

import type React from "react"
import { forwardRef } from "react"
import { AlertTriangle, Battery, Cog, Gauge, MonitorSmartphone, Package, Plug, PuzzleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FrameKey } from "@/lib/system-diagram-layout"
import type { AccessoryItem, DiagramNode } from "@/lib/use-fixed-system-diagram-data"

const FALLBACK_ICONS: Record<FrameKey, React.ComponentType<{ className?: string }>> = {
  hmi: MonitorSmartphone,
  accessories: PuzzleIcon,
  motor: Cog,
  speedSensor: Gauge,
  battery: Battery,
  cage: Package,
  chargingPort: Plug,
}

interface DiagramCardProps {
  frameKey: FrameKey
  node: DiagramNode
  accessories?: AccessoryItem[]
  orientation: "image-left" | "image-top"
  editing: boolean
  selected: boolean
  onSelect: () => void
  onDragPointerDown?: (e: React.PointerEvent) => void
  onResizePointerDown?: (e: React.PointerEvent) => void
}

/**
 * Slim product card used inside the fixed 1000×900 System Diagram canvas.
 * Renders an image (or a restrained fallback icon), category label, model
 * name, and up to a few short spec lines. The accessories variant swaps the
 * spec list for a scrollable item list. Never fabricates a model — falls
 * back to "Not selected" / "Not needed" text states.
 */
export const DiagramCard = forwardRef<HTMLDivElement, DiagramCardProps>(function DiagramCard(
  { frameKey, node, accessories, orientation, editing, selected, onSelect, onDragPointerDown, onResizePointerDown },
  ref,
) {
  const FallbackIcon = FALLBACK_ICONS[frameKey]
  const isAccessories = frameKey === "accessories"
  const imageBox = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border border-border bg-white",
        orientation === "image-left" ? "h-16 w-16" : "h-14 w-full",
      )}
    >
      {node.imageUrl ? (
        <img src={node.imageUrl || "/placeholder.svg"} alt="" crossOrigin="anonymous" className="h-full w-full object-contain p-1" />
      ) : (
        <FallbackIcon className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  )

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${node.category}: ${node.model}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "absolute inset-0 flex h-full w-full flex-col overflow-hidden border bg-card shadow-sm transition-colors",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border",
        editing ? "cursor-move" : "cursor-pointer",
      )}
      style={{ touchAction: editing ? "none" : undefined }}
      onPointerDown={editing ? onDragPointerDown : undefined}
    >
      <div className={cn("flex min-h-0 flex-1 gap-2.5 p-2.5", orientation === "image-left" ? "flex-row items-start" : "flex-col")}>
        {imageBox}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">
              {node.category}
            </span>
            {node.status === "missing" && <AlertTriangle className="h-3 w-3 shrink-0 text-warning" aria-hidden="true" />}
          </div>
          <p className="wrap-anywhere text-sm font-sans font-bold leading-tight text-foreground">{node.model}</p>

          {isAccessories ? (
            <ul className="mt-1 max-h-32 flex-1 overflow-y-auto divide-y divide-border border-t border-border">
              {(accessories ?? []).length === 0 ? (
                <li className="py-1 text-[10.5px] font-body text-muted-foreground">None selected</li>
              ) : (
                (accessories ?? []).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-1 py-1 text-[10.5px]">
                    <span className="truncate font-body text-foreground">{item.name}</span>
                    <span className="shrink-0 font-mono text-muted-foreground">×{item.quantity}</span>
                  </li>
                ))
              )}
            </ul>
          ) : (
            node.specs.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {node.specs.slice(0, 3).map((spec) => (
                  <p key={spec.label} className="truncate text-[10.5px] font-body text-muted-foreground">
                    <span className="font-sans font-semibold text-foreground">{spec.label}:</span> {spec.value}
                  </p>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {editing && (
        <button
          type="button"
          aria-label={`Resize ${node.category} card`}
          onPointerDown={(e) => {
            e.stopPropagation()
            onResizePointerDown?.(e)
          }}
          className="absolute bottom-0 right-0 h-3.5 w-3.5 cursor-nwse-resize border-l border-t border-primary bg-primary/80"
          style={{ touchAction: "none" }}
        />
      )}
    </div>
  )
})
