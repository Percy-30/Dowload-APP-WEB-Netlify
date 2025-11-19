export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Sobre Nosotros</h1>
      
      <div className="prose prose-lg">
        <h2>Nuestra Misión</h2>
        <p>
          En FTYDownloader Pro nos dedicamos a proporcionar herramientas gratuitas y de calidad 
          para que los creadores de contenido puedan gestionar y respaldar su trabajo de manera eficiente.
        </p>

        <h2>¿Qué Hacemos?</h2>
        <p>
          Desarrollamos herramientas de descarga seguras y fáciles de usar para las principales 
          plataformas de video: YouTube, Facebook y TikTok.
        </p>

        <h2>Nuestros Valores</h2>
        <ul>
          <li><strong>Gratuidad:</strong> Creemos que las herramientas básicas deben ser accesibles para todos</li>
          <li><strong>Calidad:</strong> Nos esforzamos por ofrecer la mejor experiencia de usuario</li>
          <li><strong>Seguridad:</strong> Protegemos la privacidad de nuestros usuarios</li>
          <li><strong>Educación:</strong> Proporcionamos contenido educativo para creadores</li>
        </ul>

        <h2>Compromiso con los Creadores</h2>
        <p>
          Entendemos las necesidades de los creadores de contenido y desarrollamos nuestras 
          herramientas pensando en facilitar su trabajo y optimizar su flujo de producción.
        </p>
      </div>
    </div>
  )
}