'use client' // ✅ SOLO AGREGAR ESTA LÍNEA

import BlogHeader from '@/components/Layout/MainHeader'
import Footer from '@/components/Layout/Footer'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />
      <main>{children}</main>
      <Footer />
    </div>
  )
}