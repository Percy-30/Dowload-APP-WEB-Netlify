// app/components/Layout/BannerAds.tsx
'use client'

import AdDisplay from '@/components/Ads/AdDisplay'
import AdMultiplex from '@/components/Ads/AdMultiplex'
import AdInArticle from '@/components/Ads/AdInArticle'

export default function BannerAds() {
  return (
    <div className="w-full flex flex-col items-center space-y-6 my-6">

      {/* Banner Display */}
      <div className="w-full flex justify-center">
        <AdDisplay adSlot="4095225502" width={728} height={90} />
      </div>

      {/* Banner Multiplex */}
      <div className="w-full flex justify-center">
        <AdMultiplex adSlot="9155980495" width={300} height={250} />
      </div>

      {/* Banner In-Article */}
      <div className="w-full max-w-3xl">
        <AdInArticle adSlot="5051701068" />
      </div>

    </div>
  )
}
