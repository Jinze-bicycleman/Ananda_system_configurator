"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
}

export function ImageField({ id, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body })
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.")
      onChange(json.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="px-2 text-center text-xs text-muted-foreground">No picture</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
              )}
              {value ? "Replace picture" : "Upload picture"}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </Button>
            )}
          </div>
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste an image link"
            aria-label="Image link"
            className="h-9 text-xs"
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
