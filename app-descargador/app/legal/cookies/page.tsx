export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>
      
      <div className="prose prose-lg">
        <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        
        <h2>1. ¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web.</p>

        <h2>2. Cookies que Utilizamos</h2>
        <p>En FTYDownloader Pro utilizamos cookies para:</p>
        <ul>
          <li>Mejorar la experiencia de usuario</li>
          <li>Recordar tus preferencias</li>
          <li>Analizar el tráfico del sitio</li>
          <li>Garantizar el funcionamiento técnico</li>
        </ul>

        <h2>3. Control de Cookies</h2>
        <p>Puedes gestionar tus preferencias de cookies a través de la configuración de tu navegador.</p>

        <h2>4. Cookies de Terceros</h2>
        <p>Utilizamos servicios de análisis como Google Analytics para entender cómo los usuarios interactúan con nuestro sitio.</p>
      </div>
    </div>
  )
}