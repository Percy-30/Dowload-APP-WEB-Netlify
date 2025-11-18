// components/ads/AdMultiplex.tsx
'use client'
import Script from 'next/script'

interface AdMultiplexProps {
  adSlot: string
  width?: number
  height?: number
}

export default function AdMultiplex({ adSlot, width = 300, height = 250 }: AdMultiplexProps) {
  return (
    <>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width, height }}
        data-ad-client="ca-pub-5414009811868137"
        data-ad-slot={adSlot}
        data-ad-format="autorelaxed"
      ></ins>
      <Script
        id="adsense-multiplex"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </>
  )
}
