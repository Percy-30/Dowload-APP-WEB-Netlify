'use client'

import { useState } from 'react'
import { useEffect } from 'react'; // ya que no lo habías importado


interface VideoFormat {
  quality: string
  format: string
  resolution: string
  size: string
  url: string
  hasAudio?: boolean
  format_code?: string
}

interface DownloadResponse {
  status: string
  platform: string
  title: string
  thumbnail: string
  duration: number
  width?: number
  height?: number
  method: string
  formats?: VideoFormat[]
  original_url?: string
}

// Opciones de calidad predefinidas
const predefinedQualities = [
  { label: 'Mejor Calidad Disponible', value: 'best', ext: 'mp4' },
  { label: '1080p (.mp4)', value: '1080', ext: 'mp4' },
  { label: '720p (.mp4)', value: '720', ext: 'mp4' },
  { label: '480p (.mp4)', value: '480', ext: 'mp4' },
  { label: '360p (.mp4)', value: '360', ext: 'mp4' },
]

export default function FacebookDownloader() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoInfo, setVideoInfo] = useState<DownloadResponse | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const [showAd, setShowAd] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [adCountdown, setAdCountdown] = useState(5); // temporizador 5 segundos



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
      setError('Por favor, ingresa un enlace válido de Facebook')
      return
    }

    setIsLoading(true)
    setError(null)
    setVideoInfo(null)

    try {
      const response = await fetch('/api/download/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Error al procesar el video')

      if (data.status === 'success') {
        setVideoInfo(data)
        setUrl('') // ✅ limpia el campo después de analizar correctamente el video
      } else {
        throw new Error(data.message || 'Error desconocido')
      }

    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error al procesar el video de Facebook')
    } finally {
      setIsLoading(false)
    }
  }

  // Descargar video (con audio garantizado)
  const handleDownload = async (quality: string = 'best', fileExt: string = 'mp4') => {
    if (!videoInfo?.original_url) {
      setError('No hay información de video disponible')
      return
    }

    try {
      setDownloading(quality)

      const response = await fetch('/api/download/facebook/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoInfo.original_url, quality })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || 'Error al descargar el video')
      }

      const blob = await response.blob()
      if (blob.size === 0) throw new Error('El archivo descargado está vacío')

      const filename = `facebook_${quality}_${Date.now()}.${fileExt}`
      const urlObject = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = urlObject
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlObject)

    } catch (error) {
      console.error('Error descargando video:', error)
      setError('Error al descargar video: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setDownloading(null)
    }
  }

  // Descargar audio
  const handleAudioDownload = async () => {
    if (!videoInfo?.original_url) {
      setError('No hay información de video disponible')
      return
    }

    try {
      setDownloading('audio')
      const response = await fetch('/api/download/facebook/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoInfo.original_url })
      })

      if (!response.ok) throw new Error('Error al descargar el audio')

      const blob = await response.blob()
      if (blob.size === 0) throw new Error('El archivo de audio está vacío')

      const filename = `facebook_audio_${Date.now()}.mp3`
      const urlObject = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = urlObject
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlObject)

    } catch (error) {
      console.error('Error descargando audio:', error)
      setError('Error al descargar audio: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setDownloading(null)
    }
  }

  // Función que envuelve cualquier descarga con el anuncio
  const handleDownloadWithAdsssss = (downloadFn: () => void) => {
    setPendingAction(() => downloadFn); // guarda la acción pendiente
    setShowAd(true); // muestra el modal
  };

  const handleDownloadWithAd = (downloadFn: () => void) => {
    setPendingAction(() => downloadFn); // guarda la acción pendiente
    setAdCountdown(5); // reinicia contador
    setShowAd(true); // muestra el modal
  };


  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      : `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

 
  useEffect(() => {
    if (!showAd) return; // solo cuando el modal está visible
    if (adCountdown <= 0) return;

    const timer = setInterval(() => {
      setAdCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showAd, adCountdown]);



  return (
  <>
    {/* Modal del anuncio */}
    {showAd && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
          <h2 className="text-lg font-bold mb-4">Antes de descargar</h2>
          <p className="mb-4">Mira este anuncio o espera {adCountdown} segundos para continuar.</p>

          {/* Placeholder de anuncio */}
          <div className="bg-gray-200 h-32 mb-4 flex items-center justify-center">
            <span>Anuncio</span>
          </div>

          <div className="flex justify-center gap-2">
            <button
              className={`bg-blue-600 text-white px-4 py-2 rounded ${adCountdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={adCountdown > 0}
              onClick={() => {
                setShowAd(false)
                pendingAction?.() // ejecuta la acción pendiente (descarga)
                setPendingAction(null)
              }}
            >
              Continuar
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => {
                setShowAd(false)
                setPendingAction(null)
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Contenido principal */}
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
      <div className="text-center mb-6">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Descargar de Facebook
        </h2>
        <p className="text-gray-600">Pega el enlace del video de Facebook</p>
      </div>

      {/* Formulario de URL */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
              setVideoInfo(null)
            }}
            placeholder="https://www.facebook.com/watch/?v=1167532238841674"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar Video
              </>
            )}
          </button>
        </div>

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

      {/* Resultado del video */}
      {videoInfo && (
        <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800">¡Video listo para descargar!</h3>
            </div>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">{videoInfo.method}</span>
          </div>

          {/* Información y miniatura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {videoInfo.thumbnail && (
              <div className="md:col-span-1">
                <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-40 object-cover rounded-lg" />
              </div>
            )}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{videoInfo.title}</h4>
              <div className="text-xs text-gray-600 space-y-2">
                <div className="flex flex-wrap gap-4">
                  <p>⏱️ {formatDuration(videoInfo.duration)}</p>
                  {videoInfo.width && videoInfo.height && <p>{videoInfo.width}x{videoInfo.height}</p>}
                </div>
                <p className="text-green-600 font-medium">✅ Calidades disponibles con audio</p>
              </div>
            </div>
          </div>

          {/* Botón de audio */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4"># Audio</h4>
            <button
              //onClick={handleAudioDownload}
              onClick={() => handleDownloadWithAd(handleAudioDownload)}
              disabled={!!downloading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                downloading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {downloading === 'audio' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Descargando...
                </>
              ) : (
                <>🎧 Descargar Audio (MP3)</>
              )}
            </button>
          </div>

          {/* Tabla de video */}
          <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">## Video</h4>
            <p className="text-gray-600 mb-4">- Calidades Disponibles CON AUDIO</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">File type</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Format</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {predefinedQualities.map((quality) => {
                    const isDownloading = downloading === quality.value
                    return (
                      <tr key={quality.value} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-gray-800 font-medium">{quality.label}</td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-600">Auto</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <button
                          //onClick={() => handleDownload(quality.value, quality.ext)}
                            onClick={() => handleDownloadWithAd(() => handleDownload(quality.value, quality.ext))}
                            disabled={isDownloading}
                            className={`py-2 px-4 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center w-full ${
                              !isDownloading
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isDownloading ? 'Descargando...' : 'Download'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Ejemplos */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-blue-800 mb-1">Ejemplos de Facebook:</p>
        <div className="text-xs text-blue-700 space-y-1 font-mono">
          <div>• https://www.facebook.com/watch/?v=1167532238841674</div>
          <div>• https://fb.watch/abc123def/</div>
          <div>• https://www.facebook.com/share/v/1Myuqgmx2r/</div>
        </div>
      </div>

      {/* Información */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Formatos soportados: MP4, MP3. Calidades desde 360p hasta 1080p y mejor calidad disponible</span>
        </div>
      </div>
    </div>
  </>
)
}
