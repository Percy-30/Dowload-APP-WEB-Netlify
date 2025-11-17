// app/api/download/facebook/route.ts - VERSIÓN CON BODY
import { NextRequest, NextResponse } from 'next/server'

// URL de tu backend Python FastAPI
//const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'
const PYTHON_API_URL = (process.env.PYTHON_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    console.log('📥 Facebook API Request:', url)

    if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
      return NextResponse.json(
        { error: 'URL de Facebook inválida' },
        { status: 400 }
      )
    }

    if (!PYTHON_API_URL) {
      console.error('❌ ERROR: PYTHON_API_URL no configurada')
      return NextResponse.json(
        { error: 'Backend no configurado' },
        { status: 500 }
      )
    }

    const backendUrl = `${PYTHON_API_URL}/api/v1/facebook/info`

    console.log('🚀 Llamando a backend Python:', backendUrl)

    // Usar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Llamar al backend de Python con body
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal
      })

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error desde backend Python:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        let errorDetail = 'Error del backend';
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.detail || errorData.error || errorText;
        } catch {
          errorDetail = errorText;
        }
        
        return NextResponse.json(
          { error: errorDetail },
          { status: response.status }
        )
      }

      const data = await response.json();
      console.log('✅ Respuesta exitosa desde backend Python');

      return NextResponse.json(data);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏰ Timeout en llamada a backend Python');
        return NextResponse.json(
          { error: 'Timeout: El backend tardó demasiado en responder' },
          { status: 408 }
        );
      }
      throw fetchError;
    }

  } catch (error: any) {
    console.error('💥 Facebook API error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}