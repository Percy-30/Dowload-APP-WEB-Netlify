// app/components/Layout/SlidebarAds.tsx

'use client'

import AdDisplay from '@/components/Ads/AdDisplay'
import AdMultiplex from '@/components/Ads/AdMultiplex'

interface SidebarAdsProps {
  position?: 'left' | 'right'
}

export default function SidebarAds({ position = 'right' }: SidebarAdsProps) {
  return (
    <div className={`space-y-6 sticky top-24 ${position === 'left' ? 'ml-0' : 'mr-0'}`}>

      {/* Anuncio tipo Display vertical */}
      <AdDisplay adSlot="4095225502" width={300} height={600} />

      {/* Anuncio Multiplex */}
      <AdMultiplex adSlot="9155980495" width={300} height={250} />

    </div>
  )
}
