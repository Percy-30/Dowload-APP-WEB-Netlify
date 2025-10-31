// /api/download/facebook/route.ts - VERSIÓN CORREGIDA
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
      return NextResponse.json({ error: 'URL inválida de Facebook' }, { status: 400 })
    }

    console.log('Procesando URL de Facebook:', url)

    // PRIMERO: Obtener información básica del video
    const info = await getVideoInfo(url)
    if (!info) {
      return NextResponse.json({
        status: 'error',
        message: 'No se pudo obtener información del video'
      }, { status: 500 })
    }

    // SEGUNDO: Obtener formatos disponibles
    const formats = await getAvailableFormats(url)
    
    const responseData = {
      status: 'success',
      platform: 'facebook',
      title: info.title || 'Video de Facebook',
      thumbnail: info.thumbnail || '',
      duration: info.duration || 0,
      width: info.width || null,
      height: info.height || null,
      method: 'yt-dlp',
      formats: formats,
      original_url: url
    }

    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('Error backend Facebook:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al procesar la solicitud',
        error: error.message
      },
      { status: 500 }
    )
  }
}

// Función para obtener información básica del video
async function getVideoInfo(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const process = spawn('yt-dlp', [
      '--dump-json',
      '--no-warnings',
      '--no-check-certificates',
      '--geo-bypass',
      '--format', 'best', // Usar el mejor formato disponible
      url
    ])

    let output = ''
    let errorOutput = ''

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    process.on('close', (code) => {
      if (code === 0 && output) {
        try {
          const info = JSON.parse(output)
          resolve(info)
        } catch (parseError) {
          reject(new Error('Error parseando información del video'))
        }
      } else {
        reject(new Error(`yt-dlp error: ${errorOutput}`))
      }
    })
  })
}

// Función para obtener formatos disponibles
async function getAvailableFormats(url: string): Promise<any[]> {
  return new Promise((resolve) => {
    const process = spawn('yt-dlp', [
      '--list-formats',
      '--no-warnings',
      '--no-check-certificates',
      url
    ])

    let output = ''
    let errorOutput = ''

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    process.on('close', () => {
      try {
        const formats = parseFormatsOutput(output)
        resolve(formats.length > 0 ? formats : getDefaultFormats())
      } catch (error) {
        console.error('Error parseando formatos:', error)
        resolve(getDefaultFormats())
      }
    })
  })
}

// Función para parsear la salida de list-formats
function parseFormatsOutput(output: string): any[] {
  const formats = []
  const lines = output.split('\n')
  
  for (const line of lines) {
    // Buscar líneas que contengan información de formatos
    if (line.includes('mp4') || line.includes('webm') || line.includes('m4a')) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 3) {
        const formatCode = parts[0]
        const extension = parts[1]
        const resolution = parts[2]
        const note = parts.slice(3).join(' ') || ''

        // Solo incluir formatos de video que probablemente tengan audio
        if (extension === 'mp4' && !note.includes('audio only') && !note.includes('video only')) {
          formats.push({
            quality: resolution || 'HD',
            format: extension,
            resolution: resolution || '1920x1080',
            size: 'Desconocido',
            url: '', // Se generará al descargar
            hasAudio: true,
            format_code: formatCode
          })
        }
      }
    }
  }

  return formats
}

function getDefaultFormats() {
  return [
    {
      quality: 'Calidad HD',
      format: 'mp4',
      resolution: '1920x1080',
      size: 'Desconocido',
      url: '',
      hasAudio: true,
      type: 'default'
    }
  ]
}