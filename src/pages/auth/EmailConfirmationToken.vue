<template>
  <q-page class="bg-bgpage confirmation-page">
    <div class="confirmation-container">
      <!-- Estado: Confirmando -->
      <div v-if="isConfirming" class="state-container">
        <div class="logo-header">
          <q-img src="~assets/core api.png" alt="Logo" style="width: 150px" class="q-mb-sm" />
        </div>

        <div class="confirmation-content">
          <div class="spinner">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="#00a8a8" stroke-width="2" opacity="0.2" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="url(#gradient)"
                stroke-width="2"
                stroke-linecap="round"
                style="stroke-dasharray: 175; animation: spin 1.5s linear infinite"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color: #00a8a8; stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: #008080; stop-opacity: 1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 class="title">Confirmando tu correo...</h1>
          <p class="subtitle">Por favor espera mientras verificamos tu identidad</p>

          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>

      <!-- Estado: Éxito -->
      <div v-else-if="confirmationState === 'success'" class="state-container">
        <div class="logo-header">
          <q-img src="~assets/core api.png" alt="Logo" style="width: 150px" class="q-mb-sm" />
        </div>

        <div class="confirmation-content">
          <div class="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#00a8a8" stroke-width="2" />
              <path
                d="M32 42L38 48L56 28"
                stroke="#00a8a8"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
                style="animation: checkmark 0.6s ease-out 0.3s both"
              />
            </svg>
          </div>

          <h1 class="title">¡Correo confirmado!</h1>
          <p class="subtitle">Tu cuenta ha sido verificada exitosamente. Bienvenido a CoreAPI.</p>

          <div class="success-message">
            <p>Ya puedes comenzar a usar todos nuestros microservicios listos para producción.</p>
          </div>

          <q-btn
            @click="router.push('/')"
            label="Ir al Dashboard"
            class="action-btn primary-btn"
            no-caps
            flat
          />
        </div>
      </div>

      <!-- Estado: Error -->
      <div v-else-if="confirmationState === 'error'" class="state-container">
        <div class="logo-header">
          <q-img src="~assets/core api.png" alt="Logo" style="width: 150px" class="q-mb-sm" />
        </div>

        <div class="confirmation-content">
          <div class="error-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#ff6b6b" stroke-width="2" />
              <path
                d="M32 32L48 48M48 32L32 48"
                stroke="#ff6b6b"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <h1 class="title error-title">Algo salió mal</h1>
          <p class="subtitle">{{ errorMessage }}</p>

          <div class="error-message">
            <p v-if="errorType === 'expired'">
              El enlace de confirmación ha expirado. Solicita un nuevo correo de confirmación.
            </p>
            <p v-else-if="errorType === 'invalid'">
              El enlace de confirmación no es válido. Verifica que hayas copiado correctamente.
            </p>
            <p v-else>
              Ocurrió un error al confirmar tu correo. Por favor, intenta de nuevo o contacta a
              soporte.
            </p>
          </div>

          <div class="error-actions">
            <q-btn
              @click="router.push('/auth/register')"
              label="Solicitar nuevo correo"
              class="action-btn primary-btn"
              no-caps
              flat
            />
            <q-btn
              @click="router.push('/auth/login')"
              label="Volver a inicio de sesión"
              class="action-btn secondary-btn"
              no-caps
              flat
            />
          </div>

          <div class="support-link">
            <p>
              ¿Necesitas ayuda? <a href="mailto:support@coreapi.com">Contacta a nuestro equipo</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'

const isConfirming = ref(false)
const confirmationState = ref(null)
const errorMessage = ref('')
const errorType = ref(null)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const confirmEmail = async () => {
  isConfirming.value = true
  const emailConfirmationToken = route.params.emailConfirmationToken

  if (!emailConfirmationToken) {
    errorMessage.value = 'Token no encontrado en la ruta.'
    errorType.value = 'invalid'
    confirmationState.value = 'error'
    isConfirming.value = false
    return
  }

  try {
    await Promise.all([
      authStore.confirmarUsuario(emailConfirmationToken),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ])

    confirmationState.value = 'success'

    if (authStore.loggedIn) {
      router.push('/main')
    }
  } catch (error) {
    console.error('Error al confirmar el correo:', error)

    if (error.response?.status === 410) {
      errorType.value = 'expired'
    } else if (error.response?.status === 400) {
      errorType.value = 'invalid'
    } else {
      errorType.value = 'general'
    }

    errorMessage.value = error.message || 'Error al confirmar el correo'
    confirmationState.value = 'error'
  } finally {
    isConfirming.value = false
  }
}

onMounted(() => {
  confirmEmail()
})
</script>

<style lang="scss" scoped>
.confirmation-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  padding: 20px;
}

.confirmation-container {
  width: 100%;
  max-width: 600px;
}

.state-container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.logo-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #00a8a8;
  letter-spacing: 2px;
}

.confirmation-content {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 50px 40px;
  border: 1px solid #2a2a2a;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.spinner {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
    stroke-dashoffset: 175;
  }
  to {
    transform: rotate(360deg);
    stroke-dashoffset: -175;
  }
}

.success-icon,
.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkmark {
  0% {
    stroke-dasharray: 30;
    stroke-dashoffset: 30;
  }
  100% {
    stroke-dasharray: 30;
    stroke-dashoffset: 0;
  }
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 15px;

  &.error-title {
    color: #ff6b6b;
  }
}

.subtitle {
  color: #b0b0b0;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 25px;
}

.progress-bar {
  height: 3px;
  background: #2a2a2a;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 30px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a8a8 0%, #008080 100%);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 100%;
  }
  100% {
    width: 100%;
  }
}

.success-message,
.error-message {
  background: #252525;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  border-left: 4px solid #00a8a8;

  p {
    color: #b0b0b0;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
}

.error-message {
  border-left-color: #ff6b6b;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  flex-direction: column;

  @media (min-width: 480px) {
    flex-direction: row;
  }
}

.action-btn {
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  flex: 1;
}

.primary-btn {
  background: linear-gradient(135deg, #00a8a8 0%, #008080 100%);
  color: white;
  box-shadow: 0 10px 25px rgba(0, 168, 168, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(0, 168, 168, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.secondary-btn {
  background: #252525;
  color: #00a8a8;
  border: 1px solid #00a8a8;

  &:hover {
    background: rgba(0, 168, 168, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
}

.support-link {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #2a2a2a;

  p {
    color: #808080;
    font-size: 13px;
    margin: 0;

    a {
      color: #00a8a8;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
