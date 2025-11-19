export default function FAQPage() {
  const faqs = [
    {
      question: "¿Es gratuito FTYDownloader Pro?",
      answer: "Sí, completamente gratuito. No requiere registro ni suscripción."
    },
    {
      question: "¿Qué plataformas son compatibles?",
      answer: "Actualmente soportamos YouTube, Facebook y TikTok. Estamos trabajando para agregar más plataformas."
    },
    {
      question: "¿Qué calidad de video puedo descargar?",
      answer: "Depende del video original. Soporta desde 360p hasta 1080p y 4K cuando está disponible."
    },
    {
      question: "¿Puedo descargar videos en MP3?",
      answer: "Sí, ofrecemos la opción de extraer solo el audio en formato MP3."
    },
    {
      question: "¿Es seguro usar FTYDownloader Pro?",
      answer: "Completamente seguro. No almacenamos tus videos ni información personal. Todo el proceso es en tiempo real."
    },
    {
      question: "¿Funciona en dispositivos móviles?",
      answer: "Sí, nuestro sitio es completamente responsive y funciona en smartphones, tablets y computadoras."
    },
    {
      question: "¿Necesito instalar algún software?",
      answer: "No, es una herramienta web. Solo necesitas un navegador moderno como Chrome, Firefox o Safari."
    },
    {
      question: "¿Hay límite de descargas?",
      answer: "No establecemos límites. Puedes descargar tantos videos como necesites."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Preguntas Frecuentes</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {faq.question}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Sección de contacto adicional */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">¿No encontraste tu respuesta?</h2>
        <p className="text-gray-600 mb-6">
          Contáctanos y te ayudaremos con cualquier duda.
        </p>
        <a 
          href="/contact" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium inline-block"
        >
          Contactar Soporte
        </a>
      </div>
    </div>
  )
}