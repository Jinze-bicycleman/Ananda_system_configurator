"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, AlertTriangle, Download } from "lucide-react"
import { useAnandaStore, hasProductTargets, hasRecommendedSolution, hasCoreComponents, hasDrivetrain } from "@/lib/ananda-store"
import { getIncompleteItems } from "@/lib/ananda-validation"
import { useReportData, generateReportPdf } from "@/lib/ananda-report"
import { WelcomeScreen } from "./welcome-screen"
import { ProgressIndicator } from "./progress-indicator"
import { ConfigSummaryPanel } from "./config-summary-panel"
import { Step1ProjectContext } from "./step1-project-context"
import { Step2BikeCategory } from "./step2-bike-category"
import { Step3ProductTargets } from "./step3-product-targets"
import { Step4RecommendedSolutions } from "./step4-recommended-solutions"
import { Step5PackageConfiguration } from "./step5-package-configuration"
import { Step6DrivetrainSelection } from "./step6-drivetrain"
import { Step8Accessories } from "./step8-accessories"
import { Step9SystemDiagram } from "./step9-system-diagram"
import { Step10Report } from "./step10-report"

const labels = ["Sell Region & Regulation", "Bike Category", "Product Targets", "Recommended Solutions", "Package Configuration", "Drivetrain", "Accessories", "System Diagram", "Final Report"]

export function AnandaConfigurator() {
  const state = useAnandaStore()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])
  const [open, setOpen] = useState(Math.min(Math.max(state.currentStep - 1, 0), 8))
  useEffect(() => { setOpen(Math.min(Math.max(state.currentStep - 1, 0), 8)) }, [state.currentStep])
  const reportData = useReportData()
  const [downloadingReport, setDownloadingReport] = useState(false)
  const handleDownloadReport = async () => {
    setDownloadingReport(true)
    try {
      await generateReportPdf(reportData)
    } finally {
      setDownloadingReport(false)
    }
  }

  const complete = useMemo(() => [
    Boolean(state.sellRegion && state.regulation),
    Boolean(state.bikeCategory && state.wheelSize && state.tyreCircumferenceMm),
    hasProductTargets(state), hasRecommendedSolution(state), hasCoreComponents(state),
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
    <Step1ProjectContext key="sell-region" />, <Step2BikeCategory key="bike-category" />, <Step3ProductTargets key="targets" />,
    <Step4RecommendedSolutions key="solutions" />, <Step5PackageConfiguration key="config" />,
    <Step6DrivetrainSelection key="drivetrain" onEditStep={openStepNumber} />, <Step8Accessories key="accessories" />,
    <Step9SystemDiagram key="diagram" />, <Step10Report key="report" />,
  ]

  if (!hydrated || !state.hasStarted) return <WelcomeScreen />

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-graphite-light bg-graphite">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center bg-primary"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M13 3 4 14h7v7l9-11h-7z" fill="white" /></svg></div><div><span className="font-sans text-base font-black uppercase tracking-widest text-white">Ananda</span><span className="ml-2 hidden font-sans text-sm text-white/40 sm:inline">E-Drive System Configurator</span></div></div>
          <div className="flex items-center gap-3"><span className="font-sans text-xs uppercase tracking-wider text-white/50">{complete.filter(Boolean).length} / {labels.length} complete</span><div className="h-1 w-20 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-primary transition-all" style={{ width: `${(complete.filter(Boolean).length / labels.length) * 100}%` }} /></div></div>
        </div>
      </header>
      <div className="flex flex-1">
        <div className="hidden shrink-0 border-r border-white/10 bg-graphite lg:block lg:w-56 xl:w-64"><div className="sticky top-14"><ProgressIndicator current={open + 1} onStep={openStepNumber} /></div></div>
        <div className="min-w-0 flex-1"><div className="sticky top-14 z-40 border-b border-white/10 bg-graphite lg:hidden"><ProgressIndicator current={open + 1} onStep={openStepNumber} /></div>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_260px]"><main>
            <div className="mb-5"><p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">ANANDA / CONFIGURATION WORKFLOW</p><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Complete one stage at a time. Later stages unlock when prerequisites are ready.</p></div>
            <section className="border border-primary/50 bg-card"><div className="p-4 sm:p-6">
              {incompleteItems.length > 0 && (
                <div className="mb-6 border-2 border-destructive bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-sans font-bold uppercase tracking-wider text-destructive">
                        Complete the following before moving to the next stage
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {incompleteItems.map((item, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => scrollToTarget(item.targetId)}
                              className="text-left text-sm font-body text-foreground underline decoration-destructive/50 underline-offset-2 hover:text-destructive"
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
                <button onClick={goBack} disabled={open === 0} className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /> Previous</button>
                <span className="font-mono text-xs text-muted-foreground">{open + 1} / {labels.length}</span>
                {open === labels.length - 1 ? (
                  <button onClick={handleDownloadReport} disabled={downloadingReport} className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">{downloadingReport ? "Preparing PDF…" : "Download Report"} <Download className="h-3.5 w-3.5" /></button>
                ) : (
                  <button
                    onClick={goNext}
                    className={
                      complete[open]
                        ? "flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90"
                        : "flex items-center gap-2 border-2 border-destructive bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/10"
                    }
                  >
                    Next Stage <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div></section>
          </main><aside className="hidden xl:block"><ConfigSummaryPanel /></aside></div></div>
        </div>
      </div>
    </div>
  )
}
