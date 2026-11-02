"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useProjectsStore } from "@/lib/ananda-projects"
import { BrandNameField } from "./home/brand-name-field"
import { ProjectRow } from "./home/project-row"
import { ProjectReportRunner } from "./home/project-report-runner"
import { BrandLogo } from "./brand-logo"

export function HomePage() {
  const brandName = useProjectsStore((s) => s.brandName)
  const projects = useProjectsStore((s) => s.projects)
  const createProject = useProjectsStore((s) => s.createProject)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const downloadingProject = projects.find((p) => p.id === downloadingId) ?? null

  return (
    <div className="flex min-h-screen flex-col bg-secondary/60">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <BrandLogo className="h-11 w-auto sm:h-12" />
          <BrandNameField />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              {brandName.trim() ? brandName.trim() : "E-Drive System Configurator"}
            </p>
            <h1 className="mt-1 text-balance text-3xl font-semibold text-graphite sm:text-4xl">My Projects</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {projects.length === 0
                ? "Your saved configurations will appear here."
                : `${projects.length} saved configuration${projects.length === 1 ? "" : "s"}. Open one to keep editing, or start a new one.`}
            </p>
          </div>
          <button
            type="button"
            onClick={createProject}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Configuration
          </button>
        </div>

        <ul className="mt-8 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              downloading={downloadingId === project.id}
              onDownload={() => setDownloadingId(project.id)}
            />
          ))}
          <li className={projects.length > 0 ? "border-t border-border" : undefined}>
            <button
              type="button"
              onClick={createProject}
              className="flex w-full items-center justify-center gap-2 px-5 py-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Start a new configuration
            </button>
          </li>
        </ul>
      </main>

      {downloadingProject && (
        <ProjectReportRunner
          key={downloadingProject.id}
          project={downloadingProject}
          brandName={brandName}
          onDone={() => setDownloadingId(null)}
        />
      )}
    </div>
  )
}
