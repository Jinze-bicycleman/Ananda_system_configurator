"use client"

import { ArrowRight } from "lucide-react"
import { useAnandaStore } from "@/lib/ananda-store"

export function WelcomeScreen() {
  const startConfiguration = useAnandaStore((state) => state.startConfiguration)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-graphite">
      <img
        src="/images/welcome-hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/70 to-graphite/30" />
      <div className="absolute inset-0 bg-graphite/40" />

      <header className="relative z-10 flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M13 3 4 14h7v7l9-11h-7z" fill="white" />
            </svg>
          </div>
          <span className="font-sans text-base font-black uppercase tracking-widest text-white">Ananda</span>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-start justify-center px-4 sm:px-6 lg:px-16">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-lime">
          Pre-Sales Engineering Tool
        </p>
        <h1 className="mt-4 max-w-3xl text-balance font-sans text-5xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Ananda E-Bike System Configuration Tool
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
          Configure a complete e-bike drivetrain and electrical system stage by stage &mdash; from sell-market
          regulation down to the final compatibility report.
        </p>
        <button
          onClick={startConfiguration}
          className="clip-diagonal-r mt-10 flex items-center gap-3 bg-primary px-7 py-3.5 text-sm font-sans font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90"
        >
          Start Configuring
          <ArrowRight className="h-4 w-4" />
        </button>
      </main>

      <footer className="relative z-10 px-4 pb-6 sm:px-6 lg:px-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          9 Stages &middot; Package to Report
        </p>
      </footer>
    </div>
  )
}
