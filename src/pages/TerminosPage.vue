<template>
  <q-page class="q-pa-xl" style="background-color: black; color: white">
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
          Bienvenido a <strong style="color: white">CoreApi</strong>. Al acceder y/o utilizar
          nuestros servicios, usted acepta cumplir con nuestras políticas de términos y condiciones.
        </p>

        <h6 class="text-subtitle1 text-bold q-mt-md">1. Definiciones</h6>
        <ul>
          <li>
            <strong>Usuario:</strong> Persona que accede a la aplicación para consultar información
            o realizar compras.
          </li>
          <li>
            <strong>Cuenta:</strong> Perfil creado por el usuario al registrarse para comprar
            aplicaciones.
          </li>
          <li>
            <strong>Contenido:</strong> Información y recursos de las aplicaciones disponibles en
            <strong style="color: white">CoreApi</strong>.
          </li>
        </ul>

        <h6 class="text-subtitle1 text-bold q-mt-md">2. Uso de la aplicación</h6>
        <ul>
          <li>
            El usuario se compromete a usar <strong style="color: white">CoreApi</strong> solo para
            fines legales y autorizados.
          </li>
          <li>
            Está prohibido cualquier uso que pueda dañar, interrumpir o afectar la seguridad de la
            aplicación.
          </li>
          <li>
            Los usuarios pueden consultar información básica de las aplicaciones sin registrarse.
          </li>
        </ul>

        <h6 class="text-subtitle1 text-bold q-mt-md">3. Registro y cuentas de usuario</h6>
        <ul>
          <li>
            Para comprar aplicaciones, los usuarios deben registrarse proporcionando nombre completo
            y correo electrónico.
          </li>
          <li>
            Cada usuario es responsable de mantener la confidencialidad de su cuenta y contraseña.
          </li>
          <li>
            <strong style="color: white">CoreApi</strong> no se hace responsable por accesos no
            autorizados ocasionados por negligencia del usuario.
          </li>
        </ul>

        <h6 class="text-subtitle1 text-bold q-mt-md">4. Propiedad intelectual</h6>
        <p>
          Todo el contenido de <strong style="color: white">CoreApi</strong>, incluyendo textos,
          imágenes, logotipos, diseños y código, es propiedad de CoreApi o de sus socios. Está
          prohibida la reproducción, distribución o uso comercial sin autorización.
        </p>

        <h6 class="text-subtitle1 text-bold q-mt-md">5. Privacidad y protección de datos</h6>
        <p>
          <strong style="color: white">CoreApi</strong> recopila nombre y correo electrónico de los
          usuarios únicamente para fines de registro y compra de aplicaciones. La información
          personal no será compartida con terceros sin consentimiento. Para más detalles, consulte
          nuestra Política de Privacidad.
        </p>

        <h6 class="text-subtitle1 text-bold q-mt-md">6. Limitación de responsabilidad</h6>
        <p>
          <strong style="color: white">CoreApi</strong> no se hace responsable por daños directos o
          indirectos derivados del uso de la aplicación o de la imposibilidad de acceder a los
          servicios. El usuario es responsable de verificar la información antes de realizar
          compras.
        </p>

        <h6 class="text-subtitle1 text-bold q-mt-md">7. Modificaciones a los términos</h6>
        <p>
          <strong style="color: white">CoreApi</strong> se reserva el derecho de modificar estos
          términos en cualquier momento. Las modificaciones entrarán en vigencia al ser publicadas
          en la aplicación. El uso continuado de la plataforma implica aceptación de los nuevos
          términos.
        </p>

        <h6 class="text-subtitle1 text-bold q-mt-md">8. Legislación aplicable</h6>
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa
          relacionada será resuelta ante los tribunales competentes.
        </p>

        <h6 class="text-subtitle1 text-bold q-mt-md">9. Contacto</h6>
        <p>Para dudas o reclamos, contáctenos a los siguientes correos electrónicos:</p>
        <ul>
          <li><strong style="color: white">lalfonso.castano@udea.edu.co</strong></li>
          <li><strong style="color: white">jose.henao1@udea.edu.co</strong></li>
          <li><strong style="color: white">andres.lema1@udea.edu.co</strong></li>
        </ul>
      </div>
    </div>
  </q-page>
</template>

<script setup></script>

<style scoped>
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
  margin-bottom: 6px;
}
</style>
