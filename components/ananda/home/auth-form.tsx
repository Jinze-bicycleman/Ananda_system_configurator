"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { signUpAction } from "@/app/auth/actions"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useT } from "@/lib/i18n/provider"

type Mode = "login" | "signup"

export function AuthForm({ onDone }: { onDone: () => void }) {
  const t = useT()
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function signIn() {
    const { error: signInError } = await createClient().auth.signInWithPassword({ email: email.trim(), password })
    if (signInError) {
      setError(t("Incorrect email or password."))
      return false
    }
    return true
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      if (mode === "signup") {
        const result = await signUpAction({ email, password, inviteCode })
        if (!result.ok) {
          setError(t(result.error))
          return
        }
      }
      if (await signIn()) onDone()
    })
  }

  const isSignup = mode === "signup"

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1" role="tablist">
        {(["login", "signup"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => switchMode(value)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              mode === value ? "bg-background text-graphite shadow-sm" : "text-muted-foreground hover:text-graphite"
            }`}
          >
            {value === "login" ? t("Log in") : t("Sign up")}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-email">{t("Email")}</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">{t("Password")}</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={isSignup ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignup && <p className="text-xs text-muted-foreground">{t("Use at least 8 characters.")}</p>}
        </div>
        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="auth-invite">{t("Invite code")}</Label>
            <Input
              id="auth-invite"
              autoComplete="off"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSignup ? t("Create account") : t("Log in")}
        </Button>
      </form>
    </div>
  )
}
