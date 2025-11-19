// app/components/Layout/VideoRewardsAds.tsx - NETLIFY
'use client'

import AdDisplay from '@/components/Ads/AdDisplay'
import AdMultiplex from '@/components/Ads/AdMultiplex'
import AdInArticle from '@/components/Ads/AdInArticle'

interface VideoRewardsAdsProps {
  position: 'left' | 'right'
}

export default function VideoRewardsAds({ position }: VideoRewardsAdsProps) {
  return (
    <div className={`space-y-6 sticky top-24 ${position === 'left' ? 'ml-0' : 'mr-0'}`}>

      {/* Banner Display vertical - NUEVO SLOT NETLIFY */}
      <div className="w-full flex justify-center">
        <AdDisplay adSlot="8145069585" width={300} height={600} />
      </div>

      {/* Banner Multiplex - NUEVO SLOT NETLIFY */}
      <div className="w-full flex justify-center">
        <AdMultiplex adSlot="4147497713" width={300} height={250} />
      </div>

      {/* Banner In-Article - NUEVO SLOT NETLIFY */}
      <div className="w-full max-w-sm">
        <AdInArticle adSlot="9171210798" />
      </div>

    </div>
  )
}