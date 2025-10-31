const features = [
  {
    title: 'Rápido',
    description: 'Descargas instantáneas sin esperas ni límites'
  },
  {
    title: 'Seguro',
    description: 'Sin registro, sin software malicioso, 100% seguro'
  },
  {
    title: 'Responsive',
    description: 'Diseño perfecto para móviles y tablets'
  },
  {
    title: 'Multi-formato',
    description: 'MP4, WEBM, MP3 y más formatos disponibles'
  },
  {
    title: 'Siempre Online',
    description: 'Servicio disponible 24/7 sin interrupciones'
  },
  {
    title: 'Gratuito',
    description: 'Completamente gratis, sin costos ocultos'
  }
]

export default function FeaturesSection() {
  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        ¿Por qué elegirnos?
      </h2>
      <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
        La mejor herramienta para descargar videos de Facebook, Youtube y Tiktok con la máxima calidad y velocidad
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}