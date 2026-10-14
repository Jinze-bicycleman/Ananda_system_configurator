import { ExternalLink } from "lucide-react"
import {
  APP_FEATURES,
  APP_INTRO,
  APP_LOGO_URL,
  APP_SUPPORT,
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
        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={APP_LOGO_URL} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl border border-border" />
            <div className="min-w-0">
              <p className="font-sans text-sm font-black uppercase leading-tight tracking-tight text-graphite text-balance">
                {APP_INTRO.headline}
              </p>
              <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground text-pretty">{APP_INTRO.body}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-wider text-primary">Key Features</p>
            <dl className="grid gap-x-6 gap-y-4 lg:grid-cols-2">
              {APP_FEATURES.map((feature) => (
                <div key={feature.title} className="min-w-0">
                  <dt className="font-sans text-xs font-bold uppercase tracking-wide text-graphite">{feature.title}</dt>
                  <dd className="mt-1 font-body text-xs leading-relaxed text-muted-foreground text-pretty">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wide text-graphite">{APP_SUPPORT.title}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 font-body text-xs leading-relaxed text-muted-foreground marker:text-primary">
              {APP_SUPPORT.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {hasLink && (
            <a
              href={OFFICIAL_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-primary underline-offset-4 hover:underline"
            >
              Learn more about Ananda Ride
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
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
