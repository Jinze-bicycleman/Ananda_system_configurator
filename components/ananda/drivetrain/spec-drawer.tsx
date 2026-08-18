"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { TechSpecRow } from "../ui-primitives"
import type { DrivetrainComponent } from "@/lib/ananda-drivetrain"
import { displayName } from "@/lib/ananda-drivetrain"
import { ExternalLink, ImageOff } from "lucide-react"

export function SpecDrawer({
  component,
  onOpenChange,
}: {
  component: DrivetrainComponent | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={Boolean(component)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {component && (
          <>
            <SheetHeader>
              <SheetTitle className="font-sans uppercase">{displayName(component)}</SheetTitle>
              <SheetDescription>{component.description || "No description recorded."}</SheetDescription>
            </SheetHeader>

            <div className="px-4">
              {component.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={component.image_url || "/placeholder.svg"}
                  alt={displayName(component)}
                  crossOrigin="anonymous"
                  className="mb-4 h-40 w-full object-contain border border-border bg-surface"
                />
              ) : (
                <div className="mb-4 flex h-40 w-full flex-col items-center justify-center gap-2 border border-dashed border-border bg-surface text-muted-foreground">
                  <ImageOff className="h-6 w-6" />
                  <span className="text-[11px] font-sans uppercase tracking-wider">{component.category.replace(/_/g, " ")}</span>
                </div>
              )}

              <div className="border border-border">
                <TechSpecRow label="Brand" value={component.brand} />
                <TechSpecRow label="Model" value={component.model} />
                <TechSpecRow label="Category" value={component.category.replace(/_/g, " ")} />
                {component.teeth != null && <TechSpecRow label="Tooth Count" value={component.teeth} unit="T" />}
                {component.tooth_counts && (
                  <TechSpecRow label="Cassette Tooth Sequence" value={component.tooth_counts.join("–")} unit="T" />
                )}
                {component.internal_gear_ratios && (
                  <TechSpecRow label="Internal Ratios" value={component.internal_gear_ratios.map((r) => r.toFixed(2)).join(", ")} />
                )}
                {component.minimum_internal_ratio != null && component.maximum_internal_ratio != null && (
                  <TechSpecRow
                    label="Continuous Ratio Range"
                    value={`${component.minimum_internal_ratio.toFixed(2)} – ${component.maximum_internal_ratio.toFixed(2)}`}
                  />
                )}
                {component.number_of_speeds != null && <TechSpecRow label="Speeds" value={component.number_of_speeds} />}
                {component.chainline_mm != null && <TechSpecRow label="Chainline" value={component.chainline_mm} unit="mm" />}
                {component.beltline_mm != null && <TechSpecRow label="Beltline" value={component.beltline_mm} unit="mm" />}
                {component.mounting_interface && <TechSpecRow label="Mounting Interface" value={component.mounting_interface} />}
                {component.product_family && <TechSpecRow label="Product Family" value={component.product_family} />}
                {component.maximum_input_torque_nm != null && (
                  <TechSpecRow label="Max Input Torque" value={component.maximum_input_torque_nm} unit="Nm" />
                )}
                {component.maximum_gvw_kg != null && <TechSpecRow label="Max GVW" value={component.maximum_gvw_kg} unit="kg" />}
                {component.speed_pedelec_compatible != null && (
                  <TechSpecRow label="Speed-Pedelec Compatible" value={component.speed_pedelec_compatible ? "Yes" : "No"} />
                )}
                {component.belt_teeth != null && <TechSpecRow label="Belt Teeth" value={component.belt_teeth} unit="T" />}
                {component.belt_length_mm != null && <TechSpecRow label="Belt Length" value={component.belt_length_mm} unit="mm" />}
                {component.belt_pitch_mm != null && <TechSpecRow label="Belt Pitch" value={component.belt_pitch_mm} unit="mm" />}
                {component.belt_width_mm != null && <TechSpecRow label="Belt Width" value={component.belt_width_mm} unit="mm" />}
                {component.minimum_primary_ratio != null && (
                  <TechSpecRow label="Minimum Primary Ratio" value={component.minimum_primary_ratio.toFixed(2)} />
                )}
                {component.chain_speed != null && <TechSpecRow label="Chain Speed" value={component.chain_speed} />}
                {component.chain_width_inch != null && <TechSpecRow label="Chain Width" value={component.chain_width_inch} unit="in" />}
                {(component.minimum_wheel_size_inch != null || component.maximum_wheel_size_inch != null) && (
                  <TechSpecRow
                    label="Wheel Size Range"
                    value={`${component.minimum_wheel_size_inch ?? "—"} – ${component.maximum_wheel_size_inch ?? "—"}`}
                    unit="in"
                  />
                )}
                {component.specifications &&
                  Object.entries(component.specifications)
                    .filter(([, v]) => v !== null && v !== undefined && v !== "")
                    .map(([key, v]) => (
                      <TechSpecRow key={key} label={key.replace(/_/g, " ")} value={typeof v === "object" ? JSON.stringify(v) : String(v)} />
                    ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-body text-muted-foreground">
                {component.source_verified_on && <span>Verified {component.source_verified_on}</span>}
                {component.source_url && (
                  <a
                    href={component.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
