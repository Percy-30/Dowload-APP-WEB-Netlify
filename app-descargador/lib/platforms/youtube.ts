// lib/platforms/youtube.ts
import { isValidYoutubeUrl } from '@/lib/validators'

export interface YoutubeVideoInfo {
  status: string
  platform: string
  title: string
  thumbnail: string
  duration: number
  uploader: string
  formats: Array<{
    quality: string
    format: string
    resolution: string
    size: string
    url: string
    hasAudio?: boolean
    hasVideo?: boolean
  }>
  method?: string
  view_count?: number
}

export async function getYoutubeInfo(url: string): Promise<YoutubeVideoInfo> {
  const response = await fetch('/api/download/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al procesar video de YouTube')
  }
  
  return response.json()
}