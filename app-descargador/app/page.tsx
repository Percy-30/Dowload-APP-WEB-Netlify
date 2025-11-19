'use client'

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import PlatformTabs from '@/components/PlatformTabs'
import FacebookDownloader from '@/components/platforms/FacebookDownloader'
import YoutubeDownloader from '@/components/platforms/YoutubeDownloader'
import TiktokDownloader from '@/components/platforms/TiktokDownloader'
import FeaturesSection from '@/components/FeaturesSection'

import SidebarAds from '@/components/Layout/SidebarAds'
import BannerAds from '@/components/Layout/BannerAds'
import VideoRewardsAds from '@/components/Layout/VideoRewardsAds'

type Platform = 'facebook' | 'youtube' | 'tiktok'

export default function Home() {
  const [activePlatform, setActivePlatform] = useState<Platform>('facebook')

  const renderPlatform = () => {
    switch (activePlatform) {
      case 'facebook':
        return <FacebookDownloader />
      case 'youtube':
        return <YoutubeDownloader />
      case 'tiktok':
        return <TiktokDownloader />
      default:
        return <FacebookDownloader />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Descarga Videos de <span className="text-blue-600">Facebook, YouTube y TikTok</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Con FTY Downloader puedes descargar videos y audios de tus plataformas favoritas en segundos, gratis y en la mejor calidad.
          </p>
        </section>

        {/* Platform Tabs */}
        <section className="max-w-4xl mx-auto mb-8">
          <PlatformTabs activePlatform={activePlatform} onPlatformChange={setActivePlatform} />
        </section>

        {/* Platform Content con Sidebars */}
        <section className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          <aside className="hidden md:block w-64">
            <SidebarAds position="left" />
          </aside>

          <div className="flex-1">
            {renderPlatform()}

            <div className="mt-8">
              <VideoRewardsAds position="left" />
            </div>
          </div>

          <aside className="hidden md:block w-64">
            <SidebarAds position="right" />
          </aside>
        </section>

        {/* Features y banners */}
        <section className="max-w-6xl mx-auto mt-12">
          <BannerAds />
          <FeaturesSection />
          <BannerAds />
        </section>

        {/* SEO-friendly tutorial */}
        <section className="max-w-4xl mx-auto mt-12 text-gray-700">
          <h2 className="text-2xl font-bold mb-4">Cómo descargar videos con FTY Downloader</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Selecciona la plataforma: Facebook, YouTube o TikTok.</li>
            <li>Pega la URL del video que deseas descargar.</li>
            <li>Elige la calidad de video o audio.</li>
            <li>Haz clic en "Descargar" y espera unos segundos.</li>
            <li>Disfruta tu video en tu dispositivo.</li>
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  )
}
