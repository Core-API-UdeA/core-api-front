<template>
  <div class="q-mx-auto q-pa-sm" style="max-width: 800px">
    <!-- Recuadro gris -->
    <div
      class="q-pa-lg q-mt-md texto-justificado"
      style="
        background-color: #2f2f2f;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
      "
    >
      <!-- Título de la página -->
      <h4 class="text-h5 text-bold q-mb-md" style="color: #009688; text-align: center">
        Términos y Condiciones
      </h4>

      <!-- Logo y nombre de la app -->
      <q-toolbar-title class="row items-center q-mb-md justify-center">
        <img src="~assets/core api.png" alt="Logo" style="height: 25px; margin-right: 10px" />
        <span style="color: white; font-weight: bold; font-size: 18px"></span>
      </q-toolbar-title>

      <!-- Contenido -->
      <p>
        Bienvenido a <strong style="color: white">CoreApi</strong>. Al acceder y/o utilizar nuestros
        servicios, usted acepta cumplir con nuestras políticas de términos y condiciones.
      </p>

      <h6 class="text-subtitle1 text-bold q-mt-md">1. Definiciones</h6>
      <ul>
        <li>
          <strong>Usuario:</strong> Persona que accede a la plataforma para consultar, consumir o
          publicar APIs.
        </li>
        <li>
          <strong>Proveedor:</strong> Usuario o empresa que publica APIs en la plataforma para su
          consumo por terceros.
        </li>
        <li>
          <strong>Cuenta:</strong> Perfil creado por el usuario al registrarse para acceder a los
          servicios de la plataforma.
        </li>
        <li>
          <strong>API Certificada:</strong> Microservicio que ha superado nuestro proceso de
          validación técnica y de seguridad.
        </li>
        <li>
          <strong>Contenido:</strong> Información, documentación y recursos relacionados con las
          APIs disponibles en <strong style="color: white">CoreApi</strong>.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">2. Uso de la plataforma</h6>
      <ul>
        <li>
          El usuario se compromete a usar <strong style="color: white">CoreApi</strong> solo para
          fines legales y autorizados.
        </li>
        <li>
          Está prohibido cualquier uso que pueda dañar, interrumpir o afectar la seguridad de la
          plataforma o de las APIs publicadas.
        </li>
        <li>
          Los usuarios pueden consultar el catálogo de APIs y su documentación básica sin
          registrarse.
        </li>
        <li>
          Para consumir APIs o publicar servicios, es obligatorio crear una cuenta y aceptar estos
          términos.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">3. Registro y cuentas de usuario</h6>
      <ul>
        <li>
          Para consumir o publicar APIs, los usuarios deben registrarse proporcionando nombre
          completo, correo electrónico y, en caso de proveedores, información empresarial
          verificable.
        </li>
        <li>
          Cada usuario es responsable de mantener la confidencialidad de su cuenta, contraseña y
          claves API generadas.
        </li>
        <li>
          <strong style="color: white">CoreApi</strong> no se hace responsable por accesos no
          autorizados ocasionados por negligencia del usuario.
        </li>
        <li>
          Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos o
          realicen actividades sospechosas.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">4. Proceso de certificación de APIs</h6>
      <div
        class="q-pa-md q-mb-md"
        style="background-color: #1a5f58; border-radius: 8px; border-left: 4px solid #009688"
      >
        <p class="text-bold" style="color: #00e5cc; margin-bottom: 8px">
          Compromiso de seguridad y calidad
        </p>
        <p>
          En <strong style="color: white">CoreApi</strong> garantizamos que todas las APIs
          disponibles en nuestro catálogo han sido sometidas a un riguroso proceso de certificación
          antes de estar disponibles para suscripción.
        </p>
      </div>
      <ul>
        <li>
          <strong>Validación técnica:</strong> Verificamos que cada API cumpla con estándares de
          desarrollo, documentación completa, versionado adecuado y tiempos de respuesta óptimos.
        </li>
        <li>
          <strong>Auditoría de seguridad:</strong> Realizamos pruebas de seguridad que incluyen
          validación de autenticación, cifrado de datos, protección contra inyecciones y
          vulnerabilidades comunes (OWASP Top 10).
        </li>
        <li>
          <strong>Pruebas de estabilidad:</strong> Monitoreamos el rendimiento, disponibilidad y
          manejo de errores de cada API durante un período de prueba antes de su aprobación.
        </li>
        <li>
          <strong>Revisión de cumplimiento:</strong> Verificamos que las APIs cumplan con
          regulaciones de protección de datos (GDPR, CCPA) y no infrinjan derechos de terceros.
        </li>
        <li>
          <strong>Monitoreo continuo:</strong> Una vez aprobadas, las APIs son monitoreadas
          permanentemente. Cualquier degradación en rendimiento o seguridad resultará en suspensión
          temporal hasta su corrección.
        </li>
        <li>
          <strong>Tiempo de certificación:</strong> El proceso puede tomar entre 3 a 7 días hábiles
          dependiendo de la complejidad de la API. Los proveedores serán notificados del estado en
          cada etapa.
        </li>
        <li>
          <strong>Sello de certificación:</strong> Las APIs aprobadas reciben un distintivo visible
          que garantiza a los consumidores que han superado nuestros controles de calidad.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">
        5. Responsabilidades de los proveedores de APIs
      </h6>
      <ul>
        <li>
          Los proveedores deben mantener actualizada la documentación de sus APIs y notificar
          cualquier cambio significativo con al menos 30 días de anticipación.
        </li>
        <li>
          Es responsabilidad del proveedor garantizar la disponibilidad del servicio según los
          niveles de SLA (Service Level Agreement) establecidos.
        </li>
        <li>
          Los proveedores deben responder a incidentes críticos de seguridad en un plazo máximo de
          24 horas.
        </li>
        <li>
          Cualquier API que no mantenga los estándares de calidad será suspendida hasta su
          corrección, con notificación previa al proveedor y a los usuarios afectados.
        </li>
        <li>
          Los proveedores son responsables de los datos que procesan sus APIs y deben cumplir con
          todas las regulaciones aplicables de protección de datos.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">6. Responsabilidades de los consumidores</h6>
      <ul>
        <li>
          Los consumidores deben usar las APIs de acuerdo con su documentación y límites de uso
          establecidos.
        </li>
        <li>
          Está prohibido realizar ingeniería inversa, intentos de penetración no autorizados o
          cualquier actividad que comprometa la seguridad de las APIs.
        </li>
        <li>
          Los consumidores son responsables de proteger sus claves API y tokens de autenticación.
        </li>
        <li>
          El uso abusivo o que exceda los límites contratados puede resultar en suspensión temporal
          o permanente del servicio.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">7. Monetización y facturación</h6>
      <ul>
        <li>
          <strong style="color: white">CoreApi</strong> facilita la monetización de APIs mediante
          integración con plataformas de pago seguras como MercadoPago.
        </li>
        <li>
          Los precios y planes de suscripción son establecidos por cada proveedor dentro de los
          parámetros de la plataforma.
        </li>
        <li>
          <strong style="color: white">CoreApi</strong> cobra una comisión del 15% sobre cada
          transacción realizada a través de la plataforma para cubrir costos de infraestructura,
          seguridad y soporte.
        </li>
        <li>
          Las renovaciones de suscripciones son automáticas salvo que el usuario cancele con al
          menos 48 horas de anticipación.
        </li>
        <li>
          Los reembolsos serán evaluados caso por caso en situaciones de fallas técnicas
          comprobables no resueltas en tiempo razonable.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">8. Propiedad intelectual</h6>
      <p>
        Todo el contenido de <strong style="color: white">CoreApi</strong>, incluyendo la
        plataforma, diseño, logotipos y código fuente, es propiedad exclusiva de CoreApi. Las APIs
        publicadas son propiedad de sus respectivos proveedores. Está prohibida la reproducción,
        distribución o uso comercial sin autorización expresa.
      </p>

      <h6 class="text-subtitle1 text-bold q-mt-md">9. Privacidad y protección de datos</h6>
      <p>
        <strong style="color: white">CoreApi</strong> recopila información personal (nombre, correo
        electrónico, datos de pago) únicamente para fines de registro, facturación y mejora del
        servicio. La información personal no será compartida con terceros sin consentimiento,
        excepto cuando sea requerido por ley. Los proveedores de APIs son responsables de la
        privacidad de los datos procesados por sus servicios. Para más detalles, consulte nuestra
        Política de Privacidad.
      </p>

      <h6 class="text-subtitle1 text-bold q-mt-md">10. Métricas y transparencia</h6>
      <ul>
        <li>
          Todos los usuarios tendrán acceso a métricas en tiempo real sobre el uso de las APIs:
          número de llamadas, latencia, errores y consumo.
        </li>
        <li>
          Los proveedores tendrán acceso a estadísticas detalladas de sus APIs para monitoreo y
          optimización.
        </li>
        <li>
          <strong style="color: white">CoreApi</strong> publica reportes trimestrales de
          disponibilidad y rendimiento de la plataforma.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">11. Limitación de responsabilidad</h6>
      <p>
        <strong style="color: white">CoreApi</strong> actúa como intermediario entre proveedores y
        consumidores de APIs. Si bien certificamos la calidad y seguridad inicial de las APIs, no
        nos hacemos responsables por:
      </p>
      <ul>
        <li>
          Fallas o interrupciones en las APIs causadas por los proveedores después de su
          certificación inicial.
        </li>
        <li>
          Pérdidas de datos o daños derivados del uso inadecuado de las APIs por parte de los
          consumidores.
        </li>
        <li>
          Cambios en las APIs realizados por los proveedores que afecten funcionalidades existentes.
        </li>
        <li>
          Daños indirectos, lucro cesante o pérdidas comerciales derivadas del uso de la plataforma.
        </li>
      </ul>
      <p>
        Nuestra responsabilidad se limita al monto pagado por el servicio en los últimos 12 meses.
      </p>

      <h6 class="text-subtitle1 text-bold q-mt-md">12. Suspensión y terminación</h6>
      <ul>
        <li>
          <strong style="color: white">CoreApi</strong> se reserva el derecho de suspender o
          terminar cuentas que violen estos términos sin reembolso.
        </li>
        <li>
          Los usuarios pueden cerrar sus cuentas en cualquier momento desde la configuración de su
          perfil.
        </li>
        <li>
          En caso de cierre de cuenta, los datos serán retenidos por 90 días antes de su eliminación
          definitiva, según lo requiera la ley.
        </li>
      </ul>

      <h6 class="text-subtitle1 text-bold q-mt-md">13. Modificaciones a los términos</h6>
      <p>
        <strong style="color: white">CoreApi</strong> se reserva el derecho de modificar estos
        términos en cualquier momento. Los usuarios serán notificados por correo electrónico con al
        menos 15 días de anticipación sobre cambios significativos. Las modificaciones entrarán en
        vigencia en la fecha indicada. El uso continuado de la plataforma implica aceptación de los
        nuevos términos.
      </p>

      <h6 class="text-subtitle1 text-bold q-mt-md">14. Resolución de disputas</h6>
      <p>
        En caso de disputas entre usuarios y proveedores,
        <strong style="color: white">CoreApi</strong>
        facilitará la mediación pero no se hace responsable de la resolución final. Las partes
        acuerdan intentar resolver disputas mediante negociación de buena fe antes de recurrir a
        instancias legales.
      </p>

      <h6 class="text-subtitle1 text-bold q-mt-md">15. Legislación aplicable</h6>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa
        relacionada será resuelta ante los tribunales competentes de Medellín, Antioquia.
      </p>

      <h6 class="text-subtitle1 text-bold q-mt-md">16. Contacto y soporte</h6>
      <p>
        Para dudas, reclamos, reportes de seguridad o solicitudes de certificación, contáctenos:
      </p>
      <ul>
        <li><strong style="color: white">Soporte general:</strong> support@coreapi.com</li>
        <li><strong style="color: white">Seguridad:</strong> security@coreapi.com</li>
        <li>
          <strong style="color: white">Certificación de APIs:</strong> certification@coreapi.com
        </li>
        <li><strong style="color: white">Equipo:</strong></li>
        <ul style="margin-top: 8px">
          <li>lalfonso.castano@udea.edu.co</li>
          <li>jose.henao1@udea.edu.co</li>
          <li>andres.lema1@udea.edu.co</li>
        </ul>
      </ul>

      <div
        class="q-mt-lg q-pa-md"
        style="background-color: #1a1a1a; border-radius: 8px; text-align: center"
      >
        <p style="color: #009688; font-size: 12px; margin: 0">
          Última actualización: Diciembre 2025 | Versión 2.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.texto-justificado {
  text-align: justify;
  line-height: 1.8;
  color: #f1f1f1;
}

.texto-justificado ul {
  padding-left: 20px;
  margin-bottom: 1rem;
}

.texto-justificado li {
  margin-bottom: 8px;
}

.texto-justificado strong {
  color: #00e5cc;
}
</style>
