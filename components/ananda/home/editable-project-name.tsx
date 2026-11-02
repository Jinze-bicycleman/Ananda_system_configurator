"use client"

import { useState } from "react"
import { Check, Pencil } from "lucide-react"
import { useProjectsStore } from "@/lib/ananda-projects"

export function EditableProjectName({ id, name }: { id: string; name: string }) {
  const renameProject = useProjectsStore((s) => s.renameProject)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  const commit = () => {
    renameProject(id, draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          maxLength={80}
          aria-label="Project name"
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit()
            if (event.key === "Escape") setEditing(false)
          }}
          className="min-w-0 flex-1 rounded-md border border-primary bg-background px-2 py-1 text-lg font-semibold text-graphite outline-none ring-2 ring-primary/20"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={commit}
          aria-label="Save project name"
          className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(name)
        setEditing(true)
      }}
      aria-label={`Rename project ${name}`}
      className="group -mx-1 flex max-w-full items-center gap-2 rounded-md px-1 text-left focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span className="truncate text-lg font-semibold text-graphite">{name}</span>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
    </button>
  )
}
