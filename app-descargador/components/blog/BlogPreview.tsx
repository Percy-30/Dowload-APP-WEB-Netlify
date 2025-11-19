import Link from 'next/link'
import { blogPosts } from '@/lib/content/blog-posts'
import Image from 'next/image'

export default function BlogPreview() {
  const featuredPosts = blogPosts.slice(0, 3)

  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Aprende con Nuestros Tutoriales
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Contenido educativo de calidad para ayudarte a mejorar como creador digital.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {featuredPosts.map((post) => (
          <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {post.image && (
              <div className="h-48 relative">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-blue-600 font-medium">{post.readTime} de lectura</span>
                <span className="text-sm text-gray-500">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <Link 
                href={`/blog/${post.slug}`}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Leer más →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center">
        <Link 
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos los artículos
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}