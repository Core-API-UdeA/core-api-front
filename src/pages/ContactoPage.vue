<template>
  <q-page class="q-pa-xl bg-black text-white">
    <div class="q-mx-auto q-pa-sm" style="max-width: 800px">

      <!-- Recuadro principal -->
      <div class="contacto-card q-pa-lg q-mt-md texto-justificado">

        <!-- Título -->
        <h4 class="text-h5 text-bold q-mb-md" style="text-align: center; color: #009688">
          Contáctanos
        </h4>

        <!-- Logo CoreApi -->
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
        <div class="form-box bg-white text-dark q-pa-lg">
          <q-form class="q-gutter-md" @submit.prevent="enviarFormulario" ref="formRef">

            <!-- Nombre -->
            <q-input
              filled
              v-model="form.nombre"
              label="Nombre completo *"
              :rules="[
                v => !!v || 'El nombre es requerido',
                v => v.length >= 2 || 'Mínimo 2 caracteres',
                v => v.length <= 100 || 'Máximo 100 caracteres',
              ]"
              :disable="enviando || cooldownActivo"
              maxlength="100"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <!-- Email -->
            <q-input
              filled
              v-model="form.correo"
              label="Correo electrónico *"
              type="email"
              :rules="[
                v => !!v || 'El correo es requerido',
                v => /.+@.+\..+/.test(v) || 'Correo inválido',
              ]"
              :disable="enviando || cooldownActivo"
              maxlength="150"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- Mensaje -->
            <q-input
              filled
              v-model="form.mensaje"
              label="Mensaje *"
              type="textarea"
              :rules="[
                v => !!v || 'El mensaje es requerido',
                v => v.length >= 10 || 'Mínimo 10 caracteres',
                v => v.length <= 2000 || 'Máximo 2000 caracteres',
              ]"
              :disable="enviando || cooldownActivo"
              maxlength="2000"
              counter
              autogrow
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="chat" />
              </template>
            </q-input>

            <!-- ── HONEYPOT (invisible para usuarios, visible para bots) ──── -->
            <!-- No usamos display:none porque algunos bots lo detectan.
                 Usamos opacidad+posición+tab-index para que sea invisible
                 pero accesible al DOM. -->
            <div class="honeypot-field" aria-hidden="true">
              <label for="website">Website (no llenar)</label>
              <input
                type="text"
                id="website"
                name="website"
                v-model="form.website"
                tabindex="-1"
                autocomplete="off"
              />
            </div>

            <!-- Estado de cooldown -->
            <div v-if="cooldownActivo" class="cooldown-banner">
              <q-icon name="schedule" size="sm" />
              <span>
                Para evitar spam, espera <strong>{{ cooldownSegundos }}s</strong>
                antes de enviar otro mensaje.
              </span>
            </div>

            <!-- Mensaje de éxito persistente -->
            <q-banner
              v-if="exitoVisible"
              class="bg-positive text-white q-mt-md"
              rounded
              dense
            >
              <template v-slot:avatar>
                <q-icon name="check_circle" />
              </template>
              ¡Gracias! Tu mensaje fue enviado. Te responderemos pronto.
            </q-banner>

            <!-- Botón -->
            <div class="text-center q-mt-md">
              <q-btn
                :label="enviando ? 'Enviando...' : 'Enviar'"
                color="primary"
                unelevated
                type="submit"
                :loading="enviando"
                :disable="enviando || cooldownActivo"
                size="md"
                class="q-px-xl"
              >
                <template v-slot:loading>
                  <q-spinner-dots />
                </template>
              </q-btn>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { axiosInstance } from 'boot/axios.js'

const $q = useQuasar()
const formRef = ref(null)

// ─── State ────────────────────────────────────────────────────────────────
const form = reactive({
  nombre:  '',
  correo:  '',
  mensaje: '',
  website: '',   // honeypot — debe permanecer vacío
})

const enviando        = ref(false)
const exitoVisible    = ref(false)
const formCargadoEn   = ref(0)       // timestamp al montar
const cooldownActivo  = ref(false)
const cooldownSegundos = ref(0)
let   cooldownTimer   = null

const COOLDOWN_DURACION = 60 // segundos entre envíos en el mismo navegador

// ─── Lifecycle ────────────────────────────────────────────────────────────
onMounted(() => {
  formCargadoEn.value = Date.now()

  // Restaurar cooldown si existía
  const ultimoEnvio = localStorage.getItem('contact_last_sent')
  if (ultimoEnvio) {
    const transcurrido = (Date.now() - parseInt(ultimoEnvio)) / 1000
    if (transcurrido < COOLDOWN_DURACION) {
      iniciarCooldown(COOLDOWN_DURACION - Math.floor(transcurrido))
    }
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

// ─── Cooldown ─────────────────────────────────────────────────────────────
function iniciarCooldown(segundos) {
  cooldownActivo.value   = true
  cooldownSegundos.value = segundos
  cooldownTimer = setInterval(() => {
    cooldownSegundos.value--
    if (cooldownSegundos.value <= 0) {
      cooldownActivo.value = false
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

// ─── Submit ───────────────────────────────────────────────────────────────
async function enviarFormulario() {
  // Validar form Quasar
  const valido = await formRef.value.validate()
  if (!valido) return

  enviando.value     = true
  exitoVisible.value = false

  try {
    const elapsedMs = Date.now() - formCargadoEn.value

    const response = await axiosInstance.post('/util/contacto', {
      name:      form.nombre,
      email:     form.correo,
      message:   form.mensaje,
      website:   form.website,    // honeypot
      elapsedMs,                  // tiempo de llenado
    })

    const ejec = response.data?.ejecucion
    if (ejec?.respuesta?.estado === 'OK') {
      // Éxito (o spam detectado silenciosamente — el usuario ve éxito)
      exitoVisible.value = true

      // Limpiar form
      form.nombre  = ''
      form.correo  = ''
      form.mensaje = ''
      form.website = ''

      // Cooldown local
      localStorage.setItem('contact_last_sent', String(Date.now()))
      iniciarCooldown(COOLDOWN_DURACION)

      // Reset de validación visual
      formRef.value?.resetValidation()

      // Notify
      $q.notify({
        type:    'positive',
        icon:    'check_circle',
        message: '¡Mensaje enviado!',
        caption: 'Te responderemos pronto.',
        timeout: 4000,
      })

      // Auto-ocultar el banner después de 8s
      setTimeout(() => { exitoVisible.value = false }, 8000)

    } else {
      throw new Error(ejec?.respuesta?.mensaje || 'Error al enviar')
    }

  } catch (error) {
    const mensaje = error.response?.data?.ejecucion?.respuesta?.mensaje
                 || error.message
                 || 'No pudimos enviar tu mensaje. Por favor intenta más tarde.'

    $q.notify({
      type:    'negative',
      icon:    'error',
      message: 'Error al enviar',
      caption: mensaje,
      timeout: 5000,
    })

    // Si es rate limit, activar cooldown largo
    if (error.response?.status === 429 || mensaje.includes('límite')) {
      iniciarCooldown(300) // 5 minutos
    }

  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
/* ── Layout general ── */
.contacto-card {
  background-color: #2f2f2f;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.form-box {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.texto-justificado {
  text-align: justify;
  line-height: 1.8;
  color: #f1f1f1;
}

.texto-justificado ul li {
  margin-bottom: 6px;
}

/* ── Honeypot: invisible para humanos, accesible para bots ── */
.honeypot-field {
  position: absolute;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
  height: 0;
  width: 0;
  overflow: hidden;
}

/* ── Cooldown banner ── */
.cooldown-banner {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
</style>
