'use client'

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import PlatformTabs from '@/components/PlatformTabs'
import FacebookDownloader from '@/components/platforms/FacebookDownloader'
import YoutubeDownloader from '@/components/platforms/YoutubeDownloader'
import TiktokDownloader from '@/components/platforms/TiktokDownloader'
import FeaturesSection from '@/components/FeaturesSection'
import BlogPreview from '@/components/blog/BlogPreview'
import HeroSection from '@/components/HeroSection'
import BannerAds from '@/components/Layout/BannerAds'
import SidebarAds from '@/components/Layout/SidebarAds'
import VideoRewardsAds from '@/components/Layout/VideoRewardsAds'

export default function Home() {
  const [activePlatform, setActivePlatform] = useState<'facebook' | 'youtube' | 'tiktok'>('facebook')

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

      {/* SIDEBARS GLOBALES - FUERA DEL MAIN */}
      <div className="flex">
        {/* Sidebar Left */}
        <aside className="hidden lg:block w-64 fixed left-0 top-20 h-[calc(100vh-5rem)] z-30">
          <SidebarAds position="left" />
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 container mx-auto px-4 py-8 main-with-sidebars">
          {/* 1. Hero Section */}
          <HeroSection />
          
          {/* Banner Top */}
          <div className="max-w-4xl mx-auto mb-8">
            <BannerAds />
          </div>

          {/* 2. Blog Preview */}
          <section className="max-w-4xl mx-auto mb-16">
            <BlogPreview />
          </section>

          {/* Video Rewards - DESPUÉS DEL BLOG */}
          <div className="max-w-4xl mx-auto mb-16">
            <VideoRewardsAds position="left" />
          </div>

          {/* Banner Middle */}
          <div className="max-w-4xl mx-auto mb-16">
            <BannerAds />
          </div>

          {/* 3. Herramientas - CON ID PARA SCROLL */}
          <section id="herramientas" className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Herramientas de Gestión de Contenido
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Utiliza nuestras herramientas profesionales para gestionar y respaldar tu contenido digital.
                </p>
              </div>

              {/* Platform Tabs */}
              <div className="max-w-4xl mx-auto mb-8">
                <PlatformTabs activePlatform={activePlatform} onPlatformChange={setActivePlatform} />
              </div>

              {/* Platform Content */}
              <div className="max-w-4xl mx-auto">
                {renderPlatform()}
              </div>

              {/* Video Rewards - DENTRO DE HERRAMIENTAS */}
              <div className="max-w-4xl mx-auto mt-8">
                <VideoRewardsAds position="left" />
              </div>

              {/* Aviso Legal */}
              <div className="max-w-4xl mx-auto mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  <strong>Aviso Legal:</strong> Para gestión de contenido propio. Respeta los derechos de autor.
                </p>
              </div>
            </div>
          </section>

          {/* Banner Bottom */}
          <div className="max-w-4xl mx-auto mb-16">
            <BannerAds />
          </div>

          {/* 4. Features Section */}
          <FeaturesSection />

          {/* Video Rewards - ANTES DEL FINAL */}
          <div className="max-w-4xl mx-auto mt-8">
            <VideoRewardsAds position="right" />
          </div>

          {/* Banner Final */}
          <div className="max-w-4xl mx-auto mt-16">
            <BannerAds />
          </div>
        </main>

        {/* Sidebar Right */}
        <aside className="hidden lg:block w-64 fixed right-0 top-20 h-[calc(100vh-5rem)] z-30">
          <SidebarAds position="right" />
        </aside>
      </div>

      <Footer />
    </div>
  )
}