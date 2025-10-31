import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('🔧 Descargando desde:', url)

    // Detectar si es audio (para ajustar headers)
    const isAudio = url.includes('mime=audio') || url.includes('m4a') || url.includes('webm')

    // ✅ CONFIGURACIÓN MEJORADA: Timeout de 30 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout alcanzado, abortando...')
      controller.abort()
    }, 30000) // 30 segundos

    try {
      // ✅ FETCH MEJORADO con signal de timeout
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': isAudio ? 'audio/*' : 'video/*,*/*',
          'Accept-Encoding': 'identity',
          'Range': 'bytes=0-',
          'Referer': 'https://www.youtube.com/',
          'Origin': 'https://www.youtube.com',
          'Sec-Fetch-Dest': isAudio ? 'audio' : 'video',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        signal: controller.signal, // ✅ Añadir signal para timeout
      })

      clearTimeout(timeoutId) // ✅ Limpiar timeout si tiene éxito

      if (!response.ok) {
        console.error('❌ Error en fetch:', response.status, response.statusText)
        return NextResponse.json({
          error: `Failed to download file: ${response.status} ${response.statusText}`
        }, { status: 500 })
      }

      // Obtener blob
      const blob = await response.blob()

      if (blob.size === 0) {
        return NextResponse.json({ error: 'Empty file received' }, { status: 500 })
      }

      console.log(`✅ Archivo descargado: ${blob.size} bytes (${isAudio ? 'AUDIO' : 'VIDEO'})`)

      // Detectar tipo de contenido
      const contentType =
        blob.type ||
        (isAudio ? 'audio/m4a' : 'video/mp4')

      // Crear respuesta con el archivo
      return new NextResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename || (isAudio ? 'audio' : 'video')}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Length': blob.size.toString(),
        }
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId) // ✅ Limpiar timeout en caso de error
      
      console.error('❌ Fetch error:', fetchError)
      
      // ✅ MANEJO ESPECÍFICO DE TIMEOUT
      if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
        return NextResponse.json({
          error: 'Connection timeout: Could not connect to YouTube servers after 30 seconds. The server may be busy. Please try again.'
        }, { status: 408 }) // 408 Request Timeout
      }
      
      // ✅ MANEJO DE OTROS ERRORES DE RED
      if (fetchError.message.includes('fetch failed') || fetchError.message.includes('network')) {
        return NextResponse.json({
          error: 'Network error: Unable to reach YouTube servers. Please check your connection and try again.'
        }, { status: 502 })
      }

      throw fetchError // Re-lanzar otros errores

    }

  } catch (error) {
    console.error('💥 Proxy download error:', error)
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}