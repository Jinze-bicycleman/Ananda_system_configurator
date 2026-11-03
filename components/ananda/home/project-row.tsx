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
import { useI18n, useT } from "@/lib/i18n/provider"
import { EditableProjectName } from "./editable-project-name"

const TOTAL_STAGES = 7

type TFn = ReturnType<typeof useT>

function summarize(project: AnandaProject, t: TFn) {
  const { sellRegion, bikeCategory, driveType, voltagePlatform } = project.config
  const drive = driveType ? `${driveType === "mid" ? t("Mid-drive") : t("Hub motor")}${voltagePlatform ? ` ${voltagePlatform}V` : ""}` : null
  const parts = [sellRegion ? t(sellRegion) : null, bikeCategory ? t(bikeCategory) : null, drive].filter(Boolean)
  return parts.length > 0 ? parts.join("  ·  ") : t("No selections yet")
}

function formatEdited(timestamp: number, t: TFn, locale: string) {
  const minutes = Math.round((Date.now() - timestamp) / 60000)
  if (minutes < 1) return t("just now")
  if (minutes < 60) return t("{n} min ago", { n: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return t("{n} h ago", { n: hours })
  return new Date(timestamp).toLocaleDateString(locale === "zh" ? "zh-CN" : undefined, { day: "numeric", month: "short", year: "numeric" })
}

const actionClass =
  "flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-graphite-light transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"

export function ProjectRow({
  project,
  downloading,
  onDownload,
}: {
  project: AnandaProject
  downloading: boolean
  onDownload: () => void
}) {
  const { t, locale } = useI18n()
  const openProject = useProjectsStore((s) => s.openProject)
  const duplicateProject = useProjectsStore((s) => s.duplicateProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const stage = Math.min(Math.max(project.config.currentStep, 1), TOTAL_STAGES)

  return (
    <li className="flex flex-col gap-4 border-t border-border px-5 py-4 first:border-t-0 lg:flex-row lg:items-center lg:gap-6">
      <div className="min-w-0 flex-1">
        <EditableProjectName id={project.id} name={project.name} />
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {summarize(project, t)} <span aria-hidden="true">&middot;</span>{" "}
          {t("Edited {when}", { when: formatEdited(project.updatedAt, t, locale) })}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex gap-0.5" role="img" aria-label={t("Stage {stage} of {total}", { stage, total: TOTAL_STAGES })}>
            {Array.from({ length: TOTAL_STAGES }, (_, i) => (
              <span key={i} className={cn("h-1.5 w-6 -skew-x-[20deg]", i < stage ? "bg-primary" : "bg-border")} />
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {t("Stage {stage} of {total}", { stage, total: TOTAL_STAGES })}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => openProject(project.id)}
          className="flex items-center gap-1.5 rounded-md bg-graphite px-3.5 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          {t("Edit")}
        </button>
        <button type="button" onClick={() => duplicateProject(project.id)} className={actionClass}>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {t("Copy")}
        </button>
        <button type="button" onClick={onDownload} disabled={downloading} className={actionClass}>
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {downloading ? t("Preparing") : t("Report PDF")}
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className={cn(actionClass, "hover:border-destructive hover:text-destructive")}
              aria-label={t("Delete {name}", { name: project.name })}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t("Delete")}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Delete this project?")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("“{name}” and its configuration will be permanently removed. This cannot be undone.", { name: project.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProject(project.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("Delete project")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  )
}
