"use client"

import { useEffect, useState } from "react"
import { CircleUserRound } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuthUser, useProfile } from "@/lib/auth/use-auth"
import { useProjectsStore } from "@/lib/ananda-projects"
import { useT } from "@/lib/i18n/provider"
import { AuthForm } from "./auth-form"
import { ProfileForm } from "./profile-form"

export function UserMenu() {
  const t = useT()
  const { user, ready } = useAuthUser()
  const { profile } = useProfile(user)
  const setBrandName = useProjectsStore((s) => s.setBrandName)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (profile?.brand_name) setBrandName(profile.brand_name)
  }, [profile?.brand_name, setBrandName])

  const label = !ready ? "" : user ? profile?.user_name || user.email || t("Profile") : t("Log in")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex max-w-48 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-graphite transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <CircleUserRound className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="truncate">{label || t("Account")}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{user ? t("Your profile") : t("Welcome to Ananda")}</DialogTitle>
          <DialogDescription>
            {user
              ? t("These details are saved to your account and used in your reports.")
              : t("Log in, or sign up with your email and an invite code.")}
          </DialogDescription>
        </DialogHeader>
        {user ? (
          <ProfileForm user={user} onSignedOut={() => setOpen(false)} />
        ) : (
          <AuthForm onDone={() => setOpen(true)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
