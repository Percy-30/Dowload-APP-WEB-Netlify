'use client'

import { useState } from 'react'

interface VideoReguardsProps {
  position: 'left' | 'right'
}

export default function VideoReguards({ position }: VideoReguardsProps) {
  const [clickedAds, setClickedAds] = useState<number[]>([])

  const handleAdClick = (adIndex: number) => {
    setClickedAds(prev => [...prev, adIndex])
    alert(`🎉 ¡Anuncio ${adIndex + 1} clickeado! (Este es un anuncio de prueba)`)
  }

  const ads = [
    {
      id: 1,
      type: 'video', // 'video' o 'banner'
      src: '/videos/demo-ad.mp4', // video local o URL
      title: "🎬 Promo Video",
      description: "Video demostrativo de nuestro plan premium",
      cta: "Ver Más",
    },
    {
      id: 2,
      type: 'banner',
      title: "🔥 Herramientas Premium",
      description: "Convierte videos a MP3, descarga playlists completas y más",
      cta: "Probar Gratis",
      color: "from-purple-500 to-pink-500",
      icon: "🎵",
      price: "Gratis"
    },
    {
      id: 3,
      type: 'video',
      src: '/videos/demo2.mp4',
      title: "🚀 Descargas Ilimitadas",
      description: "Sin límites de descarga, máxima velocidad garantizada",
      cta: "Ver Planes",
    }
  ]

  return (
    <div className="space-y-6 sticky top-24">
      {ads.map((ad, index) => (
        <div 
          key={ad.id}
          onClick={() => handleAdClick(index)}
          className={`overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-200 rounded-xl shadow-lg border-2 ${
            clickedAds.includes(index) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400'
          }`}
        >
          {ad.type === 'video' ? (
            <div>
              <video
                className="w-full rounded-t-xl"
                src={ad.src}
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{ad.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{ad.description}</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-sm">
                  {ad.cta}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className={`h-1 bg-gradient-to-r ${ad.color}`}></div>
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{ad.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{ad.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{ad.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{ad.price}</span>
                      <button className="bg-gray-900 hover:bg-gray-800 text-white py-1 px-3 rounded-lg text-xs font-semibold transition-colors">
                        {ad.cta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {clickedAds.includes(index) && (
            <div className="bg-green-500 text-white text-xs text-center py-1">
              ✅ ¡Anuncio visto!
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
