// lib/platforms/tiktok.ts
import { isValidTiktokUrl } from '@/lib/validators'

export interface TiktokVideoInfo {
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

export async function getTiktokInfo(url: string): Promise<TiktokVideoInfo> {
  const response = await fetch('/api/download/tiktok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al procesar video de TikTok')
  }
  
  return response.json()
}