import { NextResponse } from 'next/server'

const RAILWAY_API_URL = process.env.RAILWAY_API_URL

export async function POST(req: Request) {
  try {
    const { url, quality = 'best' } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    if (!RAILWAY_API_URL) {
      return NextResponse.json(
        { error: 'Servidor de descargas no configurado' },
        { status: 500 }
      )
    }

    console.log('🔗 Proxy Facebook Video -> Railway:', { url, quality })

    // Proxy a Railway para video
    const response = await fetch(`${RAILWAY_API_URL}/api/facebook/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, quality }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Error al descargar video' },
        { status: response.status }
      )
    }

    // Railway devolverá el video directamente
    const videoBuffer = await response.arrayBuffer()
    
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="facebook_video_${quality}_${Date.now()}.mp4"`,
        'Content-Length': videoBuffer.byteLength.toString(),
      }
    })

  } catch (error: any) {
    console.error('💥 Proxy Facebook Video error:', error)
    return NextResponse.json(
      { error: 'Error de conexión con el servidor' },
      { status: 500 }
    )
  }
}