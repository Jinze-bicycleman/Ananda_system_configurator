import { ExternalLink } from "lucide-react"
import {
  APP_CTA,
  APP_FEATURES,
  APP_INTRO,
  APP_LOGO_URL,
  APP_UI_IMAGE_ALT,
  APP_UI_IMAGE_URL,
  OFFICIAL_APP_URL,
} from "@/lib/ananda-ride-app-content"

export function AnandaRideAppPanel() {
  const hasImage = APP_UI_IMAGE_URL.trim() !== ""
  const hasLink = OFFICIAL_APP_URL.trim() !== ""

  return (
    <div className="mt-3 border border-border p-4 md:p-5">
      <div className={hasImage ? "flex flex-col gap-6 md:flex-row md:items-start" : ""}>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={APP_LOGO_URL} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl border border-border" />
            <p className="font-sans text-sm font-black uppercase leading-tight tracking-tight text-graphite text-balance">
              {APP_INTRO.headline}
            </p>
          </div>

          <div>
            <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-wider text-primary">Key Features</p>
            <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {APP_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wide text-graphite"
                >
                  <span className="h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {hasLink && (
            <div className="space-y-2 border-t border-border pt-4">
              <p className="font-body text-xs leading-relaxed text-muted-foreground text-pretty">{APP_CTA.text}</p>
              <a
                href={OFFICIAL_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-primary underline-offset-4 hover:underline"
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
