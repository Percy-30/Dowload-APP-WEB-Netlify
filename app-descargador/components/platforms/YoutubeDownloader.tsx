'use client'

import { useState } from 'react'
import { useEffect } from 'react'; // ya que no lo habías importado

interface VideoFormat {
  quality: string
  format: string
  resolution: string
  size: string
  url: string
  codec?: string
  hasAudio?: boolean
}

interface DownloadResponse {
  status: string
  platform: string
  title: string
  thumbnail: string
  video_url: string
  duration: number
  width?: number
  height?: number
  method: string
  formats?: VideoFormat[]
  channel?: string
  viewCount?: number
}

// Definir las calidades predefinidas que queremos mostrar
const predefinedQualities = [
  { label: '1440p (2K) .mp4', value: '1440p', ext: 'mp4' },
  { label: '2160p (4K) .mp4', value: '2160p', ext: 'mp4' },
  { label: '1080p (.mp4)', value: '1080p', ext: 'mp4' },
  { label: '720p (.mp4)', value: '720p', ext: 'mp4' },
  { label: '360p (.mp4)', value: '360p', ext: 'mp4' },
  { label: '240p (.mp4)', value: '240p', ext: 'mp4' },
  { label: '144p (.mp4)', value: '144p', ext: 'mp4' }
]

export default function YoutubeDownloader() {
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
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Por favor, ingresa un enlace válido de YouTube')
      return
    }

    setIsLoading(true)
    setError(null)
    setVideoInfo(null)

    try {
      const response = await fetch('/api/download/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el video')
      }

      if (data.status === 'success') {
        setVideoInfo(data)
        setUrl('') // ✅ limpia el campo después de analizar correctamente el video
      } else {
        throw new Error(data.message || 'Error desconocido')
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar el video')
    } finally {
      setIsLoading(false)
    }
  }

  // Función mejorada para descargar a través del backend
  // ✅ VERSIÓN SIMPLIFICADA - Más fácil de debuggear
const downloadThroughBackend = async (downloadUrl: string, filename: string, quality?: string) => {
  try {
    setDownloading(quality || 'audio')
    console.log('⬇️ Iniciando descarga...', { quality, filename })
    
    const response = await fetch('/api/download/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: downloadUrl,
        filename: filename
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Error ${response.status}`)
    }

    const blob = await response.blob()
    
    if (blob.size === 0) {
      throw new Error('El archivo recibido está vacío')
    }
    
    console.log('✅ Descarga exitosa:', blob.size, 'bytes')
    
    // Descargar archivo
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Liberar memoria
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
    
  } catch (error) {
    console.error('❌ Error en descarga:', error)
    
    // Fallback a descarga directa
    console.log('🔄 Intentando descarga directa...')
    try {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('📥 Descarga directa iniciada')
    } catch (fallbackError) {
      console.error('❌ Error en descarga directa:', fallbackError)
      throw new Error('No se pudo descargar el archivo')
    }
  } finally {
    // ✅ ESTO SIEMPRE SE EJECUTA - limpia el estado
    setDownloading(null)
    console.log('🧹 Estado de descarga limpiado')
  }
}

  // Función para encontrar el formato más cercano a la calidad solicitada
  const findBestFormatForQuality = (quality: string): VideoFormat | null => {
    if (!videoInfo?.formats) return null

    // Buscar formatos de video con audio
    const videoWithAudio = videoInfo.formats.filter(format => 
      format.url && 
      !format.quality.toLowerCase().includes('audio only') &&
      !format.quality.toLowerCase().includes('video only') &&
      format.hasAudio !== false
    )

    // Buscar coincidencia exacta primero
    let format = videoWithAudio.find(f => 
      f.quality.toLowerCase().includes(quality) || 
      f.resolution.includes(quality) ||
      (quality === '1440p' && (f.resolution.includes('1440') || f.quality.toLowerCase().includes('1440'))) ||
      (quality === '2160p' && (f.resolution.includes('2160') || f.quality.toLowerCase().includes('2160') || f.quality.toLowerCase().includes('4k')))
    )

    // Si no encuentra coincidencia exacta, buscar la más cercana
    if (!format) {
      const qualityOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p']
      const currentQualityIndex = qualityOrder.indexOf(quality)
      
      for (let i = currentQualityIndex; i < qualityOrder.length; i++) {
        format = videoWithAudio.find(f => 
          f.resolution.includes(qualityOrder[i]) || 
          f.quality.toLowerCase().includes(qualityOrder[i])
        )
        if (format) break
      }
    }

    return format || null
  }

  // Buscar el mejor formato de audio disponible
  const findBestAudioFormat = (): VideoFormat | null => {
    if (!videoInfo?.formats) return null

    const audioFormats = videoInfo.formats.filter(format => 
      format.url && 
      (format.quality.toLowerCase().includes('audio') || 
       format.format.toLowerCase().includes('mp3') ||
       format.format.toLowerCase().includes('m4a') ||
       format.format.toLowerCase().includes('aac'))
    )

    // Ordenar por calidad (mejor calidad primero)
    audioFormats.sort((a, b) => {
      const getQualityValue = (quality: string) => {
        if (quality.includes('320')) return 320
        if (quality.includes('256')) return 256
        if (quality.includes('192')) return 192
        if (quality.includes('128')) return 128
        if (quality.includes('high')) return 200
        if (quality.includes('medium')) return 150
        if (quality.includes('low')) return 100
        return 0
      }
      return getQualityValue(b.quality) - getQualityValue(a.quality)
    })

    return audioFormats[0] || null
  }

  const handleDownload = async (quality: string, fileExt: string = 'mp4') => {
    const format = findBestFormatForQuality(quality)
    
    if (format && format.url) {
      const filename = `youtube_${quality}_${Date.now()}.${fileExt}`
      await downloadThroughBackend(format.url, filename, quality)
    } else {
      setError(`No se encontró la calidad ${quality} disponible`)
    }
  }

  const handleAudioDownload = async () => {
    if (!videoInfo?.formats) {
      setError('No hay información de video disponible')
      return
    }

    const audioFormat = findBestAudioFormat()

    if (audioFormat && audioFormat.url) {
      const ext = audioFormat.format.toLowerCase().includes('mp3') ? 'mp3' : 'm4a'
      const filename = `youtube_audio_${Date.now()}.${ext}`
      await downloadThroughBackend(audioFormat.url, filename)
    } else {
      setError('No se encontró formato de audio disponible para este video')
    }
  }

  // Función que envuelve cualquier descarga con el anuncio
  const handleDownloadWithAd = (downloadFn: () => void) => {
    setPendingAction(() => downloadFn); // guarda la acción pendiente
    setAdCountdown(5); // reinicia contador
    setShowAd(true); // muestra el modal
  };

  // Verificar si una calidad está disponible
  const isQualityAvailable = (quality: string): boolean => {
    return findBestFormatForQuality(quality) !== null
  }

  // Formatear duración de segundos a minutos:segundos
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Formatear números de visualizaciones
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M vistas`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K vistas`
    }
    return `${count} vistas`
  }

  // Obtener calidades disponibles
  const availableQualities = predefinedQualities.filter(quality => 
    isQualityAvailable(quality.value)
  )

  useEffect(() => {
  if (!showAd) return;
  // Si el countdown ya llegó a 0, ejecuta acción pendiente y cierra modal
  if (adCountdown <= 0) {
    setShowAd(false);
    pendingAction?.();
    setPendingAction(null);
    return;
  }

  const timer = setInterval(() => {
    setAdCountdown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [showAd, adCountdown, pendingAction]);



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
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Descargar de YouTube
        </h2>
        <p className="text-gray-600">
          Pega el enlace del video de YouTube
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
              setVideoInfo(null)
            }}
            placeholder="https://www.youtube.com/watch?v=abc123 o https://youtu.be/abc123"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center"
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

      {/* Resultado del Video */}
      {videoInfo && (
        <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800">¡Video listo para descargar!</h3>
            </div>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
              {videoInfo.method}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {videoInfo.thumbnail && (
              <div className="md:col-span-1">
                <img 
                  src={videoInfo.thumbnail} 
                  alt={videoInfo.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">{videoInfo.title}</h4>
              
              <div className="text-xs text-gray-600 space-y-2">
                {videoInfo.channel && (
                  <p className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {videoInfo.channel}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4">
                  <p className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ⏱️ {formatDuration(videoInfo.duration)}
                  </p>
                  
                  {videoInfo.viewCount && (
                    <p className="flex items-center">
                      <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatViewCount(videoInfo.viewCount)}
                    </p>
                  )}
                </div>
                
                <p className="text-green-600 font-medium">
                  ✅ {availableQualities.length} calidades de video disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Audio */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4"># Audio</h4>
            <button
            //onClick={handleAudioDownload}
              onClick={() => handleDownloadWithAd(handleAudioDownload)}
              disabled={!!downloading}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading === 'audio' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Descargando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Descargar Audio (MP3/M4A)
                </>
              )}
            </button>
          </div>

          {/* Sección de Video */}
          <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">## Video</h4>
            <p className="text-gray-600 mb-4">- Full HD</p>
            
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
                    const isAvailable = isQualityAvailable(quality.value)
                    const isDownloading = downloading === quality.value
                    
                    return (
                      <tr key={quality.value} className={`hover:bg-gray-50 ${!isAvailable ? 'opacity-50' : ''}`}>
                        <td className="border border-gray-300 px-4 py-3 text-gray-800 font-medium">
                          {quality.label}
                          {!isAvailable && (
                            <span className="text-xs text-red-500 ml-2">(No disponible)</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-600">
                          Auto
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <button
                            //onClick={() => handleDownload(quality.value, quality.ext)}
                            onClick={() => handleDownloadWithAd(() => handleDownload(quality.value, quality.ext))}
                            disabled={!isAvailable || !!downloading}
                            className={`py-2 px-4 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center w-full ${
                              isAvailable && !downloading
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isDownloading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Descargando...
                              </>
                            ) : isAvailable ? (
                              <>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </>
                            ) : (
                              'No disponible'
                            )}
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
      <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-semibold text-red-800">
            Ejemplos de YouTube:
          </p>
        </div>
        <div className="text-xs text-red-700 space-y-1">
          <div className="font-mono">• https://www.youtube.com/watch?v=dQw4w9WgXcQ</div>
          <div className="font-mono">• https://youtu.be/dQw4w9WgXcQ</div>
          <div className="font-mono">• https://www.youtube.com/embed/dQw4w9WgXcQ</div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Formatos soportados: MP4, WebM, MP3, M4A. Calidades desde 144p hasta 4K.</span>
        </div>
      </div>
    </div>
  </>
  )
}