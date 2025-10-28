<template>
  <q-page class="q-pa-xl bg-black text-white">
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
        <!-- Título -->
        <h4 class="text-h5 text-bold q-mb-md" style="text-align: center; color: #009688">
          Contáctanos
        </h4>

        <!-- Logo coreApi -->
        <div class="row items-center justify-center q-mb-md">
          <img src="~assets/core api.png" alt="Logo" style="height: 30px; margin-right: 10px" />
          <span style="font-weight: bold; font-size: 18px; color: white">CoreApi</span>
        </div>

        <!-- Texto introductorio -->
        <p class="text-body1 q-mb-lg">
          Si tienes dudas, sugerencias o comentarios sobre nuestra aplicación, puedes comunicarte
          con nosotros a través del siguiente formulario. Estaremos encantados de responderte lo
          antes posible.
        </p>

        <!-- Formulario -->
        <div
          class="bg-white text-dark q-pa-lg"
          style="border-radius: 12px; box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1)"
        >
          <q-form class="q-gutter-md" @submit.prevent="enviarFormulario">
            <q-input filled v-model="nombre" label="Nombre completo" />
            <q-input filled v-model="correo" label="Correo electrónico" type="email" />
            <q-input filled v-model="mensaje" label="Mensaje" type="textarea" />
            <div class="text-center">
              <q-btn label="Enviar" color="primary" unelevated type="submit" />
            </div>
          </q-form>
        </div>

        <!-- Información adicional -->
        <p class="text-body1 q-mt-lg text-center">
          También puedes escribirnos directamente a nuestros correos:
        </p>
        <ul class="text-center" style="list-style: none; padding: 0">
          <li><strong>lalfonso.castano@udea.edu.co</strong></li>
          <li><strong>jose.henao1@udea.edu.co</strong></li>
          <li><strong>andres.lema1@udea.edu.co</strong></li>
        </ul>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const nombre = ref('')
const correo = ref('')
const mensaje = ref('')

const enviarFormulario = () => {
  alert(`Gracias ${nombre.value}, hemos recibido tu mensaje.`)
}
</script>

<style scoped>
.texto-justificado {
  text-align: justify;
  line-height: 1.8;
  color: #f1f1f1;
}

.texto-justificado ul li {
  margin-bottom: 6px;
}
</style>
