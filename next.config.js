/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['yt-dlp-wrap'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ],
      },
    ]
  },
  images: {
    domains: ['images.unsplash.com', 'picsum.photos', 'via.placeholder.com'],
  },
}

export default nextConfig
