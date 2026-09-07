"use client"

import { forwardRef } from "react"
import { AlertTriangle } from "lucide-react"
import type { SystemProductNode } from "@/lib/ananda-system-topology"

interface SystemComponentNodeProps {
  node: SystemProductNode
  isActive: boolean
  isDimmed: boolean
  onActivate: () => void
  onHover: (hovering: boolean) => void
}

/**
 * Compact horizontal product card for the radial system diagram: image
 * fixed-left, reference/category/model/specs text right. Central nodes get
 * a stronger border (never a size change). Forwards its ref so the parent
 * diagram can measure `getBoundingClientRect()` for cable-port routing.
 */
export const SystemComponentNode = forwardRef<HTMLDivElement, SystemComponentNodeProps>(function SystemComponentNode(
  { node, isActive, isDimmed, onActivate, onHover },
  ref,
) {
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${node.category}: ${node.model}`}
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
      className={`flex items-center gap-3 border bg-card px-3 py-2.5 text-left transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        node.isCentral ? "border-2 border-primary" : isActive ? "border-primary" : "border-border"
      } ${isDimmed ? "opacity-40" : "opacity-100"}`}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-border bg-white">
        {node.imageUrl ? (
          <img
            src={node.imageUrl || "/placeholder.svg"}
            alt=""
            crossOrigin="anonymous"
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <span className="text-[9px] font-mono text-muted-foreground">{node.reference}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">{node.reference}</span>
          <span className="truncate text-[10px] font-sans uppercase tracking-wider text-muted-foreground">
            {node.category}
          </span>
          {node.status === "missing" && <AlertTriangle className="h-3 w-3 flex-shrink-0 text-warning" aria-hidden="true" />}
        </div>
        <p className="truncate text-sm font-sans font-bold text-foreground">{node.model}</p>
        {node.specs.length > 0 && (
          <p className="truncate text-[10.5px] font-body text-muted-foreground">
            {node.specs.map((spec) => `${spec.label}: ${spec.value}`).join(" · ")}
          </p>
        )}
      </div>
    </div>
  )
})
