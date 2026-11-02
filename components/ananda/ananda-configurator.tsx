"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, AlertTriangle, Download, FolderOpen, PanelRightOpen } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAnandaStore, hasBikeCategory, hasCoreComponents, hasDrivetrain } from "@/lib/ananda-store"
import { getIncompleteItems } from "@/lib/ananda-validation"
import { useReportData, generateReportPdf } from "@/lib/ananda-report"
import { useProjectsStore } from "@/lib/ananda-projects"
import { HomePage } from "./home-page"
import { ProgressIndicator } from "./progress-indicator"
import { ConfigSummaryPanel } from "./config-summary-panel"
import { Step1ProjectContext } from "./step1-project-context"
import { Step2BikeCategory } from "./step2-bike-category"
import { Step3PackageConfiguration } from "./step3-package-configuration"
import { Step4Drivetrain } from "./step4-drivetrain"
import { Step5Accessories } from "./step5-accessories"
import { Step6SystemDiagram } from "./step6-system-diagram"
import { Step7Report } from "./step7-report"
import { BrandLogo } from "./brand-logo"

const labels = ["Sell Region & Regulation", "Bike Category", "Package Configuration", "Drivetrain", "Accessories", "System Diagram", "Final Report"]
const LAST_STEP_INDEX = labels.length - 1

export function AnandaConfigurator() {
  const state = useAnandaStore()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])
  const [open, setOpen] = useState(Math.min(Math.max(state.currentStep - 1, 0), LAST_STEP_INDEX))
  useEffect(() => { setOpen(Math.min(Math.max(state.currentStep - 1, 0), LAST_STEP_INDEX)) }, [state.currentStep])
  const activeProjectId = useProjectsStore((s) => s.activeProjectId)
  const activeProjectName = useProjectsStore((s) => s.projects.find((p) => p.id === s.activeProjectId)?.name ?? null)
  const brandName = useProjectsStore((s) => s.brandName)
  const saveActive = useProjectsStore((s) => s.saveActive)
  const closeActive = useProjectsStore((s) => s.closeActive)
  const adoptCurrent = useProjectsStore((s) => s.adoptCurrent)

  // A configuration started before projects existed becomes a project.
  useEffect(() => {
    if (hydrated && state.hasStarted && !activeProjectId) adoptCurrent()
  }, [hydrated, state.hasStarted, activeProjectId, adoptCurrent])

  // Every change is written to the active project shortly after it happens.
  useEffect(() => {
    if (!hydrated || !state.hasStarted || !activeProjectId) return
    const timer = window.setTimeout(saveActive, 400)
    return () => window.clearTimeout(timer)
  }, [hydrated, state, activeProjectId, saveActive])

  const reportData = useReportData()
  const [downloadingReport, setDownloadingReport] = useState(false)
  const handleDownloadReport = async () => {
    setDownloadingReport(true)
    try {
      await generateReportPdf(reportData, { projectName: activeProjectName ?? undefined, brandName })
    } finally {
      setDownloadingReport(false)
    }
  }

  const complete = useMemo(() => [
    Boolean(state.sellRegion && state.regulation),
    hasBikeCategory(state),
    hasCoreComponents(state),
    hasDrivetrain(state), true, true, false,
  ], [state])
  const unlocked = complete.map((_, index) => index === 0 || complete[index - 1])
  const [attemptedNext, setAttemptedNext] = useState(false)
  const incompleteItems = useMemo(() => (attemptedNext ? getIncompleteItems(open, state) : []), [attemptedNext, open, state])
  const scrollToTarget = (targetId: string | null) => {
    if (!targetId) return
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId)
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add("ring-2", "ring-destructive", "ring-offset-2", "ring-offset-background")
      window.setTimeout(() => el.classList.remove("ring-2", "ring-destructive", "ring-offset-2", "ring-offset-background"), 2200)
    })
  }
  const openSection = (index: number) => { setOpen(index); setAttemptedNext(false); state.setStep(index + 1); window.scrollTo({ top: 0, behavior: "smooth" }) }
  const openStepNumber = (stepNumber: number) => { if (unlocked[stepNumber - 1]) openSection(stepNumber - 1) }

  const goNext = () => {
    if (open >= labels.length - 1) return
    if (!complete[open]) {
      setAttemptedNext(true)
      const items = getIncompleteItems(open, state)
      scrollToTarget(items[0]?.targetId ?? null)
      return
    }
    openSection(open + 1)
  }
  const goBack = () => { if (open > 0) openSection(open - 1) }
  const content = [
    <Step1ProjectContext key="sell-region" />, <Step2BikeCategory key="bike-category" />,
    <Step3PackageConfiguration key="config" />,
    <Step4Drivetrain key="drivetrain" onEditStep={openStepNumber} />, <Step5Accessories key="accessories" />,
    <Step6SystemDiagram key="diagram" />, <Step7Report key="report" />,
  ]

  if (!hydrated || !state.hasStarted) return <HomePage />

  return (
    <div className="flex min-h-screen flex-col bg-secondary/60">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4"><BrandLogo className="h-8 w-auto shrink-0" /><span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" /><span className="hidden max-w-64 truncate text-sm font-medium text-graphite sm:block">{activeProjectName ?? "E-Drive System Configurator"}</span></div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeActive}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-graphite transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">My Projects</span>
            </button>
            <span className="hidden text-sm text-muted-foreground sm:inline">{complete.filter(Boolean).length} of {labels.length} complete</span>
            <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-secondary sm:block"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(complete.filter(Boolean).length / labels.length) * 100}%` }} /></div>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-graphite transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary 2xl:hidden"
                >
                  <PanelRightOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Summary</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm overflow-y-auto p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border px-4 py-3">
                  <SheetTitle className="text-base font-semibold">Configuration summary</SheetTitle>
                </SheetHeader>
                <div className="p-4"><ConfigSummaryPanel /></div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <div className="flex min-w-0 flex-1">
        <div className="hidden min-w-0 shrink-0 border-r border-border bg-background lg:block lg:w-60 xl:w-64"><div className="sticky top-14"><ProgressIndicator current={open + 1} onStep={openStepNumber} /></div></div>
        <div className="min-w-0 max-w-full flex-1"><div className="sticky top-14 z-40 border-b border-border bg-background lg:hidden"><ProgressIndicator current={open + 1} onStep={openStepNumber} /></div>
          <div className="mx-auto max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8"><div className="grid min-w-0 items-start gap-8 2xl:grid-cols-[minmax(0,1fr)_280px]"><main className="min-w-0 max-w-full">
            <div className="mb-5"><p className="text-sm font-semibold text-primary">Configuration workflow</p><p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">Complete one stage at a time. Later stages unlock when prerequisites are ready.</p></div>
            <section className="min-w-0 max-w-full rounded-lg border border-border bg-card shadow-sm"><div className="min-w-0 p-4 sm:p-6 lg:p-8">
              {incompleteItems.length > 0 && (
                <div role="alert" className="mb-6 rounded-md border border-destructive/40 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-destructive">
                        Complete the following before moving to the next stage
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {incompleteItems.map((item, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => scrollToTarget(item.targetId)}
                              className="text-left text-sm text-foreground underline decoration-destructive/50 underline-offset-2 hover:text-destructive"
                            >
                              {item.message}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {content[open]}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <button type="button" onClick={goBack} disabled={open === 0} className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-graphite transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous</button>
                <span className="text-sm tabular-nums text-muted-foreground">{open + 1} of {labels.length}</span>
                {open === labels.length - 1 ? (
                  <button type="button" onClick={handleDownloadReport} disabled={downloadingReport} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60">{downloadingReport ? "Preparing PDF…" : "Download report"} <Download className="h-4 w-4" aria-hidden="true" /></button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className={
                      complete[open]
                        ? "flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        : "flex items-center gap-2 rounded-md border border-destructive/50 bg-card px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                    }
                  >
                    Next stage <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div></section>
          </main><aside className="hidden min-w-0 2xl:block"><ConfigSummaryPanel /></aside></div></div>
        </div>
      </div>
    </div>
  )
}
