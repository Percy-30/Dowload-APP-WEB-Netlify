// app/components/Layout/SlidebarAds.tsx - NETLIFY
'use client'

import AdDisplay from '@/components/Ads/AdDisplay'
import AdMultiplex from '@/components/Ads/AdMultiplex'

interface SidebarAdsProps {
  position?: 'left' | 'right'
}

export default function SidebarAds({ position = 'right' }: SidebarAdsProps) {
  return (
    <div className={`space-y-6 sticky top-24 ${position === 'left' ? 'ml-0' : 'mr-0'}`}>

      {/* Anuncio tipo Display vertical - NUEVO SLOT NETLIFY */}
      <AdDisplay adSlot="8145069585" width={300} height={600} />

      {/* Anuncio Multiplex - NUEVO SLOT NETLIFY */}
      <AdMultiplex adSlot="4147497713" width={300} height={250} />

    </div>
  )
}