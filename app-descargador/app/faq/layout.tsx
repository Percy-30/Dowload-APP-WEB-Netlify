'use client'

import Header from '@/components/Layout/MainHeader'
import Footer from '@/components/Layout/Footer'

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}