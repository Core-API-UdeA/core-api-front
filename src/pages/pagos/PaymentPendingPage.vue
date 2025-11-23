<template>
  <div class="payment-status-page">
    <div class="status-container">
      <!-- Loading inicial -->
      <div v-if="checking" class="loading-state">
        <q-spinner-dots color="primary" size="60px" />
        <p class="text-white q-mt-md">Verificando el estado de tu pago...</p>
      </div>

      <!-- Estado pendiente -->
      <div v-else class="pending-state">
        <div class="icon-container pending">
          <q-icon name="schedule" size="80px" color="warning" />
        </div>

        <h1 class="status-title">Pago en Proceso</h1>
        <p class="status-message">
          Tu pago está siendo verificado. Esto puede tardar algunos minutos.
        </p>

        <!-- Card con información del pago -->
        <q-card flat class="info-card q-mt-lg">
          <q-card-section>
            <div class="timeline">
              <div class="timeline-item completed">
                <div class="timeline-icon">
                  <q-icon name="check" color="positive" size="sm" />
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Pago iniciado</div>
                  <div class="timeline-time">{{ formatDate(paymentDetails?.created_at) }}</div>
                </div>
              </div>

              <div class="timeline-item active">
                <div class="timeline-icon">
                  <q-spinner color="warning" size="sm" />
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Verificando pago</div>
                  <div class="timeline-time">En proceso...</div>
                </div>
              </div>

              <div class="timeline-item">
                <div class="timeline-icon">
                  <q-icon name="done_all" color="grey-6" size="sm" />
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Pago completado</div>
                  <div class="timeline-time">Pendiente</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Información importante -->
        <q-card flat class="alert-card q-mt-md">
          <q-card-section>
            <div class="alert-header">
              <q-icon name="info" color="primary" size="sm" />
              <span class="alert-title">¿Qué está pasando?</span>
            </div>
            <ul class="alert-list">
              <li>Tu pago está siendo procesado por Mercado Pago</li>
              <li>Recibirás un email de confirmación cuando se complete</li>
              <li>Puedes cerrar esta página, te notificaremos por correo</li>
              <li>El proceso puede demorar entre 5 y 10 minutos</li>
            </ul>
          </q-card-section>
        </q-card>

        <!-- Detalles del pago -->
        <q-card v-if="paymentDetails" flat class="details-card q-mt-md">
          <q-card-section>
            <div class="section-title">Detalles del Pago</div>
            <div class="detail-row">
              <span class="detail-label">ID de Transacción:</span>
              <span class="detail-value detail-code">{{ paymentDetails.transaction_id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Monto:</span>
              <span class="detail-value">${{ formatPrice(paymentDetails.amount) }}</span>
            </div>
            <div v-if="paymentDetails.payment_method" class="detail-row">
              <span class="detail-label">Método de pago:</span>
              <span class="detail-value">{{ paymentDetails.payment_method }}</span>
            </div>
          </q-card-section>
        </q-card>

        <!-- Botones de acción -->
        <div class="actions-container q-mt-xl">
          <q-btn
            label="Verificar estado nuevamente"
            color="primary"
            unelevated
            no-caps
            size="lg"
            icon="refresh"
            @click="checkPaymentStatus"
            :loading="checking"
          />

          <div class="secondary-actions">
            <q-btn
              label="Ver mis transacciones"
              flat
              color="grey-5"
              no-caps
              @click="goToTransactions"
            />
            <q-btn label="Volver al inicio" flat color="grey-5" no-caps @click="goToHome" />
          </div>
        </div>

        <!-- Auto-refresh info -->
        <div class="auto-refresh-info q-mt-lg">
          <q-icon name="autorenew" size="xs" color="grey-5" />
          <span class="text-grey-5 q-ml-xs text-caption">
            Verificaremos automáticamente el estado cada 30 segundos
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePagosStore } from 'stores/pagos-store.js'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const pagosStore = usePagosStore()

const checking = ref(true)
const paymentDetails = ref(null)
let autoRefreshInterval = null

onMounted(async () => {
  await checkPaymentStatus()
  startAutoRefresh()
})

onUnmounted(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})

async function checkPaymentStatus() {
  checking.value = true

  try {
    const paymentId = route.query.payment_id || route.query.preference_id

    if (!paymentId) {
      $q.notify({
        type: 'warning',
        message: 'No se encontró información del pago',
        icon: 'warning',
      })
      goToHome()
      return
    }

    const transaction = await pagosStore.consultarTransaccion(paymentId)
    paymentDetails.value = transaction

    // Si el pago ya fue aprobado o rechazado, redirigir
    if (transaction.status === 'approved') {
      $q.notify({
        type: 'positive',
        message: '¡Tu pago ha sido aprobado!',
        icon: 'check_circle',
      })
      router.replace('/payment/success' + window.location.search)
    } else if (transaction.status === 'rejected' || transaction.status === 'cancelled') {
      $q.notify({
        type: 'negative',
        message: 'Tu pago no pudo ser procesado',
        icon: 'error',
      })
      router.replace('/payment/cancel' + window.location.search)
    }
  } catch (error) {
    console.error('Error al verificar pago:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al verificar el estado del pago',
      icon: 'error',
    })
  } finally {
    checking.value = false
  }
}

function startAutoRefresh() {
  // Verificar cada 30 segundos
  autoRefreshInterval = setInterval(async () => {
    await checkPaymentStatus()
  }, 30000)
}

function goToTransactions() {
  router.push('/main/mis-transacciones')
}

function goToHome() {
  router.push('/main/dashboard')
}

function formatPrice(price) {
  if (!price) return '0'
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style lang="scss" scoped>
.payment-status-page {
  min-height: 100vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.status-container {
  max-width: 600px;
  width: 100%;
}

.loading-state,
.pending-state {
  animation: fadeInUp 0.5s ease-out;
  text-align: center;
}

.icon-container {
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;

  &.pending {
    .q-icon {
      filter: drop-shadow(0 0 20px rgba(255, 193, 7, 0.5));
    }
  }
}

.status-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
}

.status-message {
  font-size: 16px;
  color: #b0b0b0;
  margin: 0;
  line-height: 1.6;
}

.info-card,
.alert-card,
.details-card {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
}

// Timeline
.timeline {
  padding: 16px 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 32px;
    width: 2px;
    height: calc(100% - 32px);
    background: #2a2a2a;
  }

  &.completed::before {
    background: #4caf50;
  }

  &.active::before {
    background: linear-gradient(180deg, #ffc107 0%, #2a2a2a 100%);
  }

  &:last-child {
    padding-bottom: 0;
  }
}

.timeline-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .timeline-item.completed & {
    background: rgba(76, 175, 80, 0.1);
    border-color: #4caf50;
  }

  .timeline-item.active & {
    background: rgba(255, 193, 7, 0.1);
    border-color: #ffc107;
  }
}

.timeline-content {
  flex: 1;
  padding-top: 4px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #b0b0b0;
}

// Alert card
.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.alert-list {
  margin: 0;
  padding-left: 28px;
  color: #b0b0b0;
  font-size: 13px;
  line-height: 1.8;

  li {
    margin-bottom: 4px;
  }
}

// Details card
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2a2a2a;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;

  &:not(:last-child) {
    border-bottom: 1px solid #1a1a1a;
  }
}

.detail-label {
  color: #b0b0b0;
}

.detail-value {
  color: #ffffff;
  font-weight: 500;

  &.detail-code {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #00a8a8;
  }
}

// Actions
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.secondary-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.auto-refresh-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

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
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .status-title {
    font-size: 24px;
  }

  .status-message {
    font-size: 14px;
  }

  .icon-container .q-icon {
    font-size: 60px !important;
  }

  .secondary-actions {
    flex-direction: column;
  }
}
</style>
