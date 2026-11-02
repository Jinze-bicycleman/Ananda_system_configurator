"use client"

import { Copy, FileDown, Loader2, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useProjectsStore, type AnandaProject } from "@/lib/ananda-projects"
import { cn } from "@/lib/utils"
import { EditableProjectName } from "./editable-project-name"

const TOTAL_STAGES = 7

function summarize(project: AnandaProject) {
  const { sellRegion, bikeCategory, driveType, voltagePlatform } = project.config
  const drive = driveType ? `${driveType === "mid" ? "Mid-drive" : "Hub motor"}${voltagePlatform ? ` ${voltagePlatform}V` : ""}` : null
  const parts = [sellRegion, bikeCategory, drive].filter(Boolean)
  return parts.length > 0 ? parts.join("  ·  ") : "No selections yet"
}

function formatEdited(timestamp: number) {
  const minutes = Math.round((Date.now() - timestamp) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

const actionClass =
  "flex items-center gap-1.5 border border-border px-2.5 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-wait disabled:opacity-60"

export function ProjectRow({
  project,
  downloading,
  onDownload,
}: {
  project: AnandaProject
  downloading: boolean
  onDownload: () => void
}) {
  const openProject = useProjectsStore((s) => s.openProject)
  const duplicateProject = useProjectsStore((s) => s.duplicateProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const stage = Math.min(Math.max(project.config.currentStep, 1), TOTAL_STAGES)

  return (
    <li className="flex flex-col gap-4 border-t border-border px-5 py-4 first:border-t-0 lg:flex-row lg:items-center lg:gap-6">
      <div className="min-w-0 flex-1">
        <EditableProjectName id={project.id} name={project.name} />
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {summarize(project)} <span className="text-border-strong">/</span> Edited {formatEdited(project.updatedAt)}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex gap-0.5" role="img" aria-label={`Stage ${stage} of ${TOTAL_STAGES}`}>
            {Array.from({ length: TOTAL_STAGES }, (_, i) => (
              <span key={i} className={cn("h-1.5 w-6 -skew-x-[20deg]", i < stage ? "bg-primary" : "bg-border")} />
            ))}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Stage {stage} / {TOTAL_STAGES}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => openProject(project.id)}
          className="flex items-center gap-1.5 bg-graphite px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </button>
        <button type="button" onClick={() => duplicateProject(project.id)} className={actionClass}>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          Copy
        </button>
        <button type="button" onClick={onDownload} disabled={downloading} className={actionClass}>
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {downloading ? "Preparing" : "Report PDF"}
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className={cn(actionClass, "hover:border-destructive hover:text-destructive")}
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this project?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{project.name}&rdquo; and its configuration will be permanently removed. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProject(project.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  )
}
