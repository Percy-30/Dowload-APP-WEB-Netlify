import { notFound } from 'next/navigation'
import Link from 'next/link'
import { blogPosts } from '@/lib/content/blog-posts'

// ✅ SOLUCIÓN: Forzar dynamic generation
export const dynamicParams = false

// ✅ Generar TODAS las rutas estáticas
export async function generateStaticParams() {
  console.log('🔨 Generando rutas estáticas para blog posts...')
  
  const params = blogPosts.map((post) => ({
    slug: post.slug,
  }))
  
  console.log('📁 Rutas generadas:', params)
  return params
}

// ✅ Metadata para SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug)
  
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

export default function BlogPost({ params }: { params: { slug: string } }) {
  console.log('🔍 Buscando artículo con slug:', params.slug)
  
  const post = blogPosts.find(p => p.slug === params.slug)

  if (!post) {
    console.log('❌ Artículo no encontrado:', params.slug)
    notFound()
  }

  console.log('✅ Artículo encontrado:', post.title)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
    

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
     
    </div>
  )
}