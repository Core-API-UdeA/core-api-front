<template>
  <q-page class="payment-page">
    <div class="payment-container">
      <!-- Loading State -->
      <div v-if="loading" class="payment-card loading-state">
        <q-spinner-dots color="primary" size="60px" />
        <p class="loading-text">Verificando tu pago...</p>
        <p class="loading-subtext">Por favor espera un momento</p>
      </div>

      <!-- Success State -->
      <div v-else-if="paymentVerified && !error" class="payment-card success-state">
        <div class="success-icon-container">
          <q-icon name="check_circle" color="positive" size="80px" class="success-icon" />
        </div>

        <h2 class="payment-title">¡Pago Exitoso!</h2>
        <p class="payment-subtitle">Tu suscripción ha sido activada correctamente</p>

        <!-- Payment Details -->
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">{{ paymentInfo.plan_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">API:</span>
            <span class="detail-value">{{ paymentInfo.api_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Monto:</span>
            <span class="detail-value">${{ formatPrice(paymentInfo.amount) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">ID de Transacción:</span>
            <span class="detail-value transaction-id">{{ transactionId }}</span>
          </div>
        </div>

        <!-- API Key Section -->
        <div v-if="apiKey" class="api-key-section">
          <div class="api-key-header">
            <q-icon name="vpn_key" color="primary" size="24px" />
            <span class="api-key-title">Tu API Key</span>
          </div>

          <div class="api-key-container">
            <code class="api-key-value">{{ apiKey }}</code>
            <q-btn
              flat
              dense
              round
              icon="content_copy"
              color="primary"
              size="sm"
              @click="copyApiKey"
            >
              <q-tooltip class="bg-primary">Copiar</q-tooltip>
            </q-btn>
          </div>

          <p class="api-key-warning">
            <q-icon name="warning" color="warning" size="16px" />
            Guarda esta clave de forma segura. La necesitarás para usar la API.
          </p>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3 class="steps-title">Próximos pasos</h3>
          <div class="step-item">
            <q-icon name="mail" color="primary" size="20px" />
            <span>Revisa tu correo electrónico para más detalles</span>
          </div>
          <div class="step-item">
            <q-icon name="description" color="primary" size="20px" />
            <span>Consulta la documentación de la API</span>
          </div>
          <div class="step-item">
            <q-icon name="code" color="primary" size="20px" />
            <span>Comienza a integrar la API en tu aplicación</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            label="Ver mis suscripciones"
            color="primary"
            unelevated
            no-caps
            class="action-btn"
            @click="goToSubscriptions"
          />
          <q-btn
            label="Ir a la API"
            color="dark"
            flat
            no-caps
            class="action-btn"
            @click="goToApi"
          />
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="payment-card error-state">
        <div class="error-icon-container">
          <q-icon name="error" color="negative" size="80px" class="error-icon" />
        </div>

        <h2 class="payment-title">Error al Procesar el Pago</h2>
        <p class="payment-subtitle">{{ errorMessage }}</p>

        <!-- Error Details -->
        <div v-if="paymentStatus" class="error-details">
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">{{ paymentStatus }}</span>
          </div>
          <div v-if="transactionId" class="detail-row">
            <span class="detail-label">ID de Transacción:</span>
            <span class="detail-value transaction-id">{{ transactionId }}</span>
          </div>
        </div>

        <div class="error-help">
          <p class="help-text">
            Si crees que esto es un error, por favor contacta a soporte con el ID de transacción.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            label="Intentar nuevamente"
            color="primary"
            unelevated
            no-caps
            class="action-btn"
            @click="retryPayment"
          />
          <q-btn
            label="Volver al catálogo"
            color="dark"
            flat
            no-caps
            class="action-btn"
            @click="goToCatalog"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePagosStore } from 'stores/pagos-store.js'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const pagosStore = usePagosStore()

const loading = ref(true)
const paymentVerified = ref(false)
const error = ref(false)
const errorMessage = ref('')
const transactionId = ref('')
const paymentStatus = ref('')
const apiKey = ref('')
const paymentInfo = ref({
  plan_name: '',
  api_name: '',
  amount: 0,
})

onMounted(async () => {
  try {
    // Obtener parámetros de la URL
    const params = {
      transaction_id: route.query.transaction_id,
      collection_id: route.query.collection_id,
      collection_status: route.query.collection_status,
      payment_id: route.query.payment_id,
      status: route.query.status,
      external_reference: route.query.external_reference,
      payment_type: route.query.payment_type,
      merchant_order_id: route.query.merchant_order_id,
      preference_id: route.query.preference_id,
    }

    transactionId.value = params.transaction_id || params.external_reference
    paymentStatus.value = params.status || params.collection_status

    if (!transactionId.value) {
      throw new Error('No se encontró el ID de transacción')
    }

    // Verificar el estado del pago con el backend
    const result = await pagosStore.verificarPago(transactionId.value, {
      payment_id: params.payment_id,
      collection_id: params.collection_id,
      status: params.status,
      merchant_order_id: params.merchant_order_id,
    })

    if (result.success) {
      paymentVerified.value = true
      apiKey.value = result.api_key
      paymentInfo.value = {
        plan_name: result.plan_name,
        api_name: result.api_name,
        amount: result.amount,
      }
    } else {
      error.value = true
      errorMessage.value = result.message
    }
  } catch (err) {
    console.error('Error al verificar pago:', err)
    error.value = true
    errorMessage.value = err.message || 'No se pudo verificar el estado del pago'

    $q.notify({
      type: 'negative',
      message: errorMessage.value,
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
})

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

function copyApiKey() {
  navigator.clipboard.writeText(apiKey.value)
  $q.notify({
    type: 'positive',
    message: 'API Key copiada al portapapeles',
    icon: 'content_copy',
    timeout: 2000,
  })
}

function goToSubscriptions() {
  router.push('/main/mis-suscripciones')
}

function goToApi() {
  router.push('/main/catalogo')
}

function retryPayment() {
  router.push('/main/catalogo')
}

function goToCatalog() {
  router.push('/main/catalogo')
}
</script>

<style lang="scss" scoped>
.payment-page {
  min-height: 100vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.payment-container {
  width: 100%;
  max-width: 600px;
  animation: fadeInUp 0.5s ease-out;
}

.payment-card {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.loading-subtext {
  color: #b0b0b0;
  font-size: 14px;
  margin: 0;
}

// Success State
.success-state {
  border-color: #4caf50;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4caf50, #66bb6a);
    border-radius: 16px 16px 0 0;
  }
}

.success-icon-container {
  animation: scaleIn 0.5s ease-out;
}

.success-icon {
  filter: drop-shadow(0 4px 12px rgba(76, 175, 80, 0.4));
}

// Error State
.error-state {
  border-color: #f44336;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f44336, #ef5350);
    border-radius: 16px 16px 0 0;
  }
}

.error-icon-container {
  animation: shake 0.5s ease-out;
}

.payment-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  margin: 24px 0 12px;
}

.payment-subtitle {
  color: #b0b0b0;
  font-size: 16px;
  margin: 0 0 32px;
  line-height: 1.5;
}

// Payment Details
.payment-details,
.error-details {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #2a2a2a;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  color: #b0b0b0;
  font-size: 14px;
  font-weight: 500;
}

.detail-value {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;

  &.transaction-id {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    color: #00a8a8;
  }
}

// API Key Section
.api-key-section {
  background: rgba(0, 168, 168, 0.05);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.api-key-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.api-key-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.api-key-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.api-key-value {
  flex: 1;
  color: #00a8a8;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  word-break: break-all;
  text-align: left;
}

.api-key-warning {
  color: #ffa726;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
}

// Next Steps
.next-steps {
  text-align: left;
  margin-bottom: 32px;
}

.steps-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b0b0b0;
  font-size: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #2a2a2a;

  &:last-child {
    border-bottom: none;
  }
}

// Error Help
.error-help {
  background: rgba(244, 67, 54, 0.05);
  border: 1px solid rgba(244, 67, 54, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 32px;
}

.help-text {
  color: #b0b0b0;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

// Action Buttons
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  font-size: 15px;
  font-weight: 600;
  padding: 12px 32px;
  border-radius: 8px;
}

// Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

// Responsive
@media (max-width: 768px) {
  .payment-card {
    padding: 32px 24px;
  }

  .payment-title {
    font-size: 24px;
  }

  .payment-subtitle {
    font-size: 14px;
  }

  .api-key-value {
    font-size: 11px;
  }
}
</style>
