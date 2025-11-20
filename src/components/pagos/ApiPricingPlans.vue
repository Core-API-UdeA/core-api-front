<template>
  <div class="pricing-container">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <h3 class="section-title q-ma-none">Planes y Precios</h3>
        <p class="section-subtitle q-mt-sm">
          Selecciona el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <!-- Toggle de período (si hay planes mensuales y anuales) -->
      <q-btn-toggle
        v-if="hasMultipleBillingCycles"
        v-model="billingCycle"
        toggle-color="primary"
        color="dark"
        text-color="white"
        size="sm"
        no-caps
        :options="[
          { label: 'Mensual', value: 'monthly' },
          { label: 'Anual', value: 'yearly' },
        ]"
      />
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="row q-col-gutter-md">
      <div v-for="n in 3" :key="'skeleton-' + n" class="col-12 col-sm-6 col-md-4">
        <div class="plan-card-skeleton">
          <div class="skeleton-item" style="width: 60%; height: 24px; margin-bottom: 12px"></div>
          <div class="skeleton-item" style="width: 40%; height: 32px; margin-bottom: 16px"></div>
          <div class="skeleton-item" style="width: 100%; height: 12px; margin-bottom: 8px"></div>
          <div class="skeleton-item" style="width: 90%; height: 12px; margin-bottom: 20px"></div>
          <div class="skeleton-item" style="width: 100%; height: 40px"></div>
        </div>
      </div>
    </div>

    <!-- Plans Grid -->
    <div v-else-if="filteredPlans.length > 0" class="row q-col-gutter-md">
      <div v-for="plan in filteredPlans" :key="plan.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          class="plan-card"
          :class="{
            'plan-popular': plan.is_popular,
            'plan-free': plan.price === 0,
          }"
        >
          <!-- Badge Popular -->
          <div v-if="plan.is_popular" class="popular-badge">
            <q-icon name="star" size="xs" class="q-mr-xs" />
            Más Popular
          </div>

          <q-card-section>
            <!-- Plan Name -->
            <div class="plan-name">{{ plan.name }}</div>

            <!-- Plan Price -->
            <div class="plan-price-container">
              <span v-if="plan.price === 0" class="plan-price-free">Gratis</span>
              <template v-else>
                <span class="plan-price-currency">$</span>
                <span class="plan-price-amount">{{ formatPrice(plan.price) }}</span>
                <span class="plan-price-period">{{ getPeriodLabel(plan.billing_cycle) }}</span>
              </template>
            </div>

            <!-- Plan Description -->
            <p v-if="plan.description" class="plan-description">
              {{ plan.description }}
            </p>

            <!-- Plan Features -->
            <div class="plan-features q-mt-md">
              <!-- Request limits -->
              <div class="feature-item">
                <q-icon name="done" color="primary" size="xs" />
                <span> {{ formatRequestLimit(plan.max_requests_per_month) }} requests/mes </span>
              </div>

              <div v-if="plan.max_requests_per_day" class="feature-item">
                <q-icon name="done" color="primary" size="xs" />
                <span>{{ formatNumber(plan.max_requests_per_day) }} requests/día</span>
              </div>

              <div v-if="plan.max_requests_per_minute" class="feature-item">
                <q-icon name="done" color="primary" size="xs" />
                <span>{{ formatNumber(plan.max_requests_per_minute) }} requests/minuto</span>
              </div>

              <!-- Additional features -->
              <div
                v-for="(feature, index) in plan.features"
                :key="'feature-' + index"
                class="feature-item"
              >
                <q-icon name="done" color="primary" size="xs" />
                <span>{{ feature }}</span>
              </div>
            </div>

            <!-- CTA Button -->
            <q-btn
              :label="getButtonLabel(plan)"
              color="primary"
              unelevated
              no-caps
              class="full-width q-mt-lg"
              :disable="processingPlanId === plan.id || isSubscribed(plan.id)"
              :loading="processingPlanId === plan.id"
              @click="selectPlan(plan)"
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>

            <!-- Already subscribed message -->
            <div v-if="isSubscribed(plan.id)" class="subscribed-message q-mt-sm">
              <q-icon name="check_circle" color="positive" size="sm" />
              <span>Ya estás suscrito a este plan</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- No plans available -->
    <div v-else class="no-plans-container">
      <q-icon name="credit_card_off" size="64px" color="grey-6" />
      <p class="text-grey-5 q-mt-md">No hay planes disponibles para esta API</p>
    </div>

    <!-- Dialog de confirmación -->
    <q-dialog v-model="showConfirmDialog" dark>
      <q-card flat class="confirm-dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-white">Confirmar Suscripción</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-white">
            Estás a punto de suscribirte al plan <strong>{{ selectedPlan?.name }}</strong>
          </p>

          <div class="summary-box q-mt-md">
            <div class="summary-row">
              <span>Plan:</span>
              <span>{{ selectedPlan?.name }}</span>
            </div>
            <div class="summary-row">
              <span>Precio:</span>
              <span v-if="selectedPlan?.price === 0" class="text-positive">Gratis</span>
              <span v-else class="text-weight-bold">
                ${{ formatPrice(selectedPlan?.price) }}
                {{ getPeriodLabel(selectedPlan?.billing_cycle) }}
              </span>
            </div>
            <div v-if="selectedPlan?.max_requests_per_month" class="summary-row">
              <span>Requests incluidos:</span>
              <span>{{ formatRequestLimit(selectedPlan?.max_requests_per_month) }}/mes</span>
            </div>
          </div>

          <p class="text-grey-5 text-caption q-mt-md">
            Serás redirigido a Mercado Pago para completar el pago de forma segura.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="grey-5" no-caps v-close-popup />
          <q-btn
            label="Continuar al pago"
            color="primary"
            no-caps
            @click="confirmarPlan"
            :loading="processingPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePagosStore } from 'stores/pagos-store.js'
import { useAuthStore } from 'stores/auth-store.js'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
  plans: {
    type: Array,
    default: () => [],
  },
  userSubscriptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['plan-selected', 'subscription-created'])

const $q = useQuasar()
const pagosStore = usePagosStore()
const authStore = useAuthStore()

const loading = ref(false)
const billingCycle = ref('monthly')
const selectedPlan = ref(null)
const showConfirmDialog = ref(false)
const processingPlanId = ref(null)
const processingPayment = ref(false)

// Computed
const filteredPlans = computed(() => {
  if (!props.plans || props.plans.length === 0) return []

  // Filtrar por ciclo de facturación si hay múltiples
  if (hasMultipleBillingCycles.value) {
    return props.plans.filter((p) => p.billing_cycle === billingCycle.value && p.is_active)
  }

  return props.plans.filter((p) => p.is_active)
})

const hasMultipleBillingCycles = computed(() => {
  const cycles = new Set(props.plans.map((p) => p.billing_cycle))
  return cycles.has('monthly') && cycles.has('yearly')
})

// Methods
function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

function formatNumber(num) {
  if (!num) return '0'
  return new Intl.NumberFormat('es-CO').format(num)
}

function formatRequestLimit(limit) {
  if (!limit) return 'Ilimitado'
  if (limit >= 1000000) {
    return `${(limit / 1000000).toFixed(1)}M`
  }
  if (limit >= 1000) {
    return `${(limit / 1000).toFixed(1)}K`
  }
  return formatNumber(limit)
}

function getPeriodLabel(cycle) {
  const labels = {
    monthly: '/mes',
    yearly: '/año',
    lifetime: 'único',
    pay_per_use: '/uso',
  }
  return labels[cycle] || ''
}

function getButtonLabel(plan) {
  if (isSubscribed(plan.id)) {
    return 'Plan Actual'
  }

  if (plan.price === 0) {
    return 'Comenzar Gratis'
  }

  return 'Seleccionar Plan'
}

function isSubscribed(planId) {
  return props.userSubscriptions?.some((sub) => sub.plan_id === planId && sub.status === 'active')
}

function selectPlan(plan) {
  if (!authStore.loggedIn) {
    $q.notify({
      type: 'warning',
      message: 'Debes iniciar sesión para suscribirte a un plan',
      icon: 'warning',
    })
    return
  }

  selectedPlan.value = plan
  showConfirmDialog.value = true
  emit('plan-selected', plan)
}

async function confirmarPlan() {
  if (!selectedPlan.value) return

  processingPayment.value = true
  processingPlanId.value = selectedPlan.value.id

  try {
    // Crear checkout
    const checkout = await pagosStore.crearCheckout(
      props.apiId,
      selectedPlan.value.id,
      'mercadopago',
    )

    // Cerrar dialog
    showConfirmDialog.value = false

    // Notificar
    $q.notify({
      type: 'info',
      message: 'Redirigiendo a Mercado Pago...',
      icon: 'payment',
      timeout: 2000,
    })

    // Esperar un momento y redirigir
    setTimeout(() => {
      window.location.href = checkout.checkout_url
    }, 1000)
  } catch (error) {
    console.error('Error al crear checkout:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.ejecucion?.respuesta?.mensaje || 'Error al procesar el pago',
      icon: 'error',
    })
  } finally {
    processingPayment.value = false
    processingPlanId.value = null
  }
}

onMounted(() => {
  // Si hay planes anuales por defecto, mostrarlos
  if (props.plans.some((p) => p.billing_cycle === 'yearly')) {
    // Mantener mensual por defecto
  }
})
</script>

<style lang="scss" scoped>
.pricing-container {
  padding: 20px 0;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
}

.section-subtitle {
  font-size: 14px;
  color: #b0b0b0;
  margin: 0;
}

// Plan Cards
.plan-card {
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #00a8a8;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 168, 168, 0.2);
  }

  &.plan-popular {
    border-color: #00a8a8;
    background: linear-gradient(135deg, rgba(0, 168, 168, 0.05) 0%, rgba(0, 0, 0, 0) 100%);
  }

  &.plan-free {
    border-color: #4caf50;
  }
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: #00a8a8;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-name {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.plan-price-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
  min-height: 48px;
}

.plan-price-free {
  font-size: 32px;
  font-weight: 700;
  color: #4caf50;
}

.plan-price-currency {
  font-size: 20px;
  font-weight: 600;
  color: #00a8a8;
  margin-right: 4px;
}

.plan-price-amount {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.plan-price-period {
  font-size: 14px;
  color: #b0b0b0;
  margin-left: 6px;
}

.plan-description {
  color: #b0b0b0;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  min-height: 40px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #e0e0e0;
  font-size: 13px;

  .q-icon {
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.subscribed-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4caf50;
  font-size: 12px;
  font-weight: 500;
}

// No plans
.no-plans-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

// Skeleton
.plan-card-skeleton {
  background: #0f0f0f;
  border: 2px solid #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  height: 400px;
}

.skeleton-item {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Confirm Dialog
.confirm-dialog-card {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  min-width: 400px;
}

.summary-box {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: #e0e0e0;
  font-size: 14px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  span:first-child {
    color: #b0b0b0;
  }

  span:last-child {
    font-weight: 500;
  }
}

// Responsive
@media (max-width: 768px) {
  .section-title {
    font-size: 20px;
  }

  .plan-price-amount {
    font-size: 28px;
  }

  .confirm-dialog-card {
    min-width: auto;
    width: 90vw;
  }
}
</style>
