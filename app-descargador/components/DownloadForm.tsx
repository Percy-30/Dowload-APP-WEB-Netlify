'use client'

import { useState } from 'react'
import { simulateVideoProcessing, downloadVideo } from '@/lib/video-service'
import { isValidFacebookUrl } from '@/lib/validators'

export default function DownloadForm() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidFacebookUrl(url)) {
      setError('Por favor, ingresa un enlace válido de Facebook')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // ✅ USAR ESTA LÍNEA para servicio real (cuando tengas backend)
       const videoInfo = await downloadVideo(url)
      
      // ✅ USAR ESTA LÍNEA para simulación (mientras configuras backend)
      //const videoInfo = await simulateVideoProcessing(url)
      
      // Mostrar resultados en la consola para debug
      console.log('Video info obtenida:', videoInfo)
      
      // Aquí podrías actualizar un estado global o mostrar los resultados
      alert(`✅ Video procesado: ${videoInfo.title}\nFormatos disponibles: ${videoInfo.formats.length}`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const examples = [
    'https://www.facebook.com/share/v/1Myuqgmx2r/',
    'https://www.facebook.com/watch/?v=123456789',
    'https://fb.watch/abc123def/',
    'https://www.facebook.com/usuario/videos/123456789'
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
      <div className="text-center mb-6">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Descargar Video
        </h2>
        <p className="text-gray-600">
          Pega el enlace del video de Facebook y descarga en alta calidad
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
            }}
            placeholder="https://www.facebook.com/share/v/1Myuqgmx2r/"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar
              </>
            )}
          </button>
        </div>
        
        {/* Mostrar error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}
      </form>

      {/* Ejemplos */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-semibold text-blue-800">
            Ejemplos de enlaces válidos:
          </p>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          {examples.map((example, index) => (
            <div key={index} className="font-mono">• {example}</div>
          ))}
        </div>
      </div>
    </div>
  )
}