import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// ✅ VIEWPORT SEPARADO - Nuevo en Next.js 15
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

// ✅ METADATA SIN VIEWPORT - Solo metadatos tradicionales
export const metadata: Metadata = {
  title: 'FDownloader Pro - Descargar Videos de Facebook',
  description:
    'Descarga videos de Facebook gratis, rápido y en alta calidad. 100% responsive para móviles.',
  keywords:
    'descargar facebook, video downloader, facebook video, descargar videos',
  authors: [{ name: 'FDownloader Team' }],
  manifest: '/manifest.json',
  // ❌ ELIMINADO: viewport y themeColor de aquí
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}