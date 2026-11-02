"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { saveContentAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageField } from "./image-field"

export type ContentRow = {
  key: string
  label: string
  section: string
  kind: "text" | "longtext" | "image" | "url"
  value: string
  sort_order: number
}

export function ContentEditor({ rows }: { rows: ContentRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(() => Object.fromEntries(rows.map((r) => [r.key, r.value])))
  const [draft, setDraft] = useState(saved)
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null)

  const sections = useMemo(() => {
    const map = new Map<string, ContentRow[]>()
    for (const row of rows) map.set(row.section, [...(map.get(row.section) ?? []), row])
    return [...map.entries()]
  }, [rows])

  const dirtyKeys = rows.filter((r) => (draft[r.key] ?? "") !== (saved[r.key] ?? "")).map((r) => r.key)

  function set(key: string, value: string) {
    setStatus(null)
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function save() {
    startTransition(async () => {
      const result = await saveContentAction(dirtyKeys.map((key) => ({ key, value: draft[key] ?? "" })))
      if (result.ok) {
        setSaved(draft)
        setStatus({ tone: "ok", text: "Saved to the database." })
        router.refresh()
      } else {
        setStatus({ tone: "error", text: result.error })
      }
    })
  }

  return (
    <div className="space-y-6">
      {sections.map(([section, items]) => (
        <section key={section} className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-graphite">{section}</h2>
          <div className="grid gap-5 p-5 md:grid-cols-2">
            {items.map((row) => {
              const id = `content-${row.key}`
              const wide = row.kind === "image" || row.kind === "longtext"
              return (
                <div key={row.key} className={wide ? "space-y-2 md:col-span-2" : "space-y-2"}>
                  <Label htmlFor={id}>{row.label}</Label>
                  {row.kind === "image" ? (
                    <ImageField id={id} value={draft[row.key] ?? ""} onChange={(v) => set(row.key, v)} />
                  ) : row.kind === "longtext" ? (
                    <Textarea id={id} rows={2} value={draft[row.key] ?? ""} onChange={(e) => set(row.key, e.target.value)} />
                  ) : (
                    <Input
                      id={id}
                      type={row.kind === "url" ? "url" : "text"}
                      value={draft[row.key] ?? ""}
                      onChange={(e) => set(row.key, e.target.value)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <p
          role="status"
          className={
            status?.tone === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"
          }
        >
          {status?.text ?? (dirtyKeys.length > 0 ? `${dirtyKeys.length} unsaved change${dirtyKeys.length === 1 ? "" : "s"}` : "All changes saved")}
        </p>
        <Button onClick={save} disabled={pending || dirtyKeys.length === 0}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save changes
        </Button>
      </div>
    </div>
  )
}
