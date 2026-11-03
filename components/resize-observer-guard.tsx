"use client"

import { useEffect } from "react"

const BENIGN_MESSAGES = [
  "ResizeObserver loop completed with undelivered notifications",
  "ResizeObserver loop limit exceeded",
]

function isBenignResizeObserverError(message: unknown) {
  return typeof message === "string" && BENIGN_MESSAGES.some((m) => message.includes(m))
}

/**
 * The browser fires this error when a ResizeObserver callback triggers another
 * layout change in the same frame (common with responsive charts and
 * auto-sizing containers). It is harmless and the layout still settles, but
 * dev overlays report it as a runtime error. We stop it from propagating.
 */
export function ResizeObserverGuard() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isBenignResizeObserverError(event.message)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }
    window.addEventListener("error", onError, true)
    return () => window.removeEventListener("error", onError, true)
  }, [])

  return null
}
