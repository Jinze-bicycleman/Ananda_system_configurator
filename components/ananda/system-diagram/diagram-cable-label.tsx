"use client"

import type React from "react"
import { forwardRef } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CableLengthSelect } from "@/components/ananda/cable-spec-controls"
import { formatLeadLength, type ConnectionKey, type ConnectionTopologyEntry, type LabelMode } from "@/lib/system-diagram-layout"
import type { DiagramConnectionData } from "@/lib/use-fixed-system-diagram-data"

interface DiagramCableLabelProps {
  connectionKey: ConnectionKey
  topology: ConnectionTopologyEntry
  data: DiagramConnectionData
  mode: LabelMode
  accentOrientation: "horizontal" | "vertical"
  editing: boolean
  onDragPointerDown?: (e: React.PointerEvent) => void
}

/**
 * Compact (default) or expanded cable-label chip shown alongside each
 * connection in the fixed System Diagram. Docking interfaces and the
 * non-editable speed-sensor lead render plain text; editable connections
 * embed an inline length dropdown from the shared cable catalog.
 */
export const DiagramCableLabel = forwardRef<HTMLDivElement, DiagramCableLabelProps>(function DiagramCableLabel(
  { connectionKey, topology, data, mode, accentOrientation, editing, onDragPointerDown },
  ref,
) {
  const isDocking = topology.kind === "docking"
  const isOrphan = topology.kind === "orphan"
  const rowClass = mode === "expanded" ? "flex flex-col gap-0.5" : "flex flex-wrap items-baseline gap-x-2 gap-y-0.5"

  return (
    <div
      ref={ref}
      className={cn("relative flex w-full overflow-hidden border bg-card shadow-sm", editing && "cursor-move")}
      style={{ touchAction: editing ? "none" : undefined }}
      onPointerDown={editing ? onDragPointerDown : undefined}
    >
      <div
        aria-hidden="true"
        className="shrink-0"
        style={
          accentOrientation === "vertical"
            ? { width: 4, backgroundColor: topology.color }
            : { height: 4, width: "100%", backgroundColor: topology.color, position: "absolute", top: 0, left: 0 }
        }
      />
      <div className={cn("min-w-0 flex-1 px-2.5 py-1.5 text-[10.5px]", accentOrientation === "horizontal" && "pt-3")}>
        {isDocking ? (
          <p className="font-body font-semibold text-muted-foreground">Docked electrical interface · no cable</p>
        ) : (
          <>
            <div className={rowClass}>
              <span className="font-sans font-semibold text-foreground">
                Type: <span className="font-body font-normal text-muted-foreground">{data.cableModel ?? "—"}</span>
              </span>
            </div>
            <div className={rowClass}>
              <span className="font-sans font-semibold text-foreground">
                Connector: <span className="font-body font-normal text-muted-foreground">{data.connectorLabel ?? "—"}</span>
              </span>
              <span className="font-sans font-semibold text-foreground">
                Length:{" "}
                {data.editable && data.storeKey ? (
                  <span className="inline-block align-middle">
                    <CableLengthSelect connection={data.storeKey} lengthOptions={data.lengthOptions} />
                  </span>
                ) : (
                  <span className="font-body font-normal text-muted-foreground">
                    {data.lengthMm != null ? formatLeadLength(data.lengthMm) : "—"}
                  </span>
                )}
              </span>
            </div>
          </>
        )}
        {isOrphan && (
          <p className="mt-1 flex items-center gap-1 text-[10px] font-sans font-semibold uppercase tracking-wide text-warning">
            <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
            Connection endpoint not configured
          </p>
        )}
      </div>
    </div>
  )
})
