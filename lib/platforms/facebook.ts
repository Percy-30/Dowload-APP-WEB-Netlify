// lib/platforms/facebook.ts
import { isValidFacebookUrl } from '@/lib/validators'

export interface FacebookVideoInfo {
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

export async function getFacebookInfo(url: string): Promise<FacebookVideoInfo> {
  const response = await fetch('/api/download/facebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al procesar video de Facebook')
  }
  
  return response.json()
}