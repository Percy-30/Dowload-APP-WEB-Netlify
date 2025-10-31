// /api/download/facebook/audio/route.ts - VERSIÓN MEJORADA
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    console.log('Descargando audio de Facebook:', url)

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    const timestamp = Date.now()
    const outputFile = path.join(tmpDir, `facebook_audio_${timestamp}`)

    // Descargar y convertir a audio
    const audioProcess = spawn('yt-dlp', [
      '-x', // Extraer audio
      '--audio-format', 'mp3',
      '--audio-quality', '0', // Mejor calidad
      '--no-warnings',
      '--no-check-certificates',
      '--geo-bypass',
      '--force-ipv4',
      '-o', `${outputFile}.%(ext)s`,
      url
    ])

    let errorOutput = ''

    audioProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    const exitCode: number = await new Promise((resolve) => {
      audioProcess.on('close', resolve)
    })

    // Buscar el archivo generado (puede tener diferentes extensiones)
    const possibleFiles = [
      `${outputFile}.mp3`,
      `${outputFile}.m4a`,
      `${outputFile}.webm`
    ]

    let audioFile = null
    for (const file of possibleFiles) {
      if (fs.existsSync(file)) {
        audioFile = file
        break
      }
    }

    if (!audioFile) {
      console.error('No se encontró archivo de audio generado')
      throw new Error('Error al generar el archivo de audio')
    }

    const audioBuffer = fs.readFileSync(audioFile)
    
    // Limpiar archivos temporales
    possibleFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
      }
    })

    console.log('Audio descargado exitosamente:', audioBuffer.length, 'bytes')

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="facebook_audio_${timestamp}.mp3"`,
        'Content-Length': audioBuffer.length.toString(),
      }
    })

  } catch (error: any) {
    console.error('Error en audio download:', error)
    
    // Limpiar archivos temporales
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (fs.existsSync(tmpDir)) {
      const files = fs.readdirSync(tmpDir)
      files.forEach(file => {
        if (file.includes('facebook_audio_')) {
          fs.unlinkSync(path.join(tmpDir, file))
        }
      })
    }

    return NextResponse.json({
      error: 'Error al descargar el audio: ' + error.message
    }, { status: 500 })
  }
}