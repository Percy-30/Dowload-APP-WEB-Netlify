import { notFound } from 'next/navigation'
import Link from 'next/link'
import { blogPosts } from '@/lib/content/blog-posts'

// ✅ GENERAR PARAMS COMO PROMISE
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

// ✅ METADATA
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params // ✅ ESPERAR LA PROMESA
  const post = blogPosts.find(p => p.slug === slug)
  
  if (!post) {
    return {
      title: 'Artículo No Encontrado - FTYDownloader Pro',
    }
  }

  return {
    title: `${post.title} - FTYDownloader Pro`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  }
}

// ✅ COMPONENTE PRINCIPAL CON PARAMS COMO PROMISE
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params // ✅ ESPERAR LA PROMESA
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FTYDownloader Pro</h1>
                <p className="text-sm text-gray-600">Facebook, YouTube & TikTok Downloader</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Inicio</Link>
              <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Blog</Link>
              <Link href="/tools" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Descargar Videos</Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">FAQ</Link>
            </nav>

            <Link href="/contact" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm">
              Contacto
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido del artículo */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/blog" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Volver al blog
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-gray-500 text-sm">{post.date}</span>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-500 text-sm">{post.readTime} de lectura</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-xl text-gray-600">{post.excerpt}</p>
        </header>

        {post.image && (
          <div className="mb-8">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Ver todos los artículos
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">FTYDownloader Pro</h3>
              <p className="text-gray-400 text-sm">
                Descarga videos de Facebook, YouTube y TikTok gratis y en alta calidad.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/tools" className="text-gray-400 hover:text-white transition-colors">Descargar Videos</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/legal/privacidad" className="text-gray-400 hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/legal/terminos" className="text-gray-400 hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="/legal/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Nosotros</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 FTYDownloader Pro. Herramienta gratuita para descargar videos.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Facebook, YouTube, TikTok - No afiliado con estas plataformas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}