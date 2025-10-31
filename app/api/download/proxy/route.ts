import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, filename } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Descargando desde:', url)

    // Detectar si es audio (para ajustar headers)
    const isAudio = url.includes('mime=audio') || url.includes('m4a') || url.includes('webm')

    // Fetch con headers adecuados según el tipo
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': isAudio ? 'audio/*' : '*/*',
        'Accept-Encoding': 'identity',
        'Range': 'bytes=0-',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
        'Sec-Fetch-Dest': isAudio ? 'audio' : 'video'
      },
      redirect: 'follow'
    })

    if (!response.ok) {
      console.error('Error en fetch:', response.status, response.statusText)
      return NextResponse.json({
        error: `Failed to download file: ${response.status} ${response.statusText}`
      }, { status: 500 })
    }

    // Obtener blob
    const blob = await response.blob()

    if (blob.size === 0) {
      return NextResponse.json({ error: 'Empty file received' }, { status: 500 })
    }

    console.log(`Archivo descargado: ${blob.size} bytes (${isAudio ? 'AUDIO' : 'VIDEO'})`)

    // Detectar tipo de contenido
    const contentType =
      blob.type ||
      (isAudio ? 'audio/m4a' : 'application/octet-stream')

    // Crear respuesta con el archivo
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename || (isAudio ? 'audio' : 'video')}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Proxy download error:', error)
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
