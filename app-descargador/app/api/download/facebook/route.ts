import { NextResponse } from 'next/server'

// Agregar valor por defecto para desarrollo
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'http://localhost:3001'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    // LOGS DE DIAGNÓSTICO
    console.log('🔧 DIAGNÓSTICO:')
    console.log('🔧 RAILWAY_API_URL:', RAILWAY_API_URL)
    console.log('🔧 process.env.RAILWAY_API_URL:', process.env.RAILWAY_API_URL)
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV)
    console.log('🔗 Proxy Facebook Info -> Railway:', url)

    if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
      return NextResponse.json({ error: 'URL inválida de Facebook' }, { status: 400 })
    }

    if (!RAILWAY_API_URL) {
      console.error('❌ ERROR: RAILWAY_API_URL no configurada')
      return NextResponse.json(
        { error: 'Servidor de descargas no configurado' },
        { status: 500 }
      )
    }

    console.log('🚀 Haciendo fetch a:', `${RAILWAY_API_URL}/api/facebook/info`)

    // Proxy a Railway
    const response = await fetch(`${RAILWAY_API_URL}/api/facebook/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Error desde Railway:', data)
      return NextResponse.json(
        { error: data.error || 'Error en el servidor de descargas' },
        { status: response.status }
      )
    }

    console.log('✅ Respuesta exitosa desde Railway')
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('💥 Proxy Facebook error:', error)
    return NextResponse.json(
      { error: 'Error de conexión con el servidor: ' + error.message },
      { status: 500 }
    )
  }
}