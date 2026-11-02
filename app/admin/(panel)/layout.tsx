import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/admin/actions"
import { requireAdminPage } from "@/lib/admin/session"
import { Button } from "@/components/ui/button"

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const username = await requireAdminPage()

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ananda-logo.png" alt="Ananda eDriveALL" className="h-7 w-auto shrink-0" />
            <span className="truncate text-sm font-semibold text-graphite">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">Signed in as {username}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
