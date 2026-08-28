import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})
const _geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
