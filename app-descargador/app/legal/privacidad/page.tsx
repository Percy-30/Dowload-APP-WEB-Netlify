export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
      
      <div className="prose prose-lg">
        <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        
        <h2>1. Información que Recopilamos</h2>
        <p>En ContentManager, nos comprometemos a proteger tu privacidad. Recopilamos únicamente la información necesaria para proporcionar nuestros servicios:</p>
        <ul>
          <li>Enlaces de videos que procesas temporalmente</li>
          <li>Datos de uso anónimos para mejorar nuestros servicios</li>
          <li>Información técnica como tipo de navegador y dispositivo</li>
        </ul>

        <h2>2. Uso de la Información</h2>
        <p>Utilizamos la información para:</p>
        <ul>
          <li>Procesar tus solicitudes de descarga</li>
          <li>Mejorar la calidad de nuestros servicios</li>
          <li>Garantizar la seguridad de la plataforma</li>
        </ul>

        <h2>3. Cookies y Tecnologías Similares</h2>
        <p>Utilizamos cookies para mejorar tu experiencia. Puedes gestionar tus preferencias en cualquier momento.</p>

        <h2>4. Contacto</h2>
        <p>Para preguntas sobre esta política, contáctanos a través de nuestro formulario.</p>
      </div>
    </div>
  )
}