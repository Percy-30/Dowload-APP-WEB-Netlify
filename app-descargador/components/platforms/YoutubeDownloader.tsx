//app/components/platforms/YoutubeDownloader.py
'use client'

import { useState } from 'react'
import { useEffect } from 'react';

interface VideoFormat {
  quality: string
  format: string
  resolution: string
  size: string
  url: string
  codec?: string
  hasAudio?: boolean
  hasVideo?: boolean
  recommended_audio?: {
    url: string
    quality: string
    size: string
    format: string
  }
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
  statistics?: {
    combined_formats: number
    video_only_formats: number
    audio_only_formats: number
    has_recommended_audio: boolean
  }
}

const predefinedQualities = [
  { label: '1440p (2K) .mp4', value: '1440p', ext: 'mp4' },
  { label: '2160p (4K) .mp4', value: '2160p', ext: 'mp4' },
  { label: '1080p (.mp4)', value: '1080p', ext: 'mp4' },
  { label: '720p (.mp4)', value: '720p', ext: 'mp4' },
  { label: '480p (.mp4)', value: '480p', ext: 'mp4' },
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
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showAd, setShowAd] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [adCountdown, setAdCountdown] = useState(5);
  const [originalUrl, setOriginalUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'simple' | 'combined'>('simple');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Por favor, ingresa un enlace válido de YouTube')
      return
    }

    setIsLoading(true)
    setError(null)
    setVideoInfo(null)
    setDownloadProgress(0)

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
        setOriginalUrl(url);
        setUrl('')
      } else {
        throw new Error(data.message || 'Error desconocido')
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar el video')
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ FUNCIÓN PARA VERIFICAR SI LA COMBINACIÓN ESTÁ PERMITIDA (HASTA 1080p)
  const isCombinationAllowed = (quality: string): boolean => {
    // ✅ LIMITAR COMBINACIÓN HASTA 1080p (MENOS DE 200MB)
    const allowedCombinationQualities = ['144p', '240p', '360p', '480p', '720p', '1080p']
    return allowedCombinationQualities.includes(quality)
  }

  // ✅ FUNCIÓN MEJORADA PARA DESCARGA COMBINADA CON STREAMING
  const downloadCombined = async (quality: string) => {
    // ✅ VERIFICAR LÍMITE ANTES DE PROCESAR
    if (!isCombinationAllowed(quality)) {
      setError(`La combinación automática no está disponible para ${quality}. Descarga el video por separado.`)
      return
    }

    try {
      setDownloading(`combined-${quality}`)
      setDownloadProgress(0)
      
      console.log('🎬 Iniciando descarga combinada con streaming...', quality)
      
      const downloadUrl = originalUrl
      
      if (!downloadUrl) {
        throw new Error('No hay URL disponible para descargar. Por favor, busca el video nuevamente.')
      }

      console.log('🔗 URL para descarga combinada:', downloadUrl)

      const response = await fetch('/api/download/youtube/combined', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: downloadUrl,
          quality: quality,
          format_type: 'mp4'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en descarga combinada')
      }

      const data = await response.json()
      console.log('📦 Respuesta del backend combinado:', {
        status: data.status,
        method: data.method,
        file_size: data.file_size,
        has_file_content: !!data.file_content
      })
      
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // ✅ ESTRATEGIA MEJORADA PARA STREAMING
      if (data.status === 'success') {
        console.log('✅ Backend procesó exitosamente la combinación')
        
        // ESTRATEGIA 1: Contenido base64 desde streaming (PRINCIPAL)
        if (data.file_content) {
          console.log('🔧 Procesando archivo combinado base64 desde streaming')
          const filename = data.filename || `youtube_${quality}_${Date.now()}.mp4`
          await handleBase64Download(data.file_content, filename, quality)
        }
        
        // ESTRATEGIA 2: URLs separadas (fallback)
        else if (data.video_url && data.audio_url) {
          console.log('🎵 Combinando con URLs separadas (fallback)')
          const filename = data.filename || `youtube_${quality}_${Date.now()}.mp4`
          await downloadCombinedWithProxy(data.video_url, data.audio_url, filename, quality)
        }
        
        // ESTRATEGIA 3: URL directa (fallback)
        else if (data.download_url && data.download_url.startsWith('http')) {
          console.log('📥 Usando URL directa combinada (fallback)')
          const filename = data.filename || `youtube_${quality}_${Date.now()}.mp4`
          await downloadThroughBackend(data.download_url, filename, quality, false)
        }
        
        else {
          throw new Error('Backend no proporcionó datos válidos para la combinación')
        }
        
      } else {
        throw new Error(data.message || 'El backend no completó la combinación correctamente')
      }
      
      clearInterval(progressInterval)
      setDownloadProgress(100)
      
    } catch (error) {
      console.error('❌ Error en descarga combinada:', error)
      setError(error instanceof Error ? error.message : 'Error en descarga combinada')
      
      // ✅ FALLBACK MEJORADO
      console.log('🔄 Intentando estrategias de fallback...')
      
      try {
        // Estrategia de fallback: Descarga normal del formato disponible
        const { format } = findBestFormatForQuality(quality)
        if (format && format.url && format.url.startsWith('http')) {
          console.log('🔄 Fallback: Descarga normal sin combinar')
          const filename = `youtube_${quality}_${Date.now()}.mp4`
          await downloadThroughBackend(format.url, filename, quality, false)
          return
        }
        
        throw new Error('No hay formatos disponibles para fallback')
        
      } catch (fallbackError) {
        console.error('❌ Todos los fallbacks fallaron:', fallbackError)
        setError('No se pudo completar la descarga. Por favor, intenta con una calidad diferente.')
      }
    } finally {
      setDownloading(null)
      setDownloadProgress(0)
    }
  }

  // ✅ FUNCIÓN PARA MANEJAR DESCARGA BASE64 (ACTUALIZADA)
  const handleBase64Download = async (base64Content: string, filename: string, quality: string) => {
    try {
      console.log('🔧 Procesando archivo combinado base64 desde streaming...')
      
      if (!base64Content) {
        throw new Error('El contenido base64 está vacío')
      }
      
      // Decodificar base64 a blob
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'video/mp4' });
      
      if (blob.size === 0) {
        throw new Error('El archivo base64 está vacío')
      }
      
      console.log('✅ Archivo base64 procesado:', blob.size, 'bytes')
      
      // Descargar blob
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar URL después de 5 segundos
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
      console.log('✅ Descarga base64 completada')
      
    } catch (error) {
      console.error('❌ Error procesando base64:', error)
      throw error
    }
  }

  // ✅ FUNCIÓN PARA COMBINACIÓN CON PROXY (FALLBACK)
  const downloadCombinedWithProxy = async (videoUrl: string, audioUrl: string, filename: string, quality: string) => {
    try {
      console.log('🎵 Combinando con URLs separadas (proxy fallback)...')
      
      // Enviar ambas URLs al proxy para combinación
      const response = await fetch('/api/download/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          audio_url: audioUrl,
          filename: filename,
          quality: quality,
          isCombined: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en combinación por proxy')
      }

      const blob = await response.blob()
      
      if (blob.size === 0) {
        throw new Error('El archivo combinado está vacío')
      }
      
      console.log('✅ Archivo combinado recibido:', blob.size, 'bytes')
      
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
      console.log('✅ Combinación por proxy completada')
      
    } catch (error) {
      console.error('❌ Error en combinación por proxy:', error)
      throw error
    }
  }

  // ✅ DESCARGA SIMPLE (SIN COMBINAR)
  const handleSimpleDownload = async (quality: string, fileExt: string = 'mp4') => {
    const { format } = findBestFormatForQuality(quality)
    
    if (!format || !format.url) {
      setError(`No se encontró la calidad ${quality} disponible`)
      return
    }

    if (!format.url.startsWith('http')) {
      setError(`URL de descarga inválida para ${quality}`)
      return
    }

    try {
      const filename = `youtube_${quality}_simple_${Date.now()}.${fileExt}`
      await downloadThroughBackend(format.url, filename, quality, false)
    } catch (error) {
      setError(`Error al descargar ${quality}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // ✅ FUNCIÓN PRINCIPAL DE DESCARGA
  const downloadThroughBackend = async (
    downloadUrl: string, 
    filename: string, 
    quality?: string, 
    isAudio: boolean = false
  ) => {
    try {
      setDownloading(quality || (isAudio ? 'audio' : 'video'))
      setDownloadProgress(0)
      
      console.log('⬇️ Iniciando descarga...', { quality, filename, isAudio, downloadUrl: downloadUrl?.substring(0, 100) })
      
      // ✅ VERIFICACIÓN CRÍTICA: Asegurar que la URL sea válida
      if (!downloadUrl || !downloadUrl.startsWith('http')) {
        console.error('❌ URL inválida para descarga:', downloadUrl)
        throw new Error(`URL de descarga inválida: ${downloadUrl}. Por favor, intenta con otra calidad.`)
      }

      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 800)

      const response = await fetch('/api/download/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: downloadUrl,
          filename: filename,
          quality: quality,
          isAudio: isAudio
        })
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        if (response.status === 408) {
          throw new Error(`TIMEOUT: ${errorData.error || 'El servidor tardó demasiado en responder'}`)
        }
        
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const blob = await response.blob()
      
      if (blob.size === 0) {
        throw new Error('El archivo recibido está vacío')
      }
      
      console.log('✅ Descarga exitosa:', blob.size, 'bytes')
      setDownloadProgress(100)
      
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
        setDownloading(null)
        setDownloadProgress(0)
      }, 5000)
      
    } catch (error) {
      console.error('❌ Error en descarga:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      if (errorMessage.includes('TIMEOUT') && quality && ['1440p', '2160p', '1080p'].includes(quality)) {
        setError(`⚠️ ${errorMessage} Recomendamos intentar con 720p o 480p.`)
      } else {
        setError(errorMessage)
      }
      
      if (!errorMessage.includes('TIMEOUT') && downloadUrl && downloadUrl.startsWith('http')) {
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
        }
      }
      
      setDownloading(null)
      setDownloadProgress(0)
    }
  }

  // ✅ DESCARGA DE AUDIO
  const handleAudioDownload = async () => {
    if (!videoInfo?.formats) {
      setError('No hay información de video disponible')
      return
    }

    const audioFormat = findBestAudioFormat()

    if (audioFormat && audioFormat.url) {
      if (!audioFormat.url.startsWith('http')) {
        setError('La URL de audio no es válida')
        return
      }

      const ext = audioFormat.format.toLowerCase().includes('mp3') ? 'mp3' : 'm4a'
      const filename = `youtube_audio_${Date.now()}.${ext}`
      await downloadThroughBackend(audioFormat.url, filename, undefined, true)
    } else {
      setError('No se encontró formato de audio disponible')
    }
  }

  // ✅ FUNCIONES AUXILIARES
  const findBestFormatForQuality = (quality: string): { 
    format: VideoFormat | null, 
    hasAudio: boolean,
    hasRecommendedAudio: boolean
  } => {
    if (!videoInfo?.formats) {
      return { format: null, hasAudio: false, hasRecommendedAudio: false }
    }

    // Filtrar solo formatos con URLs válidas
    const validFormats = videoInfo.formats.filter(format => 
      format.url && format.url.startsWith('http')
    )

    const formatsWithAudio = validFormats.filter(format => 
      format.hasAudio === true &&
      !format.quality.toLowerCase().includes('audio only') &&
      !format.quality.toLowerCase().includes('video only')
    )

    let bestFormat = formatsWithAudio.find(f => 
      f.quality.toLowerCase().includes(quality) || 
      f.resolution.includes(quality) ||
      (quality === '1440p' && (f.resolution.includes('1440') || f.quality.toLowerCase().includes('1440'))) ||
      (quality === '2160p' && (f.resolution.includes('2160') || f.quality.toLowerCase().includes('2160') || f.quality.toLowerCase().includes('4k')))
    )

    if (bestFormat) {
      return { format: bestFormat, hasAudio: true, hasRecommendedAudio: false }
    }

    const videoOnlyFormats = validFormats.filter(format => 
      !format.quality.toLowerCase().includes('audio only') &&
      format.hasVideo !== false
    )

    bestFormat = videoOnlyFormats.find(f => 
      f.quality.toLowerCase().includes(quality) || 
      f.resolution.includes(quality) ||
      (quality === '1440p' && (f.resolution.includes('1440') || f.quality.toLowerCase().includes('1440'))) ||
      (quality === '2160p' && (f.resolution.includes('2160') || f.quality.toLowerCase().includes('2160') || f.quality.toLowerCase().includes('4k')))
    )

    if (!bestFormat) {
      const qualityOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p']
      const currentQualityIndex = qualityOrder.indexOf(quality)
      
      if (currentQualityIndex >= 0) {
        for (let i = currentQualityIndex; i < qualityOrder.length; i++) {
          bestFormat = videoOnlyFormats.find(f => 
            f.resolution.includes(qualityOrder[i]) || 
            f.quality.toLowerCase().includes(qualityOrder[i])
          )
          if (bestFormat) break
        }
      }
    }

    const hasRecommendedAudio = bestFormat?.recommended_audio !== undefined

    return { 
      format: bestFormat || null, 
      hasAudio: false,
      hasRecommendedAudio
    }
  }

  const findBestAudioFormat = (): VideoFormat | null => {
    if (!videoInfo?.formats) return null

    // Filtrar solo formatos con URLs válidas
    const validFormats = videoInfo.formats.filter(format => 
      format.url && format.url.startsWith('http')
    )

    const audioFormats = validFormats.filter(format => 
      format.quality.toLowerCase().includes('audio') || 
      format.format.toLowerCase().includes('mp3') ||
      format.format.toLowerCase().includes('m4a') ||
      (format.hasAudio === true && format.hasVideo === false)
    )

    audioFormats.sort((a, b) => {
      const getQualityValue = (quality: string) => {
        if (quality.includes('320')) return 320
        if (quality.includes('256')) return 256
        if (quality.includes('192')) return 192
        if (quality.includes('128')) return 128
        return 0
      }
      return getQualityValue(b.quality) - getQualityValue(a.quality)
    })

    return audioFormats[0] || null
  }

  const handleDownloadWithAd = (downloadFn: () => void, quality?: string) => {
    setPendingAction(() => downloadFn);
    setAdCountdown(5);
    setShowAd(true);
  };

  const isQualityAvailable = (quality: string): boolean => {
    const { format } = findBestFormatForQuality(quality)
    return format !== null && format.url !== undefined && format.url.startsWith('http')
  }

  const getFormatInfo = (quality: string): { 
    type: string, 
    size: string, 
    hasAudio: boolean,
    canCombine: boolean,
    combinationAllowed: boolean
  } => {
    const { format, hasAudio, hasRecommendedAudio } = findBestFormatForQuality(quality)
    
    if (!format) return { 
      type: 'No disponible', 
      size: 'N/A', 
      hasAudio: false,
      canCombine: false,
      combinationAllowed: false
    }
    
    let typeText = 'Video'
    let canCombine = false
    const combinationAllowed = isCombinationAllowed(quality)
    
    if (hasAudio) {
      typeText = 'Video + Audio'
      canCombine = false
    } else if (hasRecommendedAudio && combinationAllowed) {
      typeText = 'Video (audio separado)'
      canCombine = true
    } else if (hasRecommendedAudio && !combinationAllowed) {
      typeText = 'Video (audio separado)'
      canCombine = false
    } else {
      typeText = 'Video (sin audio)'
      canCombine = false
    }
    
    return {
      type: typeText,
      size: format.size || 'N/A',
      hasAudio: hasAudio,
      canCombine: canCombine,
      combinationAllowed: combinationAllowed
    }
  }

  const ProgressBar = ({ progress, quality }: { progress: number, quality: string }) => (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 text-center">
        {progress < 100 ? `Descargando ${quality}: ${progress}%` : '✅ Descarga completada'}
      </div>
    </div>
  )

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M vistas`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K vistas`
    }
    return `${count} vistas`
  }

  const availableQualities = predefinedQualities.filter(quality => 
    isQualityAvailable(quality.value)
  )

  useEffect(() => {
    if (!showAd) return;
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

  // ✅ COMPONENTE DE PESTAÑAS
  const TabButton = ({ active, onClick, children }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode 
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
        active 
          ? 'bg-red-600 text-white border-b-2 border-red-700' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {children}
    </button>
  )

  return (
    <>
      {showAd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-4">Antes de descargar</h2>
            <p className="mb-4">Mira este anuncio o espera {adCountdown} segundos para continuar.</p>

            <div className="bg-gray-200 h-32 mb-4 flex items-center justify-center">
              <span>Anuncio</span>
            </div>

            <div className="flex justify-center gap-2">
              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded ${adCountdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={adCountdown > 0}
                onClick={() => {
                  setShowAd(false)
                  pendingAction?.()
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
                    ✅ {availableQualities.length} calidades disponibles
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE AUDIO */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4"># Descargar Solo Audio</h4>
              <div className="flex flex-col items-center">
                {downloading === 'audio' ? (
                  <div className="w-full max-w-md">
                    <ProgressBar progress={downloadProgress} quality="Audio" />
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownloadWithAd(handleAudioDownload)}
                    disabled={!!downloading}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Descargar Audio (MP3/M4A)
                  </button>
                )}
              </div>
            </div>

            {/* PESTAÑAS DE VIDEO */}
            <div className="mb-4">
              <h4 className="text-lg font-bold text-gray-900 mb-4">## Descargar Video</h4>
              
              {/* NAVEGACIÓN DE PESTAÑAS */}
              <div className="flex space-x-2 mb-6 border-b">
                <TabButton 
                  active={activeTab === 'simple'} 
                  onClick={() => setActiveTab('simple')}
                >
                  🎬 Solo Video (Sin Combinar)
                </TabButton>
                <TabButton 
                  active={activeTab === 'combined'} 
                  onClick={() => setActiveTab('combined')}
                >
                  🎵 Video con Audio (Combinado)
                </TabButton>
              </div>

              {/* CONTENIDO DE PESTAÑAS */}
              {activeTab === 'simple' && (
                <div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-orange-800">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Solo Video (Sin Audio)</span>
                    </div>
                    <p className="text-orange-700 text-sm mt-2">
                      Descarga solo el video sin audio. Útil si quieres el video original sin procesar.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">File type</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Format</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Peso</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predefinedQualities.map((quality) => {
                          const isAvailable = isQualityAvailable(quality.value)
                          const isDownloading = downloading === quality.value
                          const formatInfo = getFormatInfo(quality.value)
                          
                          return (
                            <tr key={quality.value} className={`hover:bg-gray-50 ${!isAvailable ? 'opacity-50' : ''}`}>
                              <td className="border border-gray-300 px-4 py-3 text-gray-800 font-medium">
                                {quality.label}
                                {!isAvailable && (
                                  <span className="text-xs text-red-500 ml-2">(No disponible)</span>
                                )}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-gray-600">
                                <div className="flex items-center">
                                  {formatInfo.type}
                                  {formatInfo.hasAudio && (
                                    <span className="ml-2 text-green-600" title="Incluye audio">🎵</span>
                                  )}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-gray-600">
                                {formatInfo.size}
                              </td>
                              <td className="border border-gray-300 px-4 py-3">
                                {isDownloading ? (
                                  <div className="w-full">
                                    <ProgressBar progress={downloadProgress} quality={quality.value} />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleDownloadWithAd(() => handleSimpleDownload(quality.value, quality.ext))}
                                    disabled={!isAvailable || !!downloading}
                                    className={`py-2 px-4 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center w-full ${
                                      isAvailable && !downloading
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {isAvailable ? (
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
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'combined' && (
                <div>
                  {/* ✅ NUEVO: MENSAJE DE LÍMITE DE COMBINACIÓN */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="font-semibold">Límite de Combinación</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-2">
                      La combinación automática está disponible solo hasta 1080p. Para 1440p y 4K, 
                      descarga el video y audio por separado y combínalos localmente.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">File type</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Format</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Peso</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predefinedQualities.map((quality) => {
                          const isAvailable = isQualityAvailable(quality.value)
                          const isDownloading = downloading === `combined-${quality.value}`
                          const formatInfo = getFormatInfo(quality.value)
                          
                          return (
                            <tr key={quality.value} className={`hover:bg-gray-50 ${!isAvailable ? 'opacity-50' : ''}`}>
                              <td className="border border-gray-300 px-4 py-3 text-gray-800 font-medium">
                                {quality.label}
                                {!isAvailable && (
                                  <span className="text-xs text-red-500 ml-2">(No disponible)</span>
                                )}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-gray-600">
                                <div className="flex items-center">
                                  {formatInfo.type}
                                  {formatInfo.canCombine && formatInfo.combinationAllowed && (
                                    <span className="ml-2 text-green-600" title="Audio será combinado">🔊</span>
                                  )}
                                  {formatInfo.canCombine && !formatInfo.combinationAllowed && (
                                    <span className="ml-2 text-yellow-600" title="Combinación no disponible">⚠️</span>
                                  )}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-gray-600">
                                {formatInfo.size}
                              </td>
                              <td className="border border-gray-300 px-4 py-3">
                                {isDownloading ? (
                                  <div className="w-full">
                                    <ProgressBar progress={downloadProgress} quality={quality.value} />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleDownloadWithAd(() => downloadCombined(quality.value), quality.value)}
                                    disabled={!isAvailable || !!downloading || !formatInfo.combinationAllowed}
                                    className={`py-2 px-4 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center w-full ${
                                      isAvailable && !downloading && formatInfo.combinationAllowed
                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {isAvailable ? (
                                      formatInfo.combinationAllowed ? (
                                        <>
                                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                          Combinar y Descargar
                                        </>
                                      ) : (
                                        <span className="text-xs">
                                          ⚠️ Muy grande para combinar
                                        </span>
                                      )
                                    ) : (
                                      'No disponible'
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN DE EJEMPLOS */}
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

        {/* CONSEJOS */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>💡 <strong>Consejo:</strong> Para videos largos o alta calidad, prueba con 720p o 480p para mejor rendimiento.</span>
          </div>
        </div>
      </div>
    </>
  )
}