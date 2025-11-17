// app/api/download/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server'

//const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'
const PYTHON_API_URL = (process.env.PYTHON_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export async function POST(request: NextRequest) {
  try {
    let { url, quality = "1080p", format_type = "mp4" } = await request.json()

    console.log('🔗 [YouTube] Conectando con API Python:', PYTHON_API_URL)

    if (!PYTHON_API_URL) {
      return NextResponse.json(
        { error: 'Servidor de descargas no configurado' },
        { status: 500 }
      )
    }

    // Validación
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/
    if (!url || !youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'URL de YouTube inválida' },
        { status: 400 }
      )
    }

    // Limpiar URL
    const cleanYoutubeUrl = (url: string): string => {
      const index = url.indexOf('&')
      return index !== -1 ? url.substring(0, index) : url
    }
    url = cleanYoutubeUrl(url)

    console.log('🚀 [YouTube] Llamando a API Python:', `${PYTHON_API_URL}/api/v1/youtube/download`)
    console.log('🎯 [YouTube] Parámetros:', { quality, format_type })
    
    // ✅ CORREGIDO: Usar el endpoint correcto
    const response = await fetch(`${PYTHON_API_URL}/api/v1/youtube/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url, 
        quality,
        format_type
        // ❌ NO incluir combine_audio_video - no existe en tu backend
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ [YouTube] Error desde API Python:', errorData)
      
      let errorMessage = 'Error en el servidor de descargas'
      if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (errorData.message) {
        errorMessage = errorData.message
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ [YouTube] Respuesta exitosa')
    console.log('📊 [YouTube] Datos recibidos:', {
      title: data.title,
      platform: data.platform,
      formats_count: data.formats?.length || 0,
      statistics: data.statistics
    })

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('💥 [YouTube] Error en proxy:', error)
    
    let errorMessage = 'Error de conexión con el servidor'
    if (error.message?.includes('fetch failed')) {
      errorMessage = 'No se pudo conectar con el servidor de descargas'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}