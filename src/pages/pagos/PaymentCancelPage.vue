<template>
  <q-page class="payment-page">
    <div class="payment-container">
      <div class="payment-card cancel-state">
        <div class="cancel-icon-container">
          <q-icon name="cancel" color="warning" size="80px" class="cancel-icon" />
        </div>

        <h2 class="payment-title">Pago Cancelado</h2>
        <p class="payment-subtitle">
          Has cancelado el proceso de pago. No se ha realizado ningún cargo.
        </p>

        <!-- Info Box -->
        <div class="info-box">
          <q-icon name="info" color="primary" size="24px" />
          <div class="info-content">
            <p class="info-text">
              Si cancelaste por error o deseas continuar con la suscripción, puedes intentarlo
              nuevamente.
            </p>
          </div>
        </div>

        <!-- Transaction Info (si existe) -->
        <div v-if="transactionId" class="transaction-info">
          <div class="detail-row">
            <span class="detail-label">ID de Transacción:</span>
            <span class="detail-value transaction-id">{{ transactionId }}</span>
          </div>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <h3 class="help-title">¿Necesitas ayuda?</h3>
          <div class="help-item">
            <q-icon name="help" color="primary" size="20px" />
            <span>Si tuviste problemas durante el pago, contáctanos</span>
          </div>
          <div class="help-item">
            <q-icon name="payment" color="primary" size="20px" />
            <span>Puedes intentar con otro método de pago</span>
          </div>
          <div class="help-item">
            <q-icon name="explore" color="primary" size="20px" />
            <span>Explora otros planes que puedan ajustarse mejor</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            label="Intentar nuevamente"
            color="primary"
            unelevated
            no-caps
            icon="replay"
            class="action-btn"
            @click="retryPayment"
          />
          <q-btn
            label="Ver planes"
            color="dark"
            flat
            no-caps
            class="action-btn"
            @click="viewPlans"
          />
          <q-btn
            label="Volver al catálogo"
            flat
            color="grey-5"
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

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const transactionId = ref('')

onMounted(() => {
  // Obtener el ID de transacción si existe
  transactionId.value = route.query.transaction_id || route.query.external_reference || ''

  // Log para analytics (opcional)
  console.log('Pago cancelado - Transaction ID:', transactionId.value)

  $q.notify({
    type: 'info',
    message: 'Pago cancelado. Puedes intentarlo nuevamente cuando quieras.',
    icon: 'info',
    timeout: 3000,
  })
})

function retryPayment() {
  // Redirigir al catálogo o a la última página de pricing visitada
  router.push('/main/catalogo')
}

function viewPlans() {
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
  position: relative;
}

// Cancel State
.cancel-state {
  border-color: #ffa726;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ffa726, #ffb74d);
    border-radius: 16px 16px 0 0;
  }
}

.cancel-icon-container {
  animation: scaleIn 0.5s ease-out;
}

.cancel-icon {
  filter: drop-shadow(0 4px 12px rgba(255, 167, 38, 0.4));
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

// Info Box
.info-box {
  background: rgba(0, 168, 168, 0.05);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  text-align: left;
}

.info-content {
  flex: 1;
}

.info-text {
  color: #b0b0b0;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

// Transaction Info
.transaction-info {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

// Help Section
.help-section {
  text-align: left;
  margin-bottom: 32px;
}

.help-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.help-item {
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

  .info-box {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
