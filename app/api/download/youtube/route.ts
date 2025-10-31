// app/api/download/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

export const maxDuration = 60

// Función para limpiar URL de YouTube
function cleanYoutubeUrl(url: string): string {
  const index = url.indexOf('&')
  return index !== -1 ? url.substring(0, index) : url
}


export async function POST(request: NextRequest) {
  try {
    let { url } = await request.json()

    console.log('📥 URL recibida:', url)

    // Limpiar parámetros adicionales
    url = cleanYoutubeUrl(url)

    // Validación más flexible de YouTube
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)/
  
    if (!url || !youtubeRegex.test(url)) {
      console.log('❌ URL inválida:', url)
      return NextResponse.json(
        { error: 'URL de YouTube inválida. Ejemplo: https://www.youtube.com/watch?v=ABC123' },
        { status: 400 }
      )
    }

    // Timeout para evitar procesos largos
    const timeoutPromise = sleep(25000).then(() => {
      throw new Error('Timeout: El proceso tardó demasiado')
    })

    const ytProcess = spawn('yt-dlp', [
      '--dump-json',
      '--no-warnings',
      '--no-check-certificates',
      '--geo-bypass',
      url
    ])

    let output = ''
    let errorOutput = ''

    ytProcess.stdout.on('data', data => output += data.toString())
    ytProcess.stderr.on('data', data => errorOutput += data.toString())

    const processPromise = new Promise<number>((resolve, reject) => {
      ytProcess.on('close', (code) => {
        if (code === 0 && output) {
          resolve(code)
        } else {
          reject(new Error(`yt-dlp exit code: ${code}, Error: ${errorOutput}`))
        }
      })
      
      ytProcess.on('error', (error) => {
        reject(new Error(`Process error: ${error.message}`))
      })
    })

    // Esperar proceso o timeout
    await Promise.race([processPromise, timeoutPromise])

    const info = JSON.parse(output)

    // Filtrar formatos válidos
    const formats = (info.formats || [])
      .filter((f: any) => f.url && (f.vcodec !== 'none' || f.acodec !== 'none'))
      .map((f: any) => ({
        quality: f.format_note || `Format ${f.format_id}`,
        format: f.ext || 'mp4',
        resolution: f.width && f.height ? `${f.width}x${f.height}` : f.resolution || 'HD',
        fps: f.fps || null,
        size: f.filesize ? `${(f.filesize / 1024 / 1024).toFixed(1)} MB` : 'Desconocido',
        url: f.url,
        hasAudio: f.acodec !== 'none',
        hasVideo: f.vcodec !== 'none'
      }))

    // Si no hay formatos, usar URL principal
    if (formats.length === 0 && info.url) {
      formats.push({
        quality: 'Calidad por defecto',
        format: info.ext || 'mp4',
        resolution: 'HD',
        size: 'Desconocido',
        url: info.url,
        hasAudio: true,
        hasVideo: true
      })
    }

    console.log('✅ Video procesado:', info.title)

    return NextResponse.json({
      status: 'success',
      platform: 'youtube',
      title: info.title || 'Video de YouTube',
      thumbnail: info.thumbnail || '',
      duration: info.duration || 0,
      uploader: info.uploader || 'Desconocido',
      view_count: info.view_count || 0,
      formats
    })

  } catch (error: any) {
    console.error('❌ Error API YouTube:', error.message)
    
    if (error.message.includes('Timeout')) {
      return NextResponse.json(
        { error: 'El video es muy largo o el servidor está ocupado. Intenta con un video más corto.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el video de YouTube',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}