'use client'

import Link from 'next/link'

export default function Footer() {
  const scrollToTools = () => {
    if (typeof window !== 'undefined') {
      // Si estamos en la página principal, hacer scroll
      if (window.location.pathname === '/') {
        document.getElementById('herramientas')?.scrollIntoView({ 
          behavior: 'smooth' 
        })
      } else {
        // Si estamos en otra página, ir a la página principal con hash
        window.location.href = '/#herramientas'
      }
    }
  }

  return (
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
              <li>
                <button 
                  onClick={scrollToTools}
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Descargar Videos
                </button>
              </li>
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
            &copy; 2025 FTYDownloader Pro. Herramienta gratuita para descargar videos.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Facebook, YouTube, TikTok - No afiliado con estas plataformas.
          </p>
        </div>
      </div>
    </footer>
  )
}