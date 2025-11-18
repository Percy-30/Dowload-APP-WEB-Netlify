// components/ads/AdInArticle.tsx
'use client'
import Script from 'next/script'

interface AdInArticleProps {
  adSlot: string
}

export default function AdInArticle({ adSlot }: AdInArticleProps) {
  return (
    <>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5414009811868137"
        data-ad-slot={adSlot}
        data-ad-format="fluid"
        data-ad-layout="in-article"
      ></ins>
      <Script
        id="adsense-inarticle"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
        }}
      />
    </>
  )
}
