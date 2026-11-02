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
          className="min-w-0 flex-1 border-0 border-b-2 border-primary bg-transparent px-0 py-0.5 font-sans text-lg font-black text-graphite outline-none"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={commit}
          aria-label="Save project name"
          className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground"
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
      className="group flex max-w-full items-center gap-2 text-left"
    >
      <span className="truncate font-sans text-lg font-black text-graphite">{name}</span>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" aria-hidden="true" />
    </button>
  )
}
