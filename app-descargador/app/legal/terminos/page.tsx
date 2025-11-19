export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Términos de Servicio</h1>
      
      <div className="prose prose-lg">
        <h2>1. Aceptación de los Términos</h2>
        <p>Al utilizar ContentManager, aceptas cumplir con estos términos de servicio.</p>

        <h2>2. Uso Aceptable</h2>
        <p>Nuestras herramientas están diseñadas para:</p>
        <ul>
          <li>Gestionar contenido propio creado por el usuario</li>
          <li>Descargar videos para uso personal y educativo</li>
          <li>Respaldar contenido original del creador</li>
        </ul>

        <h2>3. Uso Prohibido</h2>
        <p>Queda estrictamente prohibido:</p>
        <ul>
          <li>Descargar contenido protegido por derechos de autor sin permiso</li>
          <li>Utilizar el servicio para fines comerciales no autorizados</li>
          <li>Distribuir contenido que no sea de tu propiedad</li>
        </ul>

        <h2>4. Limitación de Responsabilidad</h2>
        <p>El usuario es responsable del uso que da al contenido descargado. ContentManager no se hace responsable del mal uso de la plataforma.</p>

        <h2>5. Modificaciones</h2>
        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>
      </div>
    </div>
  )
}