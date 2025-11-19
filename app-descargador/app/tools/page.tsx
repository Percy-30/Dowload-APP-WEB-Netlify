'use client'

import { useState } from 'react'
import PlatformTabs from '@/components/PlatformTabs'
import FacebookDownloader from '@/components/platforms/FacebookDownloader'
import YoutubeDownloader from '@/components/platforms/YoutubeDownloader'
import TiktokDownloader from '@/components/platforms/TiktokDownloader'

export default function ToolsPage() {
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
    <div className="container mx-auto px-4 py-8">
      {/* Header de la página */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Herramientas de Descarga
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Descarga videos de tus plataformas favoritas de forma rápida, segura y gratuita.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">100%</div>
          <div className="text-gray-700">Gratuito</div>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">3</div>
          <div className="text-gray-700">Plataformas</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">HD</div>
          <div className="text-gray-700">Calidad Máxima</div>
        </div>
      </div>

      {/* Descargador principal */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <div className="max-w-4xl mx-auto">
          <PlatformTabs activePlatform={activePlatform} onPlatformChange={setActivePlatform} />
          <div className="mt-8">
            {renderPlatform()}
          </div>
        </div>
      </div>

      {/* Instrucciones de uso */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">¿Cómo descargar videos?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Copia el enlace</h3>
            <p className="text-gray-600 text-sm">
              Copia la URL del video que quieres descargar desde YouTube, Facebook o TikTok.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Pega y elige calidad</h3>
            <p className="text-gray-600 text-sm">
              Pega el enlace en nuestro descargador y selecciona la calidad deseada.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Descarga y disfruta</h3>
            <p className="text-gray-600 text-sm">
              Haz clic en descargar y en segundos tendrás tu video listo para ver.
            </p>
          </div>
        </div>
      </div>

      {/* Aviso legal */}
      <div className="max-w-4xl mx-auto mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 text-center">
          <strong>Aviso Legal:</strong> FTYDownloader Pro está diseñado para descargar contenido personal 
          o con los permisos adecuados. Respetamos los derechos de autor y promovemos el uso responsable.
        </p>
      </div>
    </div>
  )
}