"use client"

import { useEffect, useRef } from "react"
import { generateReportPdf, useReportData } from "@/lib/ananda-report"
import type { AnandaProject } from "@/lib/ananda-projects"

// Builds the report for a saved project (not the live configurator state) and
// downloads it once the product catalog the report depends on has loaded.
export function ProjectReportRunner({
  project,
  brandName,
  onDone,
}: {
  project: AnandaProject
  brandName: string
  onDone: () => void
}) {
  const data = useReportData(project.config)
  const started = useRef(false)

  useEffect(() => {
    if (data.loading || started.current) return
    started.current = true
    generateReportPdf(data, { projectName: project.name, brandName })
      .catch(() => {})
      .finally(onDone)
  }, [data, project.name, brandName, onDone])

  return null
}
