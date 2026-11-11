import { createAdminClient } from "@/lib/admin/supabase-admin"
import { PRODUCT_TABLES, type ProductRecord } from "@/lib/admin/product-schema"
import { AdminTabs } from "@/components/admin/admin-tabs"
import type { ContentRow } from "@/components/admin/content-editor"
import type { TranslationRow } from "@/components/admin/translation-editor"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [content, translations, settings, ...products] = await Promise.all([
    supabase.from("site_content").select("key, label, section, kind, value, sort_order").order("sort_order"),
    supabase.from("site_translations").select("locale, source, value"),
    supabase.from("app_settings").select("value").eq("key", "signup_invite_code").maybeSingle(),
    ...PRODUCT_TABLES.map((t) => supabase.from(t.table).select("*").order("sort_order").order("model")),
  ])

  const productData = Object.fromEntries(
    PRODUCT_TABLES.map((t, i) => [t.table, (products[i].data ?? []) as unknown as ProductRecord[]]),
  )
  const loadError = [content, translations, settings, ...products].find((r) => r.error)?.error?.message
  const inviteCode = String((settings.data as { value?: string } | null)?.value ?? "")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-graphite">Content manager</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes are saved to the database and appear in the configurator straight away.
        </p>
      </div>
      {loadError && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Some data could not be loaded: {loadError}
        </p>
      )}
      <AdminTabs
        content={(content.data ?? []) as ContentRow[]}
        products={productData}
        translations={(translations.data ?? []) as TranslationRow[]}
        inviteCode={inviteCode}
      />
    </div>
  )
}
