"use client"

import { cn } from "@/lib/utils"
import { SectionLabel } from "../ui-primitives"
import { InlineError, InlineWarning } from "./drivetrain-states"
import { findBeltCandidates, type DrivetrainComponent } from "@/lib/ananda-drivetrain"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type YesNo = boolean | null

function YesNoButtons({ value, onChange }: { value: YesNo; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={cn(
            "px-3 py-1.5 text-xs font-sans font-bold uppercase border transition-colors",
            value === v ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary/50",
          )}
        >
          {v ? "Yes" : "No"}
        </button>
      ))}
    </div>
  )
}

export function BeltFrameRequirements({
  belts,
  frontTeeth,
  rearTeeth,
  beltPitchMm,
  frameHasBeltOpening,
  beltAlternateInstallationApproved,
  centerDistanceMm,
  adjustmentMm,
  tensioningMethod,
  frameStiffnessVerified,
  frontPulleyClearanceVerified,
  rearPulleyClearanceVerified,
  beltlineVerified,
  onField,
  onSelectBelt,
  selectedBeltId,
}: {
  belts: DrivetrainComponent[]
  frontTeeth: number | null
  rearTeeth: number | null
  beltPitchMm: number | null
  frameHasBeltOpening: boolean | null
  beltAlternateInstallationApproved: boolean
  centerDistanceMm: number | null
  adjustmentMm: number | null
  tensioningMethod: string | null
  frameStiffnessVerified: "yes" | "no" | "not_yet" | null
  frontPulleyClearanceVerified: boolean
  rearPulleyClearanceVerified: boolean
  beltlineVerified: boolean
  onField: (key: string, value: unknown) => void
  onSelectBelt: (beltId: string) => void
  selectedBeltId: string | null
}) {
  const blockingError = frameHasBeltOpening === false && !beltAlternateInstallationApproved

  const candidates =
    frontTeeth != null && rearTeeth != null && beltPitchMm != null && centerDistanceMm != null && centerDistanceMm > 0
      ? findBeltCandidates(belts, frontTeeth, rearTeeth, beltPitchMm, centerDistanceMm, adjustmentMm)
      : []

  return (
    <div className="mb-8">
      <SectionLabel>Frame Requirements</SectionLabel>
      <div className="border border-border bg-white p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-graphite mb-2">Frame has a belt opening</p>
            <YesNoButtons value={frameHasBeltOpening} onChange={(v) => onField("frameHasBeltOpening", v)} />
          </div>

          {frameHasBeltOpening === false && (
            <div className="flex items-center gap-2">
              <Switch checked={beltAlternateInstallationApproved} onCheckedChange={(v) => onField("beltAlternateInstallationApproved", v)} />
              <span className="text-xs font-body text-muted-foreground">Alternate approved installation method on record</span>
            </div>
          )}

          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-graphite mb-2">Centre distance (BB to rear axle)</p>
            <input
              type="number"
              value={centerDistanceMm ?? ""}
              onChange={(e) => onField("centerDistanceMm", e.target.value ? Number(e.target.value) : null)}
              placeholder="mm"
              className="w-full border border-border px-3 py-1.5 text-sm font-body focus:border-primary outline-none"
            />
          </div>

          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-graphite mb-2">Available adjustment</p>
            <input
              type="number"
              value={adjustmentMm ?? ""}
              onChange={(e) => onField("adjustmentMm", e.target.value ? Number(e.target.value) : null)}
              placeholder="mm"
              className="w-full border border-border px-3 py-1.5 text-sm font-body focus:border-primary outline-none"
            />
          </div>

          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-graphite mb-2">Tensioning method</p>
            <Select value={tensioningMethod ?? undefined} onValueChange={(v) => onField("tensioningMethod", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sliding_dropouts">Sliding dropouts</SelectItem>
                <SelectItem value="eccentric_bb">Eccentric bottom bracket</SelectItem>
                <SelectItem value="chain_tug">Chain tug / adjuster</SelectItem>
                <SelectItem value="fixed_no_adjustment">Fixed — no adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-xs font-sans font-bold uppercase tracking-wider text-graphite mb-2">Frame stiffness verified</p>
            <Select
              value={frameStiffnessVerified ?? undefined}
              onValueChange={(v) => onField("frameStiffnessVerified", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="not_yet">Not yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2">
            <Switch checked={frontPulleyClearanceVerified} onCheckedChange={(v) => onField("frontPulleyClearanceVerified", v)} />
            <span className="text-xs font-body text-muted-foreground">Front pulley clearance verified</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={rearPulleyClearanceVerified} onCheckedChange={(v) => onField("rearPulleyClearanceVerified", v)} />
            <span className="text-xs font-body text-muted-foreground">Rear pulley clearance verified</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={beltlineVerified} onCheckedChange={(v) => onField("beltlineVerified", v)} />
            <span className="text-xs font-body text-muted-foreground">Beltline verified</span>
          </label>
        </div>

        {blockingError && (
          <InlineError>
            The frame requires a validated opening or another approved installation method for a continuous belt. This blocks
            continuation until resolved.
          </InlineError>
        )}

        {frameStiffnessVerified === "not_yet" && (
          <InlineWarning>Rear-triangle stiffness requires engineering verification before this configuration can be finalized.</InlineWarning>
        )}

        <div>
          <p className="text-xs font-sans font-bold uppercase tracking-wider text-graphite mb-2">Belt candidates</p>
          {frontTeeth == null || rearTeeth == null || beltPitchMm == null ? (
            <p className="text-xs font-body text-muted-foreground">Select a front pulley and rear pulley to calculate belt candidates.</p>
          ) : centerDistanceMm == null || centerDistanceMm <= 0 ? (
            <p className="text-xs font-body text-muted-foreground">Enter the frame centre distance to calculate belt candidates.</p>
          ) : candidates.length === 0 ? (
            <p className="text-xs font-body text-muted-foreground">No belt in the catalogue matches this centre distance and adjustment range.</p>
          ) : (
            <div className="space-y-2">
              {candidates.map((c) => (
                <button
                  key={c.belt.id}
                  onClick={() => onSelectBelt(c.belt.id)}
                  className={cn(
                    "w-full flex flex-wrap items-center justify-between gap-2 border p-3 text-left transition-colors",
                    selectedBeltId === c.belt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="min-w-0 text-xs font-sans font-semibold text-graphite">{c.belt.display_name ?? c.belt.model}</span>
                  <span className="shrink-0 text-[10px] font-sans font-bold uppercase tracking-wider text-warning">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
