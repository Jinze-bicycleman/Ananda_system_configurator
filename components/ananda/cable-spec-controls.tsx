"use client"

import { useState } from "react"
import { ChevronDown, Plus, X } from "lucide-react"
import { useAnandaStore } from "@/lib/ananda-store"
import {
  useConnectionCables,
  useConnectionCableLengthOptions,
  useExtensionCableLengthOptions,
  connectionCableLengthOptionsFor,
  type ConnectionCableRow,
  type ConnectionCableLengthOptionRow,
  type ExtensionCableLengthOptionRow,
} from "@/lib/ananda-packages"

/**
 * Loads the Supabase-backed cable catalog (Cable A/B/C/D, their length
 * options, and the optional extension-cable lengths) used by both the
 * mid-drive and hub-drive "Cable Specification" tables on Step 7.
 */
export function useCableCatalog() {
  const { cables, isLoading: cablesLoading, error: cablesError } = useConnectionCables()
  const { options, isLoading: optionsLoading, error: optionsError } = useConnectionCableLengthOptions()
  const { options: extensionOptions, isLoading: extensionLoading, error: extensionError } = useExtensionCableLengthOptions()
  return {
    cables,
    options,
    extensionOptions,
    isLoading: cablesLoading || optionsLoading || extensionLoading,
    error: cablesError || optionsError || extensionError,
  }
}

/** Deterministically assigns one catalog cable to a connection row, cycling through A/B/C/D. */
export function assignCable(cables: ConnectionCableRow[], index: number): ConnectionCableRow | null {
  if (cables.length === 0) return null
  return cables[index % cables.length]
}

const inputBase =
  "w-32 appearance-none border border-border bg-white px-2 py-1.5 pr-7 text-xs font-sans focus:outline-none focus:border-primary"

/** Read-only summary of the catalog cable assigned to a row (name, connector model, pins, IPX rating). */
export function CableCatalogInfo({ cable }: { cable: ConnectionCableRow | null }) {
  if (!cable) {
    return <span className="text-[11px] font-body text-muted-foreground">—</span>
  }
  return (
    <div>
      <p className="font-sans font-bold text-foreground">{cable.name}</p>
      <p className="text-[10.5px] font-body text-muted-foreground">
        {cable.connector_model} · {cable.pin_count}-pin · {cable.ipx_rating}
      </p>
    </div>
  )
}

/** Length dropdown for a connection, defaulting to unselected with a gray "Choose a length" placeholder. */
export function CableLengthSelect({
  connection,
  lengthOptions,
}: {
  connection: string
  lengthOptions: ConnectionCableLengthOptionRow[]
}) {
  const s = useAnandaStore()
  const storedM = s.cableLengths[connection]
  const storedMm = storedM !== undefined ? Math.round(storedM * 1000) : null
  const inputId = `cable-length-select-${connection.replace(/[^a-z0-9]+/gi, "-")}`

  return (
    <div className="relative inline-block">
      <label htmlFor={inputId} className="sr-only">
        Length for {connection}
      </label>
      <select
        id={inputId}
        value={storedMm ?? ""}
        onChange={(e) => {
          const mm = Number(e.target.value)
          if (mm > 0) s.setCableLength(connection, mm / 1000)
        }}
        className={`${inputBase} ${storedMm ? "font-bold text-foreground" : "text-muted-foreground"}`}
      >
        <option value="" disabled hidden>
          Choose a length
        </option>
        {lengthOptions.map((opt) => (
          <option key={opt.id} value={opt.length_mm} className="text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>
  )
}

/**
 * Optional "add an extension cable" control shown to the right of the
 * length column. Starts collapsed as a small add button; once added it
 * becomes a length dropdown (25 cm / 50 cm) with a remove button, and can
 * be cleared back to the collapsed state at any time.
 */
export function ExtensionCableControl({
  connection,
  extensionOptions,
}: {
  connection: string
  extensionOptions: ExtensionCableLengthOptionRow[]
}) {
  const s = useAnandaStore()
  const storedM = s.extensionCableLengths[connection]
  const storedMm = storedM !== undefined ? Math.round(storedM * 1000) : null
  const [adding, setAdding] = useState(storedMm !== null)
  const inputId = `extension-cable-select-${connection.replace(/[^a-z0-9]+/gi, "-")}`

  if (!adding && storedMm === null) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex items-center gap-1 border border-dashed border-border px-2 py-1.5 text-[11px] font-sans font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-3 w-3" aria-hidden="true" /> Add an extension cable
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative inline-block">
        <label htmlFor={inputId} className="sr-only">
          Extension cable length for {connection}
        </label>
        <select
          id={inputId}
          value={storedMm ?? ""}
          onChange={(e) => {
            const mm = Number(e.target.value)
            if (mm > 0) s.setExtensionCableLength(connection, mm / 1000)
          }}
          className={`${inputBase} w-28 ${storedMm ? "font-bold text-foreground" : "text-muted-foreground"}`}
        >
          <option value="" disabled hidden>
            Choose a length
          </option>
          {extensionOptions.map((opt) => (
            <option key={opt.id} value={opt.length_mm} className="text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      </div>
      <button
        type="button"
        aria-label={`Remove extension cable for ${connection}`}
        onClick={() => {
          s.setExtensionCableLength(connection, null)
          setAdding(false)
        }}
        className="text-muted-foreground transition-colors hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
