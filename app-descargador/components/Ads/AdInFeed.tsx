// components/ads/AdInFeed.tsx
'use client'
import Script from 'next/script'

interface AdInFeedProps {
  adSlot: string
}

export default function AdInFeed({ adSlot }: AdInFeedProps) {
  return (
    <>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5414009811868137"
        data-ad-slot={adSlot}
        data-ad-format="fluid"
        data-ad-layout-key="-fg+5n+6t-e7+bf"
      ></ins>
      <Script
        id="adsense-infeed"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </>
  )
}
