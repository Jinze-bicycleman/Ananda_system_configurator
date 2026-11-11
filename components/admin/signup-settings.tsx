"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { saveInviteCodeAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupSettings({ inviteCode }: { inviteCode: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(inviteCode)
  const [draft, setDraft] = useState(inviteCode)
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null)

  const dirty = draft.trim() !== saved

  function save() {
    startTransition(async () => {
      const result = await saveInviteCodeAction(draft)
      if (result.ok) {
        setSaved(draft.trim())
        setDraft(draft.trim())
        setStatus({ tone: "ok", text: "Invite code saved. New sign-ups must use it." })
        router.refresh()
      } else {
        setStatus({ tone: "error", text: result.error })
      }
    })
  }

  return (
    <section className="max-w-xl rounded-xl border border-border bg-card">
      <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-graphite">Sign-up</h2>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Label htmlFor="invite-code">Invite code</Label>
          <Input
            id="invite-code"
            value={draft}
            maxLength={64}
            autoComplete="off"
            onChange={(e) => {
              setStatus(null)
              setDraft(e.target.value)
            }}
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            New users must enter this code to create an account. The code is not case sensitive, and existing accounts
            are not affected when you change it.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p
            role="status"
            className={status?.tone === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
          >
            {status?.text ?? (dirty ? "Unsaved change" : "All changes saved")}
          </p>
          <Button onClick={save} disabled={pending || !dirty}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Save code
          </Button>
        </div>
      </div>
    </section>
  )
}
