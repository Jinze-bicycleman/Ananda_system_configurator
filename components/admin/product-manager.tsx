"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Search, Trash2 } from "lucide-react"
import { deleteProductAction, saveProductAction } from "@/app/admin/actions"
import type { ProductField, ProductRecord, ProductTable } from "@/lib/admin/product-schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ImageField } from "./image-field"

type FormValues = Record<string, string | boolean>

function toForm(config: ProductTable, record: ProductRecord | null): FormValues {
  const values: FormValues = {}
  for (const f of config.fields) {
    const raw = record?.[f.name]
    if (f.type === "boolean") values[f.name] = record ? Boolean(raw) : f.name === "is_active"
    else values[f.name] = raw == null ? (f.name === "sort_order" && !record ? "100" : "") : String(raw)
  }
  return values
}

function FieldInput({ field, value, onChange }: { field: ProductField; value: string | boolean; onChange: (v: string | boolean) => void }) {
  const id = `field-${field.name}`
  switch (field.type) {
    case "boolean":
      return (
        <div className="flex h-9 items-center gap-3">
          <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
          <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
        </div>
      )
    case "textarea":
      return <Textarea id={id} rows={3} value={String(value)} onChange={(e) => onChange(e.target.value)} />
    case "image":
      return <ImageField id={id} value={String(value)} onChange={onChange} />
    case "select":
      return (
        <Select value={String(value) || undefined} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "number":
    case "integer":
      return (
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step={field.type === "integer" ? 1 : "any"}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    default:
      return <Input id={id} type={field.type === "url" ? "url" : "text"} value={String(value)} onChange={(e) => onChange(e.target.value)} />
  }
}

function summary(config: ProductTable, record: ProductRecord) {
  const parts: string[] = []
  if (record.voltage_v) parts.push(`${record.voltage_v} V`)
  if (config.table === "motors" && record.torque_nm) parts.push(`${record.torque_nm} Nm`)
  if (config.table === "motors" && record.motor_type) parts.push(record.motor_type === "hub" ? "Hub" : "Mid drive")
  if (config.table === "controllers" && record.peak_current_a) parts.push(`${record.peak_current_a} A peak`)
  if (config.table === "hmi_displays" && record.size) parts.push(String(record.size))
  if (config.table === "batteries" && record.capacity_wh) parts.push(`${record.capacity_wh} Wh`)
  if (config.table === "chargers" && record.current_a) parts.push(`${record.current_a} A`)
  if (config.table === "charging_ports" && record.connector_type) parts.push(String(record.connector_type))
  if (config.table === "sensors" && record.sensor_type) parts.push(String(record.sensor_type))
  if (config.table === "accessories" && record.category) parts.push(String(record.category))
  if (config.table === "speed_sensors" && record.mounting_position) parts.push(String(record.mounting_position))
  if (config.table === "bike_components") {
    if (record.category) parts.push(String(record.category))
    if (record.teeth) parts.push(`${record.teeth}T`)
  }
  return parts.join("  ·  ")
}

export function ProductManager({ config, records }: { config: ProductTable; records: ProductRecord[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<ProductRecord | "new" | null>(null)
  const [form, setForm] = useState<FormValues>({})
  const [error, setError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<ProductRecord | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? records.filter((r) => String(r.model ?? "").toLowerCase().includes(q)) : records
  }, [records, query])

  function open(target: ProductRecord | "new") {
    setEditing(target)
    setForm(toForm(config, target === "new" ? null : target))
    setError(null)
  }

  function save() {
    startTransition(async () => {
      const result = await saveProductAction(config.table, editing === "new" || !editing ? null : editing.id, form)
      if (result.ok) {
        setEditing(null)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  function confirmDelete() {
    if (!toDelete) return
    const target = toDelete
    startTransition(async () => {
      const result = await deleteProductAction(config.table, target.id)
      if (result.ok) {
        setToDelete(null)
        setEditing(null)
        setDeleteError(null)
        router.refresh()
      } else {
        setDeleteError(result.error)
      }
    })
  }

  const formFields = config.fields.filter((f) => f.type !== "image")
  const imageField = config.fields.find((f) => f.type === "image")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}`}
            aria-label={`Search ${config.label.toLowerCase()}`}
            className="pl-9"
          />
        </div>
        <Button onClick={() => open("new")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add {config.singular}
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {records.length === 0 ? `No ${config.label.toLowerCase()} yet.` : "Nothing matches your search."}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {visible.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => open(record)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
              >
                <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
                  {record.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={String(record.image_url)} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No picture</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-graphite">{String(record.model)}</span>
                  <span className="block truncate text-xs text-muted-foreground">{summary(config, record)}</span>
                </span>
                {!record.is_active && <Badge variant="secondary">Hidden</Badge>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && !pending && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? `Add ${config.singular}` : `Edit ${config.singular}`}</DialogTitle>
            <DialogDescription>Saved changes go live in the configurator immediately.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {imageField && (
              <div className="space-y-2">
                <Label htmlFor={`field-${imageField.name}`}>{imageField.label}</Label>
                <FieldInput field={imageField} value={form[imageField.name] ?? ""} onChange={(v) => setForm((f) => ({ ...f, [imageField.name]: v }))} />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {formFields.map((field) => (
                <div key={field.name} className={field.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                  <Label htmlFor={`field-${field.name}`}>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  <FieldInput field={field} value={form[field.name] ?? ""} onChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))} />
                  {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                </div>
              ))}
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {editing && editing !== "new" ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => {
                  setDeleteError(null)
                  setToDelete(editing)
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={pending} onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" disabled={pending} onClick={save}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Save {config.singular}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete ? String(toDelete.model) : config.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it from the database. To keep it but stop showing it, turn off Visible in configurator instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
