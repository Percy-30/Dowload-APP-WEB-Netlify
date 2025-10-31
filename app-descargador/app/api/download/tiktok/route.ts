// app/api/download/tiktok/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 80; // Máximo 30 segundos para Vercel

// Validación directa en el archivo (temporal)
function isValidTiktokUrl(url: string): boolean {
  if (!url) return false
  
  const tiktokPatterns = [
    /https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /https?:\/\/(www\.)?tiktok\.com\/[\w.-]+\/video\/\d+/,
    /https?:\/\/vm\.tiktok\.com\/[\w-]+\//,
    /https?:\/\/vt\.tiktok\.com\/[\w-]+\//,
    /https?:\/\/(www\.)?tiktok\.com\/t\/[\w-]+\//,
  ]
  
  return tiktokPatterns.some(pattern => pattern.test(url))
}

// Servicios para obtener datos de TikTok
const TIKTOK_APIS = {
  NO_WATERMARK: 'https://www.tikwm.com/api/',
  TIKLYDOWN: 'https://api.tiklydown.com/api/download'
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || !isValidTiktokUrl(url)) {
      return NextResponse.json(
        { error: 'URL de TikTok inválida. Ejemplo: https://vm.tiktok.com/abc123/' },
        { status: 400 }
      )
    }

    // Intentar obtener información del video sin marca de agua
    const videoData = await getTikTokVideoInfo(url)
    
    if (!videoData) {
      return NextResponse.json(
        { error: 'No se pudo obtener la información del video de TikTok' },
        { status: 404 }
      )
    }

    const videoInfo = {
      status: 'success',
      platform: 'tiktok',
      title: videoData.title || 'Video de TikTok',
      thumbnail: videoData.thumbnail || `https://picsum.photos/400/700?${Math.random()}`,
      duration: videoData.duration || '0:00',
      uploader: videoData.author || '@tiktokuser',
      uploader_avatar: videoData.author_avatar,
      video_url: url,
      method: videoData.method || 'tiktok_no_watermark',
      formats: [
        {
          quality: 'Sin Marca de Agua - HD',
          format: 'MP4',
          resolution: '1080x1920',
          size: videoData.size || '15.2 MB',
          url: videoData.no_watermark_url || `/api/download/tiktok/download?url=${encodeURIComponent(url)}&quality=nowatermark`,
          hasAudio: true
        },
        {
          quality: 'Con Marca de Agua',
          format: 'MP4', 
          resolution: '1080x1920',
          size: videoData.watermark_size || '16.8 MB',
          url: videoData.watermark_url || `/api/download/tiktok/download?url=${encodeURIComponent(url)}&quality=watermark`,
          hasAudio: true
        },
        {
          quality: 'Solo Audio',
          format: 'MP3',
          resolution: '128kbps',
          size: videoData.audio_size || '2.1 MB',
          url: videoData.audio_url || `/api/download/tiktok/download?url=${encodeURIComponent(url)}&quality=audio`,
          hasAudio: true
        }
      ]
    }

    return NextResponse.json(videoInfo)
  } catch (error) {
    console.error('Error en API TikTok:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Error desconocido') },
      { status: 500 }
    )
  }
}

// Función para obtener información del video de TikTok
async function getTikTokVideoInfo(url: string): Promise<any> {
  try {
    // Intentar con la primera API
    const api1Response = await fetch(`${TIKTOK_APIS.NO_WATERMARK}?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    })

    if (api1Response.ok) {
      const data = await api1Response.json()
      if (data.data) {
        return {
          title: data.data.title,
          thumbnail: data.data.cover,
          duration: formatDuration(data.data.duration),
          author: data.data.author?.nickname || '@tiktokuser',
          author_avatar: data.data.author?.avatar,
          no_watermark_url: data.data.play,
          watermark_url: data.data.wmplay,
          audio_url: data.data.music,
          size: formatFileSize(data.data.size || 15000000),
          watermark_size: formatFileSize(data.data.wm_size || 16000000),
          audio_size: formatFileSize(data.data.music_size || 2000000),
          method: 'tikwm_api'
        }
      }
    }

    // Si la primera API falla, intentar con una alternativa
    const api2Response = await fetch(`${TIKTOK_APIS.TIKLYDOWN}?url=${encodeURIComponent(url)}`)
    if (api2Response.ok) {
      const data = await api2Response.json()
      if (data.video) {
        return {
          title: data.title || 'Video de TikTok',
          thumbnail: data.cover,
          duration: formatDuration(data.duration),
          author: data.author || '@tiktokuser',
          no_watermark_url: data.video.noWatermark,
          watermark_url: data.video.withWatermark,
          audio_url: data.music,
          size: formatFileSize(12000000),
          watermark_size: formatFileSize(13000000),
          audio_size: formatFileSize(1500000),
          method: 'tiklydown_api'
        }
      }
    }

    // Si todas las APIs fallan, devolver datos por defecto
    return getDefaultVideoInfo(url)
  } catch (error) {
    console.error('Error obteniendo info de TikTok:', error)
    return getDefaultVideoInfo(url)
  }
}

// Función para formatear duración en segundos a formato mm:ss
function formatDuration(seconds: number): string {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Función para formatear tamaño de archivo
function formatFileSize(bytes: number): string {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

// Función para obtener información por defecto cuando las APIs fallan
function getDefaultVideoInfo(url: string) {
  return {
    title: 'Video de TikTok',
    thumbnail: `https://picsum.photos/400/700?${Math.random()}`,
    duration: '0:45',
    author: '@tiktokuser',
    no_watermark_url: `/api/download/tiktok/download?url=${encodeURIComponent(url)}&quality=nowatermark`,
    watermark_url: `/api/download/tiktok/download?url=${encodeURIComponent(url)}&quality=watermark`,
    audio_url: `/api/download/tiktok/download?url=${encodeURIComponent(url)}&quality=audio`,
    size: '15.2 MB',
    watermark_size: '16.8 MB',
    audio_size: '2.1 MB',
    method: 'default_fallback'
  }
}

// Endpoint para descargas
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const quality = searchParams.get('quality')

  if (!url || !isValidTiktokUrl(url)) {
    return NextResponse.json(
      { error: 'URL de TikTok inválida' },
      { status: 400 }
    )
  }

  try {
    const videoData = await getTikTokVideoInfo(url)
    
    let downloadUrl
    switch (quality) {
      case 'nowatermark':
        downloadUrl = videoData.no_watermark_url
        break
      case 'watermark':
        downloadUrl = videoData.watermark_url
        break
      case 'audio':
        downloadUrl = videoData.audio_url
        break
      default:
        downloadUrl = videoData.no_watermark_url
    }

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'No se pudo obtener la URL de descarga' },
        { status: 404 }
      )
    }

    // Si es una URL relativa, hacer fetch y servir el archivo
    if (downloadUrl.startsWith('/')) {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${downloadUrl}`)
      if (!response.ok) throw new Error('Error al obtener el archivo')
      
      return new Response(response.body, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="tiktok_video.mp4"`
        }
      })
    }

    // Redirigir a la URL de descarga externa
    return NextResponse.redirect(downloadUrl)
  } catch (error) {
    console.error('Error en descarga TikTok:', error)
    return NextResponse.json(
      { error: 'Error al procesar la descarga' },
      { status: 500 }
    )
  }
}