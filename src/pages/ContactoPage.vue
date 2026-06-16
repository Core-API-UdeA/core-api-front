<template>
  <q-page class="contacto-page">

    <!-- Fondo decorativo -->
    <div class="bg-decoration">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <div class="contacto-container">

      <!-- ─── Hero ─────────────────────────────────────────────────────── -->
      <div class="hero-section text-center q-mb-xl">
        <div class="hero-badge">
          <q-icon name="forum" size="xs" class="q-mr-xs" />
          ESTAMOS AQUÍ PARA AYUDARTE
        </div>
        <h1 class="hero-title">Contáctanos</h1>
        <p class="hero-subtitle">
          ¿Dudas, sugerencias o problemas con la plataforma?
          Cuéntanos y te responderemos pronto.
        </p>
      </div>

      <!-- ─── Grid: form + sidebar ─────────────────────────────────────── -->
      <div class="contacto-grid">

        <!-- Form card -->
        <div class="form-card">

          <div class="form-card-header">
            <q-icon name="mail_outline" color="primary" size="md" />
            <div>
              <div class="form-card-title">Envíanos un mensaje</div>
              <div class="form-card-subtitle">Te respondemos en menos de 24h</div>
            </div>
          </div>

          <q-form @submit.prevent="enviarFormulario" ref="formRef" class="form-body">

            <!-- Nombre -->
            <div class="field-group">
              <label class="field-label">
                <q-icon name="person" size="xs" />
                Nombre completo
              </label>
              <q-input
                v-model="form.nombre"
                outlined dark
                color="primary"
                placeholder="Tu nombre"
                :disable="enviando || cooldownActivo"
                :rules="[
                  v => !!v || 'El nombre es requerido',
                  v => v.length >= 2 || 'Mínimo 2 caracteres',
                ]"
                maxlength="100"
                lazy-rules
                class="custom-input"
              />
            </div>

            <!-- Email -->
            <div class="field-group">
              <label class="field-label">
                <q-icon name="email" size="xs" />
                Correo electrónico
              </label>
              <q-input
                v-model="form.correo"
                outlined dark
                color="primary"
                type="email"
                placeholder="tu@correo.com"
                :disable="enviando || cooldownActivo"
                :rules="[
                  v => !!v || 'El correo es requerido',
                  v => /.+@.+\..+/.test(v) || 'Correo inválido',
                ]"
                maxlength="150"
                lazy-rules
                class="custom-input"
              />
            </div>

            <!-- Mensaje -->
            <div class="field-group">
              <label class="field-label">
                <q-icon name="chat_bubble_outline" size="xs" />
                Mensaje
                <span class="char-count">{{ form.mensaje.length }} / 2000</span>
              </label>
              <q-input
                v-model="form.mensaje"
                outlined dark
                color="primary"
                type="textarea"
                placeholder="Cuéntanos en qué podemos ayudarte..."
                :disable="enviando || cooldownActivo"
                :rules="[
                  v => !!v || 'El mensaje es requerido',
                  v => v.length >= 10 || 'Mínimo 10 caracteres',
                ]"
                maxlength="2000"
                rows="5"
                lazy-rules
                class="custom-input"
              />
            </div>

            <!-- HONEYPOT -->
            <div class="honeypot-field" aria-hidden="true">
              <label for="website">Website (no llenar)</label>
              <input
                type="text" id="website" name="website"
                v-model="form.website" tabindex="-1" autocomplete="off"
              />
            </div>

            <!-- Cooldown -->
            <div v-if="cooldownActivo" class="banner banner-warning">
              <q-icon name="schedule" size="sm" />
              <div>
                <div class="banner-title">Por favor espera un momento</div>
                <div class="banner-text">
                  Puedes enviar otro mensaje en <strong>{{ cooldownSegundos }}s</strong>
                </div>
              </div>
            </div>

            <!-- Éxito -->
            <transition name="fade-slide">
              <div v-if="exitoVisible" class="banner banner-success">
                <q-icon name="check_circle" size="sm" />
                <div>
                  <div class="banner-title">¡Mensaje enviado!</div>
                  <div class="banner-text">Te responderemos pronto.</div>
                </div>
              </div>
            </transition>

            <!-- Submit -->
            <q-btn
              type="submit"
              unelevated rounded no-caps
              :loading="enviando"
              :disable="enviando || cooldownActivo"
              class="submit-btn full-width"
              size="lg"
            >
              <template v-slot:default>
                <q-icon name="send" size="xs" class="q-mr-sm" />
                {{ enviando ? 'Enviando...' : 'Enviar mensaje' }}
              </template>
              <template v-slot:loading>
                <q-spinner-dots color="white" />
                <span class="q-ml-sm">Enviando...</span>
              </template>
            </q-btn>

            <div class="privacy-note">
              <q-icon name="lock" size="xs" class="q-mr-xs" />
              Tus datos solo se usan para responderte. No compartimos información.
            </div>

          </q-form>
        </div>

        <!-- Info sidebar -->
        <div class="info-card">

          <div class="info-section">
            <div class="info-icon-wrap">
              <q-icon name="alternate_email" color="primary" size="sm" />
            </div>
            <div class="info-title">Correo directo</div>
            <div class="info-text">
              <a href="mailto:lalfonso.castano@udea.edu.co" class="info-link">
                lalfonso.castano@udea.edu.co
              </a>
              <a href="mailto:jose.henao1@udea.edu.co" class="info-link">
                jose.henao1@udea.edu.co
              </a>
              <a href="mailto:andres.lema1@udea.edu.co" class="info-link">
                andres.lema1@udea.edu.co
              </a>
            </div>
          </div>

          <div class="info-divider"></div>

          <div class="info-section">
            <div class="info-icon-wrap">
              <q-icon name="schedule" color="primary" size="sm" />
            </div>
            <div class="info-title">Tiempo de respuesta</div>
            <div class="info-text-simple">
              Solemos responder en menos de <strong>24 horas</strong> en días hábiles.
            </div>
          </div>

          <div class="info-divider"></div>

          <div class="info-section">
            <div class="info-icon-wrap">
              <q-icon name="school" color="primary" size="sm" />
            </div>
            <div class="info-title">Equipo</div>
            <div class="info-text-simple">
              Universidad de Antioquia<br>
              Facultad de Ingeniería<br>
              Ingeniería de Sistemas
            </div>
          </div>

        </div>
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

const form = reactive({
  nombre: '', correo: '', mensaje: '', website: '',
})

const enviando         = ref(false)
const exitoVisible     = ref(false)
const formCargadoEn    = ref(0)
const cooldownActivo   = ref(false)
const cooldownSegundos = ref(0)
let   cooldownTimer    = null

const COOLDOWN_DURACION = 60

onMounted(() => {
  formCargadoEn.value = Date.now()
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

async function enviarFormulario() {
  const valido = await formRef.value.validate()
  if (!valido) return

  enviando.value     = true
  exitoVisible.value = false

  try {
    const elapsedMs = Date.now() - formCargadoEn.value
    const response = await axiosInstance.post('/util/contacto', {
      name:    form.nombre,
      email:   form.correo,
      message: form.mensaje,
      website: form.website,
      elapsedMs,
    })

    const ejec = response.data?.ejecucion
    if (ejec?.respuesta?.estado === 'OK') {
      exitoVisible.value = true
      form.nombre = ''; form.correo = ''; form.mensaje = ''; form.website = ''

      localStorage.setItem('contact_last_sent', String(Date.now()))
      iniciarCooldown(COOLDOWN_DURACION)
      formRef.value?.resetValidation()

      $q.notify({
        type: 'positive', icon: 'check_circle',
        message: '¡Mensaje enviado!', caption: 'Te responderemos pronto.',
        timeout: 4000, position: 'top',
      })

      setTimeout(() => { exitoVisible.value = false }, 10000)
    } else {
      throw new Error(ejec?.respuesta?.mensaje || 'Error al enviar')
    }

  } catch (error) {
    const mensaje = error.response?.data?.ejecucion?.respuesta?.mensaje
                 || error.message
                 || 'No pudimos enviar tu mensaje.'

    $q.notify({
      type: 'negative', icon: 'error',
      message: 'Error al enviar', caption: mensaje,
      timeout: 5000, position: 'top',
    })

    if (error.response?.status === 429 || mensaje.includes('límite')) {
      iniciarCooldown(300)
    }
  } finally {
    enviando.value = false
  }
}
</script>

<style lang="scss" scoped>
.contacto-page {
  min-height: 100vh;
  background: #0a0f1c;
  position: relative;
  overflow-x: hidden;
  padding: 60px 24px;
}

/* ── Fondo: orbes difuminados ── */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
}

.orb-1 {
  width: 500px; height: 500px;
  background: #00a8a8;
  top: -200px; right: -100px;
}

.orb-2 {
  width: 400px; height: 400px;
  background: #02c39a;
  bottom: -150px; left: -100px;
}

.contacto-container {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Hero ── */
.hero-section { margin-bottom: 48px; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 168, 168, 0.12);
  border: 1px solid rgba(0, 168, 168, 0.3);
  color: #00a8a8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.hero-title {
  color: #ffffff;
  font-size: 48px;
  font-weight: 700;
  font-family: 'Trebuchet MS', sans-serif;
  margin: 0 0 12px;
  letter-spacing: -1px;
  line-height: 1.1;
}

.hero-subtitle {
  color: #94a3b8;
  font-size: 17px;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Grid ── */
.contacto-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .contacto-grid { grid-template-columns: 1fr; }
  .hero-title    { font-size: 36px; }
}

/* ── Form card ── */
.form-card {
  background: linear-gradient(145deg, #14192a 0%, #0d1220 100%);
  border: 1px solid rgba(0, 168, 168, 0.15);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.form-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.form-card-title {
  color: #ffffff;
  font-size: 19px;
  font-weight: 700;
  font-family: 'Trebuchet MS', sans-serif;
}

.form-card-subtitle {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 2px;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Fields ── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.char-count {
  margin-left: auto;
  color: #64748b;
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

/* ── Inputs personalizados (override Quasar) ── */
:deep(.custom-input) {
  .q-field__control {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    min-height: 48px;
    transition: all 0.2s ease;
  }

  .q-field__control:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .q-field__control:before {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .q-field__control:hover:before {
    border-color: rgba(0, 168, 168, 0.4) !important;
  }

  .q-field__control:after {
    border-color: #00a8a8;
    border-width: 2px;
  }

  .q-field__native,
  .q-field__input {
    color: #ffffff !important;
    font-size: 15px;
    padding: 12px 4px;
  }

  .q-field__native::placeholder,
  .q-field__input::placeholder {
    color: #64748b !important;
    opacity: 1;
  }

  &.q-field--error .q-field__control:before {
    border-color: #ef4444 !important;
  }
}

/* ── Submit ── */
.submit-btn {
  background: linear-gradient(135deg, #00a8a8 0%, #02c39a 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 14px;
  margin-top: 8px;
  box-shadow: 0 8px 24px rgba(0, 168, 168, 0.3);
  transition: all 0.2s ease;
}

.submit-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(0, 168, 168, 0.4);
}

.submit-btn.disabled { opacity: 0.5; }

.privacy-note {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 11px;
  margin-top: 4px;
}

/* ── Honeypot ── */
.honeypot-field {
  position: absolute;
  left: -9999px; top: -9999px;
  opacity: 0;
  pointer-events: none;
  height: 0; width: 0;
  overflow: hidden;
}

/* ── Banners ── */
.banner {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 10px;
  padding: 12px 16px;
}

.banner-title {
  font-size: 13px;
  font-weight: 700;
}

.banner-text {
  font-size: 12px;
  margin-top: 2px;
}

.banner-warning {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
}

.banner-warning .banner-text { color: #fbbf24; }

.banner-success {
  background: rgba(2, 195, 154, 0.1);
  border: 1px solid rgba(2, 195, 154, 0.3);
  color: #02c39a;
}

.banner-success .banner-text { color: #6ee7b7; }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Info sidebar ── */
.info-card {
  background: linear-gradient(145deg, #14192a 0%, #0d1220 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 32px;
  height: fit-content;
}

.info-icon-wrap {
  width: 40px; height: 40px;
  background: rgba(0, 168, 168, 0.1);
  border: 1px solid rgba(0, 168, 168, 0.25);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.info-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 6px;
  font-family: 'Trebuchet MS', sans-serif;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-link {
  color: #cbd5e1;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s ease;
  word-break: break-all;
}

.info-link:hover { color: #00a8a8; }

.info-text-simple {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.7;
}

.info-text-simple strong {
  color: #ffffff;
  font-weight: 600;
}

.info-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 20px 0;
}
</style>
