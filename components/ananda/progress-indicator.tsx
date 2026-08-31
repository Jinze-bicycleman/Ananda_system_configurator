"use client"

import { cn } from "@/lib/utils"

const STEPS = [
  { n: 1, label: "Sell Region & Regulation" },
  { n: 2, label: "Rider Profile & Targets" },
  { n: 3, label: "Recommended Solutions" },
  { n: 4, label: "Package Configuration" },
  { n: 5, label: "Drivetrain" },
  { n: 6, label: "Accessories" },
  { n: 7, label: "System Diagram" },
  { n: 8, label: "Configuration Report" },
]

export function ProgressIndicator({ current, onStep }: { current: number; onStep: (n: number) => void }) {
  return <nav className="w-full bg-graphite" aria-label="Configuration steps"><div className="flex items-center gap-0 overflow-x-auto no-print lg:hidden">{STEPS.map((s) => { const done = current > s.n; const active = current === s.n; return <button key={s.n} onClick={() => onStep(s.n)} className={cn("flex h-9 w-9 shrink-0 items-center justify-center text-xs font-bold transition-colors", active && "bg-primary text-white", done && "bg-primary/70 text-white", !active && !done && "text-white/40")}>{done ? "✓" : s.n}</button> })}<div className="flex-1 px-3 py-2"><span className="text-xs uppercase tracking-wider text-white/80">{STEPS[current - 1]?.label}</span></div></div><ol className="hidden flex-col gap-0 lg:flex">{STEPS.map((s, i) => { const done = current > s.n; const active = current === s.n; return <li key={s.n}><button onClick={() => onStep(s.n)} className={cn("group flex w-full items-center gap-3 px-4 py-3 transition-all", active && "border-l-4 border-primary bg-primary/20", done && "cursor-pointer border-l-4 border-primary/40 hover:bg-white/5", !active && !done && "border-l-4 border-transparent opacity-50 hover:bg-white/5")}><span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", active && "bg-primary text-white", done && "bg-lime text-graphite", !active && !done && "bg-white/10 text-white/50")}>{done ? "✓" : s.n}</span><span className={cn("text-left text-sm leading-tight", active ? "font-semibold text-white" : done ? "text-white/80" : "text-white/40")}>{s.label}</span></button>{i < STEPS.length - 1 && <div className="ml-[2.125rem] h-px bg-white/10" />}</li> })}</ol></nav>
}
