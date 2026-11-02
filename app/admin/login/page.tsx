import { redirect } from "next/navigation"
import { getAdminUsername } from "@/lib/admin/session"
import { LoginForm } from "@/components/admin/login-form"

export default async function AdminLoginPage() {
  if (await getAdminUsername()) redirect("/admin")

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ananda-logo.png" alt="Ananda eDriveALL" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-semibold text-graphite">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage products, pictures and text for the configurator.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
