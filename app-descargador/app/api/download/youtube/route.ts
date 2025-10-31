import { NextRequest, NextResponse } from 'next/server'

// AGREGAR VALOR POR DEFECTO (igual que Facebook)
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    let { url } = await request.json()

    // AGREGAR LOGS DE DIAGNÓSTICO
    console.log('🔧 DIAGNÓSTICO YouTube:')
    console.log('🔧 RAILWAY_API_URL:', RAILWAY_API_URL)
    console.log('🔧 process.env.RAILWAY_API_URL:', process.env.RAILWAY_API_URL)
    console.log('📥 YouTube Info Request:', url)

    if (!RAILWAY_API_URL) {
      console.error('❌ ERROR: RAILWAY_API_URL no configurada para YouTube')
      return NextResponse.json(
        { error: 'Servidor de descargas no configurado' },
        { status: 500 }
      )
    }

    // Limpiar URL (mantener tu lógica)
    const cleanYoutubeUrl = (url: string): string => {
      const index = url.indexOf('&')
      return index !== -1 ? url.substring(0, index) : url
    }
    url = cleanYoutubeUrl(url)

    // Validación (mantener tu lógica)
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/
  
    if (!url || !youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'URL de YouTube inválida. Ejemplo: https://www.youtube.com/watch?v=ABC123' },
        { status: 400 }
      )
    }

    console.log('🔗 Proxy YouTube -> Railway:', url)
    console.log('🚀 Haciendo fetch a:', `${RAILWAY_API_URL}/api/youtube/info`)

    // Proxy a Railway
    const response = await fetch(`${RAILWAY_API_URL}/api/youtube/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Error desde Railway YouTube:', data)
      return NextResponse.json(
        { error: data.error || 'Error en el servidor de descargas' },
        { status: response.status }
      )
    }

    console.log('✅ YouTube info obtenida desde Railway')
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('💥 Proxy YouTube error:', error)
    return NextResponse.json(
      { error: 'Error de conexión con el servidor: ' + error.message },
      { status: 500 }
    )
  }
}