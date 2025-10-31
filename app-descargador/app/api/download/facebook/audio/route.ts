import { NextResponse } from 'next/server'

const RAILWAY_API_URL = process.env.RAILWAY_API_URL

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    if (!RAILWAY_API_URL) {
      return NextResponse.json(
        { error: 'Servidor de descargas no configurado' },
        { status: 500 }
      )
    }

    console.log('🔗 Proxy Facebook Audio -> Railway:', url)

    // En Railway necesitamos crear un endpoint para audio
    const response = await fetch(`${RAILWAY_API_URL}/api/facebook/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Error al descargar audio' },
        { status: response.status }
      )
    }

    // Railway devolverá el audio directamente
    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="facebook_audio_${Date.now()}.mp3"`,
        'Content-Length': audioBuffer.byteLength.toString(),
      }
    })

  } catch (error: any) {
    console.error('💥 Proxy Facebook Audio error:', error)
    return NextResponse.json(
      { error: 'Error de conexión con el servidor' },
      { status: 500 }
    )
  }
}