// /api/download/facebook/video/route.ts - VERSIÓN MEJORADA
import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export const maxDuration = 180

export async function POST(req: Request) {
  try {
    const { url, quality = 'best' } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    console.log('Descargando video de Facebook:', { url, quality })

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    const timestamp = Date.now()
    const outputFile = path.join(tmpDir, `facebook_video_${timestamp}.mp4`)

    // ESTRATEGIA MEJORADA: Probar diferentes formatos
    let success = await downloadWithFormat(url, outputFile, quality)
    
    if (!success) {
      // Fallback: intentar con el mejor formato disponible
      success = await downloadWithFormat(url, outputFile, 'best')
    }

    if (!success) {
      // Último fallback: descargar sin especificar formato
      success = await downloadWithFormat(url, outputFile, '')
    }

    if (!success || !fs.existsSync(outputFile)) {
      throw new Error('No se pudo descargar el video después de varios intentos')
    }

    // Verificar que el archivo no esté vacío
    const stats = fs.statSync(outputFile)
    if (stats.size === 0) {
      fs.unlinkSync(outputFile)
      throw new Error('El archivo descargado está vacío')
    }

    const videoBuffer = fs.readFileSync(outputFile)
    
    // Limpiar archivo temporal
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile)
    }

    console.log('Video descargado exitosamente:', stats.size, 'bytes')

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="facebook_video_${timestamp}.mp4"`,
        'Content-Length': videoBuffer.length.toString(),
      }
    })

  } catch (error: any) {
    console.error('Error en video download:', error)
    
    // Limpiar archivos temporales en caso de error
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (fs.existsSync(tmpDir)) {
      const files = fs.readdirSync(tmpDir)
      files.forEach(file => {
        if (file.includes('facebook_video_')) {
          fs.unlinkSync(path.join(tmpDir, file))
        }
      })
    }

    return NextResponse.json({
      error: 'Error al descargar el video: ' + error.message
    }, { status: 500 })
  }
}

async function downloadWithFormat(url: string, outputFile: string, format: string): Promise<boolean> {
  return new Promise((resolve) => {
    const args = [
      '--no-warnings',
      '--no-check-certificates',
      '--geo-bypass',
      '--force-ipv4',
      '-o', outputFile
    ]

    // Agregar formato solo si se especifica
    if (format) {
      args.push('--format', format)
    }

    args.push(url)

    const process = spawn('yt-dlp', args)

    let errorOutput = ''

    process.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    process.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile)
        if (stats.size > 0) {
          console.log(`Descarga exitosa con formato ${format || 'default'}:`, stats.size, 'bytes')
          resolve(true)
        } else {
          fs.unlinkSync(outputFile)
          resolve(false)
        }
      } else {
        console.log(`Error con formato ${format}:`, errorOutput)
        resolve(false)
      }
    })

    // Timeout después de 60 segundos
    setTimeout(() => {
      process.kill()
      resolve(false)
    }, 60000)
  })
}