"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import type { PackageModification } from "@/lib/ananda-package-diff"

export function PackageChangeDialog({
  open,
  onOpenChange,
  modifications,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  modifications: PackageModification[]
  onConfirm: () => void
}) {
  // Radix AlertDialog already traps focus, restores it to the triggering
  // button on close, and closes on Escape via AlertDialogCancel — this flag
  // only prevents a double-submit if the user double-clicks "Confirm".
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = () => {
    if (confirming) return
    setConfirming(true)
    onConfirm()
    setConfirming(false)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-border font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans text-lg font-black uppercase tracking-tight text-graphite">
            Confirm Package Changes
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body text-sm text-muted-foreground">
            You&apos;ve changed {modifications.length} {modifications.length === 1 ? "component" : "components"} away from the recommended
            (Best Match) selection. Review the changes below before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-64 overflow-y-auto border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Component</th>
                <th className="px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Recommended</th>
                <th className="px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground">Your Selection</th>
              </tr>
            </thead>
            <tbody>
              {modifications.map((mod) => (
                <tr key={mod.key} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-sans font-bold text-graphite">{mod.componentLabel}</td>
                  <td className="px-3 py-2 font-body text-muted-foreground">{mod.recommendedLabel}</td>
                  <td className="px-3 py-2 font-sans font-semibold text-primary">{mod.selectedLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="font-sans text-xs font-bold uppercase tracking-wider">Review Selections</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-primary font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90"
          >
            Confirm Changes &amp; Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
