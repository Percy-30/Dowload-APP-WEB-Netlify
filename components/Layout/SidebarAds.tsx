'use client'

import { useState } from 'react'

interface SidebarAdsProps {
  position?: 'left' | 'right'
}

interface Ad {
  id: number
  title: string
  description: string
  cta: string
  color: string
  icon: string
  price: string
}

export default function SidebarAds({ position = 'right' }: SidebarAdsProps) {
  const [clickedAds, setClickedAds] = useState<number[]>([])

  const handleAdClick = (adIndex: number) => {
    setClickedAds(prev => [...prev, adIndex])
    alert(`🎉 ¡Anuncio ${adIndex + 1} clickeado! (Este es un anuncio de prueba)`)
  }

  const ads: Ad[] = [
    { id: 1, title: "🔥 Herramientas Premium", description: "Convierte videos a MP3, descarga playlists completas y más", cta: "Probar Gratis", color: "from-purple-500 to-pink-500", icon: "🎵", price: "Gratis" },
    { id: 2, title: "🚀 Descargas Ilimitadas", description: "Sin límites de descarga, máxima velocidad garantizada", cta: "Ver Planes", color: "from-blue-500 to-cyan-500", icon: "⚡", price: "$4.99/mes" },
    { id: 3, title: "💎 Soporte Premium", description: "Asistencia técnica 24/7 y actualizaciones exclusivas", cta: "Contactar", color: "from-green-500 to-emerald-500", icon: "👑", price: "$9.99/mes" }
  ]

  return (
    <div className={`space-y-6 sticky top-24 ${position === 'left' ? 'ml-0' : 'mr-0'}`}>
      
      {/* Anuncios de prueba interactivos */}
      {ads.map((ad, index) => (
        <div 
          key={ad.id}
          onClick={() => handleAdClick(index)}
          className={`bg-white rounded-xl shadow-lg border-2 ${
            clickedAds.includes(index) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400'
          } overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-200`}
        >
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
          {clickedAds.includes(index) && (
            <div className="bg-green-500 text-white text-xs text-center py-1">
              ✅ ¡Anuncio visto!
            </div>
          )}
        </div>
      ))}

      {/* Banner de prueba */}
      <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs bg-white text-orange-600 px-2 py-1 rounded-full font-bold">OFERTA</span>
            <span className="text-xs">🔥 Limited Time</span>
          </div>
          <h3 className="font-bold text-lg mb-1">50% DESCUENTO</h3>
          <p className="text-xs opacity-90 mb-3">Plan Premium por tiempo limitado</p>
          <button 
            onClick={() => alert('🎉 ¡Oferta especial activada!')}
            className="w-full bg-white text-orange-600 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            Obtener Oferta
          </button>
        </div>
      </div>

      {/* Espacio para anuncios externos */}
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-300 transition-colors">
        <div className="text-gray-500 text-sm mb-2">📢 Espacio Publicitario</div>
        <div className="text-xs text-gray-400 mb-3">Anuncio 300x600</div>
        <button 
          onClick={() => alert('💼 ¿Quieres publicar tu anuncio aquí?')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-4 rounded transition-colors"
        >
          Publicar Anuncio
        </button>
      </div>
    </div>
  )
}
