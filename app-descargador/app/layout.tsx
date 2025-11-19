// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export const metadata: Metadata = {
  title: 'FTY Downloader Pro - Descargar Videos de Facebook, YouTube y TikTok',
  description:
    'Descarga videos y audios de Facebook, YouTube y TikTok gratis, rápido y en alta calidad. Compatible con móviles y PC.',
  keywords: `
descargar videos gratis, descargar videos de YouTube, youtube downloader,
descargar videos de TikTok, tiktok downloader, descargar videos de Facebook,
facebook downloader, convertir video a mp3, descargar mp4 gratis,
bajar videos online, descargar videos para celular, youtube mp4,
tiktok mp4, facebook mp4, downloader online, descargar videos sin marca de agua, descargar videos tiktok sin marca de agua
`,
  authors: [{ name: 'ATP DEV', url: 'https://fty-downloader-pro.netlify.app/' }],
  creator: 'ATP DEV',
  publisher: 'FTY Downloader',
  manifest: '/manifest.json',
  openGraph: {
    title: 'FTY Downloader Pro - Descarga Videos Gratis',
    description:
      'Descarga videos y audios de Facebook, YouTube y TikTok gratis, rápido y seguro con FTY Downloader.',
    url: 'https://fty-downloader-pro.netlify.app/',
    siteName: 'FTY Downloader',
    images: [
      {
        url: 'https://fty-downloader-pro.netlify.app/icons/icon-512.png',
        width: 512,
        height: 512,
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FTY Downloader Pro - Descarga Videos Gratis',
    description:
      'Descarga videos y audios de Facebook, YouTube y TikTok gratis, rápido y seguro con FTY Downloader.',
    images: ['https://fty-downloader-pro.netlify.app/icons/icon-512.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5414009811868137"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
