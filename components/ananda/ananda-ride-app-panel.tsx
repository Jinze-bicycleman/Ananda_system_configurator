"use client"

import { ExternalLink } from "lucide-react"
import { APP_FEATURES, APP_UI_IMAGE_ALT } from "@/lib/ananda-ride-app-content"
import { useSiteContent } from "@/lib/site-content"

export function AnandaRideAppPanel() {
  const content = useSiteContent()
  const APP_UI_IMAGE_URL = content.get("app.ui_image")
  const APP_LOGO_URL = content.get("app.logo")
  const OFFICIAL_APP_URL = content.get("app.cta.url")
  const APP_INTRO = { headline: content.get("app.headline") }
  const APP_CTA = { text: content.get("app.cta.text"), label: content.get("app.cta.label") }
  const features = [1, 2, 3, 4, 5, 6]
    .map((n) => content.get(`app.feature.${n}`) || APP_FEATURES[n - 1] || "")
    .filter((f) => f.trim() !== "")
  const hasImage = APP_UI_IMAGE_URL.trim() !== ""
  const hasLink = OFFICIAL_APP_URL.trim() !== ""

  return (
    <div className="mt-3 border border-border p-4 md:p-5">
      <div className={hasImage ? "flex flex-col gap-6 md:flex-row md:items-start" : ""}>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={APP_LOGO_URL} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl border border-border" />
            <p className="text-sm font-semibold leading-tight text-graphite text-balance">
              {APP_INTRO.headline}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-primary">Key Features</p>
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs font-semibold text-graphite"
                >
                  <span className="h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {hasLink && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs leading-relaxed text-muted-foreground text-pretty">{APP_CTA.text}</p>
              <a
                href={OFFICIAL_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                {APP_CTA.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          )}
        </div>

        {hasImage && (
          <div className="flex shrink-0 items-start justify-center md:w-2/5 md:max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={APP_UI_IMAGE_URL} alt={APP_UI_IMAGE_ALT} className="h-auto max-h-[32rem] w-full object-contain" />
          </div>
        )}
      </div>
    </div>
  )
}
