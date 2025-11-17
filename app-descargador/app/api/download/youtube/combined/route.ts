// app/api/download/youtube/combined/route.ts
import { NextRequest, NextResponse } from 'next/server'

//const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'
const PYTHON_API_URL = (process.env.PYTHON_API_URL || 'http://localhost:8000').replace(/\/$/, '')

// ✅ FUNCIÓN PARA MAPEAR CALIDAD A ITAG
const mapQualityToItag = (quality: string) => {
  const qualityMap: { [key: string]: { video: number, audio: number } } = {
    '2160p': { video: 401, audio: 140 },
    '4k': { video: 401, audio: 140 },
    '1440p': { video: 400, audio: 140 },
    '1080p': { video: 137, audio: 140 },
    '720p': { video: 136, audio: 140 },
    '480p': { video: 135, audio: 140 },
    '360p': { video: 134, audio: 140 },
    '240p': { video: 133, audio: 140 },
    '144p': { video: 160, audio: 140 }
  }
  
  return qualityMap[quality] || qualityMap['1080p'] // Default 1080p
}

export async function POST(request: NextRequest) {
  try {
    const { url, quality = "1080p", format_type = "mp4" } = await request.json()

    console.log('🎬 [YouTube Combined] Iniciando descarga combinada...')
    console.log('📋 [YouTube Combined] Parámetros:', { url, quality, format_type })

    // ✅ VALIDACIÓN MEJORADA DE URL
    if (!url) {
      return NextResponse.json(
        { error: 'URL es requerida' },
        { status: 400 }
      )
    }

    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'URL de YouTube inválida' },
        { status: 400 }
      )
    }

    // ✅ LIMPIAR URL MEJORADO
    const cleanUrl = (url: string): string => {
      try {
        const urlObj = new URL(url)
        // Mantener solo parámetros esenciales
        const videoId = urlObj.searchParams.get('v')
        if (videoId) {
          return `https://www.youtube.com/watch?v=${videoId}`
        }
        return url.split('&')[0] // Fallback
      } catch {
        return url.split('&')[0]
      }
    }

    const cleanedUrl = cleanUrl(url)
    console.log('🔧 [YouTube Combined] URL limpia:', cleanedUrl)

    if (!PYTHON_API_URL) {
      return NextResponse.json(
        { error: 'Servidor de descargas no configurado' },
        { status: 500 }
      )
    }

    // ✅ ESTRATEGIA PRINCIPAL: USAR BACKEND COMBINER
    console.log('🔗 [YouTube Combined] Llamando a endpoint de combinación backend...')
    
    try {
      // ✅ MAPEAR CALIDAD A ITAGS NUMÉRICOS
      const itags = mapQualityToItag(quality)
      console.log('🎯 [YouTube Combined] Itags mapeados:', {
        quality,
        video_itag: itags.video,
        audio_itag: itags.audio
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutos

      // ✅ ENDPOINT CORRECTO DEL BACKEND
      const combineResponse = await fetch(`${PYTHON_API_URL}/api/v1/combiner/youtube/combine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: cleanedUrl,
          quality: quality,          // ← Para el mapeo automático
          video_itag: itags.video,  // ← NÚMERO (backup)
          audio_itag: itags.audio   // ← NÚMERO (backup)
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!combineResponse.ok) {
        const errorText = await combineResponse.text()
        console.error('❌ [YouTube Combined] Error en combinación backend:', errorText)
        let errorDetail = 'Error en combinación backend'
        try {
          const errorData = JSON.parse(errorText)
          errorDetail = errorData.detail || errorData.error || errorText
        } catch {
          errorDetail = errorText
        }
        throw new Error(errorDetail)
      }

      const combineData = await combineResponse.json()
      console.log('✅ [YouTube Combined] Combinación backend exitosa:', {
        status: combineData.status,
        file_size: combineData.file_size,
        filename: combineData.filename,
        method: combineData.method,
        combined: combineData.combined
      })

      // ✅ VERIFICAR RESPUESTA EXITOSA
      if (combineData.status === 'success' && combineData.file_content) {
        console.log('✅ [YouTube Combined] Backend combinó exitosamente el archivo')
        
        return NextResponse.json({
          status: 'success',
          file_content: combineData.file_content, // Base64 desde backend
          filename: combineData.filename || `youtube_${quality}_${Date.now()}.mp4`,
          title: combineData.title || 'Video de YouTube',
          combined: combineData.combined || true,
          method: combineData.method || 'backend_combiner',
          quality: combineData.quality || quality,
          file_size: combineData.file_size,
          video_itag: combineData.video_itag,
          audio_itag: combineData.audio_itag,
          message: 'Video combinado exitosamente por el backend'
        })
      } else {
        throw new Error('Backend no proporcionó datos de archivo combinado válidos')
      }

    } catch (combineError: any) {
      console.log('⚠️ [YouTube Combined] Combinación backend falló, usando estrategia frontend:', combineError.message)
      
      // ✅ FALLBACK: Estrategia frontend
      return await handleFrontendCombination(cleanedUrl, quality, format_type)
    }

  } catch (error: any) {
    console.error('💥 [YouTube Combined] Error general:', error)
    return NextResponse.json(
      { 
        error: 'Error en descarga combinada: ' + error.message,
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

// ✅ FUNCIÓN DE FALLBACK: COMBINACIÓN EN FRONTEND
async function handleFrontendCombination(url: string, quality: string, format_type: string) {
  try {
    console.log('🔄 [YouTube Combined] Usando estrategia frontend...')
    
    // Obtener información del video primero
    const infoResponse = await fetch(`${PYTHON_API_URL}/api/v1/youtube/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: url,
        quality: quality,
        format_type: format_type
      }),
    })

    if (!infoResponse.ok) {
      const errorData = await infoResponse.json()
      throw new Error(errorData.detail || 'Error obteniendo información del video')
    }

    const videoData = await infoResponse.json()
    console.log('📊 [YouTube Combined] Información del video obtenida:', {
      title: videoData.title,
      formatsCount: videoData.formats?.length || 0,
      platform: videoData.platform
    })

    // ✅ ENCONTRAR MEJOR FORMATO DE VIDEO Y AUDIO
    const findBestFormats = (data: any) => {
      let bestVideo = null
      let bestAudio = null

      if (!data.formats || !Array.isArray(data.formats)) {
        console.log('⚠️ [YouTube Combined] No hay formatos disponibles en la respuesta')
        return { bestVideo: null, bestAudio: null }
      }

      console.log(`📋 [YouTube Combined] Total de formatos disponibles: ${data.formats.length}`)

      // Buscar mejor video (sin audio) para la calidad solicitada
      const videoFormats = data.formats.filter((f: any) => {
        const hasVideo = f.hasVideo !== false && f.has_video !== false
        const matchesQuality = f.quality?.includes(quality) || 
                             f.resolution?.includes(quality) ||
                             f.quality_label?.includes(quality)
        const isVideoOnly = !f.hasAudio || f.hasAudio === false || 
                          !f.has_audio || f.has_audio === false
        
        return f.url && f.url.startsWith('http') && hasVideo && matchesQuality && isVideoOnly
      })

      // Buscar mejor audio disponible
      const audioFormats = data.formats.filter((f: any) => {
        const hasAudio = f.hasAudio === true || f.has_audio === true
        const isAudioFormat = f.quality?.includes('audio') || 
                            f.format?.includes('audio') || 
                            f.mimeType?.includes('audio') ||
                            f.quality?.includes('128') || 
                            f.quality?.includes('192') || 
                            f.quality?.includes('256') || 
                            f.quality?.includes('320') ||
                            f.quality?.includes('medium') || 
                            f.quality?.includes('low')
        
        return f.url && f.url.startsWith('http') && hasAudio && isAudioFormat
      })

      // Ordenar por calidad (mayor primero)
      videoFormats.sort((a: any, b: any) => {
        const getQualityNum = (format: any) => {
          if (format.quality_label) {
            return parseInt(format.quality_label) || 0
          }
          if (format.quality) {
            const match = format.quality.match(/(\d+)p/)
            return match ? parseInt(match[1]) : 0
          }
          return 0
        }
        return getQualityNum(b) - getQualityNum(a)
      })

      audioFormats.sort((a: any, b: any) => {
        const getBitrate = (format: any) => {
          if (format.bitrate) return format.bitrate
          if (format.quality?.includes('320')) return 320
          if (format.quality?.includes('256')) return 256
          if (format.quality?.includes('192')) return 192
          if (format.quality?.includes('128')) return 128
          return 0
        }
        return getBitrate(b) - getBitrate(a)
      })

      bestVideo = videoFormats[0] || null
      bestAudio = audioFormats[0] || null

      console.log('🎯 [YouTube Combined] Formatos encontrados:', {
        videoFormats: videoFormats.length,
        audioFormats: audioFormats.length,
        bestVideo: bestVideo ? `${bestVideo.quality || bestVideo.quality_label} - ${bestVideo.url?.substring(0, 50)}...` : 'No encontrado',
        bestAudio: bestAudio ? `${bestAudio.quality} - ${bestAudio.url?.substring(0, 50)}...` : 'No encontrado'
      })

      return { bestVideo, bestAudio }
    }

    const { bestVideo, bestAudio } = findBestFormats(videoData)

    // ✅ ESTRATEGIA: SI NO HAY FORMATOS SEPARADOS, USAR EL FORMATO COMBINADO EXISTENTE
    if (!bestVideo && !bestAudio) {
      console.log('🔄 [YouTube Combined] No se encontraron formatos separados, usando formato combinado existente')
      
      // Buscar cualquier formato con audio y video
      const combinedFormats = videoData.formats?.filter((f: any) => {
        const hasVideo = f.hasVideo !== false && f.has_video !== false
        const hasAudio = f.hasAudio === true || f.has_audio === true
        return f.url && f.url.startsWith('http') && hasVideo && hasAudio
      }) || []

      // Ordenar por calidad
      combinedFormats.sort((a: any, b: any) => {
        const getQualityNum = (format: any) => {
          if (format.quality_label) {
            return parseInt(format.quality_label) || 0
          }
          if (format.quality) {
            const match = format.quality.match(/(\d+)p/)
            return match ? parseInt(match[1]) : 0
          }
          return 0
        }
        return getQualityNum(b) - getQualityNum(a)
      })

      const bestCombined = combinedFormats.find((f: any) => 
        f.quality?.includes(quality) || 
        f.resolution?.includes(quality) ||
        f.quality_label?.includes(quality)
      ) || combinedFormats[0]

      if (bestCombined) {
        console.log('✅ [YouTube Combined] Usando formato combinado existente:', bestCombined.quality || bestCombined.quality_label)
        return NextResponse.json({
          status: 'success',
          download_url: bestCombined.url,
          filename: `youtube_${quality}_${Date.now()}.${format_type}`,
          title: videoData.title,
          combined: false,
          method: 'existing_combined',
          quality: quality,
          file_size: bestCombined.contentLength || 0,
          warning: 'Video con audio incluido (no requiere combinación)'
        })
      } else {
        throw new Error('No se encontraron formatos disponibles para descargar')
      }
    }

    if (!bestVideo) {
      throw new Error(`No se encontró formato de video para calidad ${quality}`)
    }

    // ✅ ESTRATEGIA FINAL: COMBINACIÓN EN FRONTEND (usando proxy)
    console.log('🔄 [YouTube Combined] Usando combinación por proxy')
    
    if (bestVideo && bestAudio) {
      return NextResponse.json({
        status: 'success',
        video_url: bestVideo.url,
        audio_url: bestAudio.url,
        filename: `youtube_${quality}_${Date.now()}.mp4`,
        title: videoData.title,
        combined: true,
        method: 'proxy_combination',
        quality: quality,
        video_quality: bestVideo.quality || bestVideo.quality_label,
        audio_quality: bestAudio.quality,
        video_size: bestVideo.contentLength || 0,
        audio_size: bestAudio.contentLength || 0
      })
    } else {
      // ✅ ESTRATEGIA: SOLO VIDEO (sin audio disponible)
      console.log('⚠️ [YouTube Combined] Solo video disponible (sin audio)')
      return NextResponse.json({
        status: 'success',
        download_url: bestVideo.url,
        filename: `youtube_${quality}_${Date.now()}.mp4`,
        title: videoData.title,
        combined: false,
        method: 'video_only',
        quality: quality,
        warning: 'Este video no incluye audio - solo video disponible',
        video_quality: bestVideo.quality || bestVideo.quality_label,
        video_size: bestVideo.contentLength || 0
      })
    }

  } catch (error: any) {
    console.error('💥 [YouTube Combined] Error en estrategia frontend:', error)
    throw new Error(`Fallback también falló: ${error.message}`)
  }
}

// ✅ ENDPOINT GET PARA VERIFICAR CONEXIÓN
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'success',
    message: 'YouTube Combined API está funcionando',
    endpoint: 'POST /api/download/youtube/combined',
    parameters: {
      url: 'string (required)',
      quality: 'string (optional) - 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p',
      format_type: 'string (optional) - mp4, webm, etc.'
    },
    supported_qualities: ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p', '4k']
  })
}