"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PRODUCT_TABLES, type ProductRecord } from "@/lib/admin/product-schema"
import { ContentEditor, type ContentRow } from "./content-editor"
import { ProductManager } from "./product-manager"

type Props = {
  content: ContentRow[]
  products: Record<string, ProductRecord[]>
}

export function AdminTabs({ content, products }: Props) {
  return (
    <Tabs defaultValue="content" className="gap-6">
      <TabsList className="h-auto flex-wrap justify-start">
        <TabsTrigger value="content">Pictures and text</TabsTrigger>
        {PRODUCT_TABLES.map((t) => (
          <TabsTrigger key={t.table} value={t.table}>
            {t.label}
            <span className="ml-1.5 text-xs text-muted-foreground">{products[t.table]?.length ?? 0}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="content">
        <ContentEditor rows={content} />
      </TabsContent>
      {PRODUCT_TABLES.map((t) => (
        <TabsContent key={t.table} value={t.table}>
          <ProductManager config={t} records={products[t.table] ?? []} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
