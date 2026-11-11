"use client"

import { useEffect, useState, useTransition } from "react"
import type { User } from "@supabase/supabase-js"
import { Loader2, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EMPTY_PROFILE, useProfile, type UserProfile } from "@/lib/auth/use-auth"
import { useProjectsStore } from "@/lib/ananda-projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useT } from "@/lib/i18n/provider"

const FIELDS: { name: keyof UserProfile; label: string; type?: string; autoComplete: string }[] = [
  { name: "brand_name", label: "Brand name", autoComplete: "off" },
  { name: "company", label: "Company", autoComplete: "organization" },
  { name: "user_name", label: "User name", autoComplete: "name" },
  { name: "email", label: "Contact email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
]

export function ProfileForm({ user, onSignedOut }: { user: User; onSignedOut: () => void }) {
  const t = useT()
  const setBrandName = useProjectsStore((s) => s.setBrandName)
  const { profile, error: loadError, isLoading, save } = useProfile(user)
  const [draft, setDraft] = useState<UserProfile>({ ...EMPTY_PROFILE, email: user.email ?? "" })
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (profile) setDraft({ ...profile, email: profile.email || (user.email ?? "") })
  }, [profile, user.email])

  function update(name: keyof UserProfile, value: string) {
    setStatus(null)
    setDraft((d) => ({ ...d, [name]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      try {
        const next = Object.fromEntries(
          Object.entries(draft).map(([key, value]) => [key, value.trim()]),
        ) as UserProfile
        await save(next)
        setBrandName(next.brand_name)
        setStatus({ tone: "ok", text: t("Profile saved.") })
      } catch {
        setStatus({ tone: "error", text: t("Your profile could not be saved. Please try again.") })
      }
    })
  }

  async function signOut() {
    await createClient().auth.signOut()
    onSignedOut()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("Signed in as")} <span className="font-semibold text-graphite">{user.email}</span>
      </p>

      {loadError && (
        <p role="alert" className="text-sm text-destructive">
          {t("Your profile could not be loaded.")}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={`profile-${field.name}`}>{t(field.label)}</Label>
            <Input
              id={`profile-${field.name}`}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              maxLength={field.name === "brand_name" ? 60 : 120}
              disabled={isLoading}
              value={draft[field.name]}
              onChange={(e) => update(field.name, e.target.value)}
            />
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-address">{t("Address")}</Label>
          <Textarea
            id="profile-address"
            rows={2}
            autoComplete="street-address"
            maxLength={300}
            disabled={isLoading}
            value={draft.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button type="button" variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t("Log out")}
        </Button>
        <div className="flex items-center gap-3">
          <p
            role="status"
            className={status?.tone === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
          >
            {status?.text}
          </p>
          <Button type="submit" disabled={pending || isLoading}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {t("Save profile")}
          </Button>
        </div>
      </div>
    </form>
  )
}
