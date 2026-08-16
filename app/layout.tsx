import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const _barlow = Barlow({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body'
})
const _barlowCondensed = Barlow_Condensed({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans'
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
