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
  duration: string
  uploader: string
  uploader_avatar?: string
  video_url: string
  method: string
  formats?: VideoFormat[]
  view_count?: number
}

// Definir las calidades predefinidas para TikTok
const predefinedQualities = [
  { label: 'Sin Marca de Agua - HD (.mp4)', value: 'nowatermark', ext: 'mp4' },
  { label: 'Con Marca de Agua (.mp4)', value: 'watermark', ext: 'mp4' },
  { label: 'Solo Audio (.mp3)', value: 'audio', ext: 'mp3' }
]

export default function TiktokDownloader() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoInfo, setVideoInfo] = useState<DownloadResponse | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const [showAd, setShowAd] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [adCountdown, setAdCountdown] = useState(5); // temporizador 5 segundos


  // Función para validar URL de TikTok
  const isValidTiktokUrl = (url: string) => {
    return url.includes('tiktok.com') || url.includes('vm.tiktok.com')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidTiktokUrl(url)) {
      setError('Por favor, ingresa un enlace válido de TikTok')
      return
    }

    setIsLoading(true)
    setError(null)
    setVideoInfo(null)

    try {
      const response = await fetch('/api/download/tiktok', {
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
        // Si no tiene status pero tiene formats, también es válido
        if (data.formats) {
          setVideoInfo(data)
        } else {
          throw new Error(data.message || 'Error desconocido')
        }
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar el video')
    } finally {
      setIsLoading(false)
    }
  }

  // Función de descarga directa (sin abrir nueva pestaña)
  const handleDownload = async (downloadUrl: string, quality: string, fileExt: string = 'mp4') => {
    try {
      setDownloading(quality)
      const filename = `tiktok_${quality}_${Date.now()}.${fileExt}`

      // Fetch siempre, incluso para URLs externas
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Error al descargar el archivo')

      const blob = await response.blob()
      const urlObject = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = urlObject
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(urlObject)
    } catch (error) {
      console.error('Error en descarga:', error)
      setError('Error al descargar el archivo: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setDownloading(null)
    }
    }

  

  // Función para descarga directa desde API
  const handleDirectDownload = async (quality: string, fileExt: string = 'mp4') => {
    if (!videoInfo) return

    try {
      setDownloading(quality)
      
      // Usar el endpoint GET para descarga directa
      const downloadUrl = `/api/download/tiktok?url=${encodeURIComponent(url)}&quality=${quality}`
      
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Error al descargar el archivo')
      
      const blob = await response.blob()
      const urlObject = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = urlObject
      link.download = `tiktok_${quality}_${Date.now()}.${fileExt}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar el URL creado
      window.URL.revokeObjectURL(urlObject)
      
    } catch (error) {
      console.error('Error en descarga:', error)
      setError('Error al descargar el archivo')
    } finally {
      setDownloading(null)
    }
  }


  // Función que envuelve cualquier descarga con el anuncio
  const handleDownloadWithAd = (downloadFn: () => void) => {
    setPendingAction(() => downloadFn); // guarda la acción pendiente
    setAdCountdown(5); // reinicia contador
    setShowAd(true); // muestra el modal
  };

  // Formatear números de visualizaciones
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M vistas`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K vistas`
    }
    return `${count} vistas`
  }


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
        <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Descargar de TikTok
        </h2>
        <p className="text-gray-600">
          Pega el enlace del video de TikTok
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
            placeholder="https://www.tiktok.com/@usuario/video/123456789 o https://vm.tiktok.com/abc123/"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            required
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center"
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
              {videoInfo.method || 'tiktok_api'}
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
                <div className="flex items-center space-x-4">
                  {videoInfo.uploader_avatar && (
                    <img 
                      src={videoInfo.uploader_avatar} 
                      alt={videoInfo.uploader}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <p className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {videoInfo.uploader}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <p className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ⏱️ {videoInfo.duration}
                  </p>
                  
                  {videoInfo.view_count && (
                    <p className="flex items-center">
                      <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {formatViewCount(videoInfo.view_count)}
                    </p>
                  )}
                </div>
                
                <p className="text-green-600 font-medium">
                  ✅ {videoInfo.formats?.length || 0} formatos disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Formatos Disponibles */}
          <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Formatos Disponibles</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Tipo de Archivo</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Formato</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {predefinedQualities.map((quality) => {
                    const format = videoInfo.formats?.find(f => 
                      f.quality.toLowerCase().includes(quality.value) ||
                      f.quality.toLowerCase().includes(quality.value.replace('nowatermark', 'sin marca'))
                    )
                    
                    const isAvailable = !!format
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
                          {format?.format || 'Auto'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <button
                            onClick={() => {
                              if (format) {
                                //handleDownload(format.url, quality.value, quality.ext)
                                handleDownloadWithAd(() => handleDownload(format.url, quality.value, quality.ext));
                              } else {
                                //handleDirectDownload(quality.value, quality.ext)
                                handleDownloadWithAd(() => handleDirectDownload(quality.value, quality.ext));
                              }
                            }}
                            disabled={!isAvailable || isDownloading}
                            className={`py-2 px-4 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center w-full ${
                              isAvailable && !isDownloading
                                ? 'bg-black hover:bg-gray-800 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isDownloading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                Descargando...
                              </>
                            ) : isAvailable ? (
                              <>
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar
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

          {/* Descarga Rápida - Sin Marca de Agua */}
          {videoInfo.formats?.some(f => f.quality.toLowerCase().includes('sin marca') || f.quality.toLowerCase().includes('nowatermark')) && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Descarga Rápida - Sin Marca de Agua
              </h4>
              <button
                onClick={() => {
                  const noWatermarkFormat = videoInfo.formats?.find(f => 
                    f.quality.toLowerCase().includes('sin marca') || f.quality.toLowerCase().includes('nowatermark')
                  )
                  if (noWatermarkFormat) {
                    //handleDownload(noWatermarkFormat.url, 'sin_marca_agua', 'mp4')
                    handleDownloadWithAd(() => handleDownload(noWatermarkFormat.url, 'sin_marca_agua', 'mp4'))

                  }
                }}
                disabled={!!downloading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  downloading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar Sin Marca de Agua
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ejemplos */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-semibold text-gray-800">
            Ejemplos de TikTok:
          </p>
        </div>
        <div className="text-xs text-gray-700 space-y-1 font-mono">
          <div>• https://www.tiktok.com/@usuario/video/123456789</div>
          <div>• https://vm.tiktok.com/abc123def/</div>
          <div>• https://tiktok.com/@creator/video/1234567890123456789</div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Formatos soportados: MP4 sin marca de agua, MP4 con marca de agua, MP3 de audio.</span>
        </div>
      </div>
    </div>

    </>
  )
}