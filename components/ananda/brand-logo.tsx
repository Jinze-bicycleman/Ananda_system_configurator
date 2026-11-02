"use client"

import { useSiteContent } from "@/lib/site-content"

export function BrandLogo({ className }: { className?: string }) {
  const content = useSiteContent()
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={content.get("brand.logo")} alt="Ananda eDriveALL" className={className} />
}
