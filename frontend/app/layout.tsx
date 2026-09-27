import React from "react"
import type { Metadata, Viewport } from 'next'

import './globals.css'
import 'ux4g-web-components/styles.css'
import 'ux4g-web-components/design-system'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: 'SkillifyAI — Official Statistical System Competency Platform',
  description: 'AI-enabled competency intelligence and capacity building platform for officials in India’s Official Statistical System',
  generator: 'v0.app',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="%231a365d"/><text x="128" y="180" fontSize="120" fill="white" textAnchor="middle" fontWeight="bold">S</text></svg>',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
