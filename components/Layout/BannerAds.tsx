'use client'

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                MultiDownloader Pro
              </h1>
              <p className="text-sm text-gray-600">
                Facebook, YouTube & TikTok Downloader
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ Gratis</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">⚡ Rápido</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">🔒 Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}