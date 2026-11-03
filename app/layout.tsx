import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/lib/i18n/provider'
import { ResizeObserverGuard } from '@/components/resize-observer-guard'
import { HTML_LANG } from '@/lib/i18n/config'
import { getServerLocale, getTranslationOverrides } from '@/lib/i18n/server'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ananda E-Drive | System Configurator',
  description: 'Pre-sales engineering tool for configuring complete Ananda E-Drive e-bike drivetrain and electrical systems.',
  generator: 'v0.app',
}

export const viewport = {
  themeColor: '#008F36',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [locale, overrides] = await Promise.all([getServerLocale(), getTranslationOverrides()])

  return (
    <html lang={HTML_LANG[locale]} className={`bg-background ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <ResizeObserverGuard />
        <I18nProvider initialLocale={locale} overrides={overrides}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
