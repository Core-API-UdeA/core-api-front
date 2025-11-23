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

      <div class="row items-center q-gutter-sm">
        <!-- Botón de edición (solo para owner) -->
        <q-btn
          v-if="isOwner"
          flat
          dense
          icon="edit"
          label="Gestionar Planes"
          color="primary"
          size="sm"
          no-caps
          @click="abrirGestionPlanes"
        >
          <q-tooltip class="bg-primary">Editar, agregar o eliminar planes</q-tooltip>
        </q-btn>

        <!-- Toggle de período (si hay planes mensuales y anuales) -->
        <q-btn-toggle
          v-if="hasMultipleBillingCycles"
          v-model="billingCycle"
          toggle-color="primary"
          color="transparent"
          text-color="grey-5"
          toggle-text-color="white"
          size="md"
          no-caps
          unelevated
          class="billing-toggle"
          :options="[
            { label: 'Mensual', value: 'monthly' },
            { label: 'Anual', value: 'yearly' },
          ]"
        />
      </div>
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
            <q-icon name="star" size="14px" class="q-mr-xs" />
            Más Popular
          </div>

          <!-- Botones de edición (solo para owner) -->
          <div v-if="isOwner" class="plan-edit-actions">
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="edit"
              color="primary"
              @click="editarPlan(plan)"
            >
              <q-tooltip class="bg-primary">Editar plan</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="delete"
              color="negative"
              @click="confirmarEliminarPlan(plan.id)"
            >
              <q-tooltip class="bg-negative">Eliminar plan</q-tooltip>
            </q-btn>
          </div>

          <q-card-section class="plan-content">
            <!-- Plan Name -->
            <div class="plan-name">{{ plan.name }}</div>

            <!-- Plan Price -->
            <div class="plan-price-container">
              <span v-if="plan.price === 0" class="plan-price-free">Gratis</span>
              <template v-else>
                <div class="price-wrapper">
                  <span class="plan-price-currency">$</span>
                  <span class="plan-price-amount">{{ formatPrice(plan.price) }}</span>
                </div>
                <span class="plan-price-period">{{ getPeriodLabel(plan.billing_cycle) }}</span>
              </template>
            </div>

            <!-- Plan Description -->
            <p v-if="plan.description" class="plan-description">
              {{ plan.description }}
            </p>

            <!-- Divider -->
            <div class="features-divider"></div>

            <!-- Plan Features -->
            <div class="plan-features">
              <!-- Request limits -->
              <div class="feature-item">
                <q-icon name="check_circle" color="primary" size="18px" />
                <span>
                  <strong>{{ formatRequestLimit(plan.max_requests_per_month) }}</strong> requests/mes
                </span>
              </div>

              <div v-if="plan.max_requests_per_day" class="feature-item">
                <q-icon name="check_circle" color="primary" size="18px" />
                <span>
                  <strong>{{ formatNumber(plan.max_requests_per_day) }}</strong> requests/día
                </span>
              </div>

              <div v-if="plan.max_requests_per_minute" class="feature-item">
                <q-icon name="check_circle" color="primary" size="18px" />
                <span>
                  <strong>{{ formatNumber(plan.max_requests_per_minute) }}</strong> requests/minuto
                </span>
              </div>

              <!-- Additional features -->
              <div
                v-for="(feature, index) in plan.features"
                :key="'feature-' + index"
                class="feature-item"
              >
                <q-icon name="check_circle" color="primary" size="18px" />
                <span>{{ feature }}</span>
              </div>
            </div>

            <!-- Spacer -->
            <div class="flex-spacer"></div>

            <!-- CTA Button -->
            <q-btn
              :label="getButtonLabel(plan)"
              :color="plan.is_popular ? 'primary' : 'dark'"
              :class="{ 'popular-button': plan.is_popular }"
              unelevated
              no-caps
              class="full-width cta-button"
              :disable="processingPlanId === plan.id || isSubscribed(plan.id)"
              :loading="processingPlanId === plan.id"
              @click="selectPlan(plan)"
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>

            <!-- Already subscribed message -->
            <div v-if="isSubscribed(plan.id)" class="subscribed-message">
              <q-icon name="check_circle" color="positive" size="16px" />
              <span>Plan Actual</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- No plans available -->
    <div v-else class="no-plans-container">
      <q-icon name="credit_card_off" size="64px" color="grey-6" />
      <p class="text-grey-5 q-mt-md">No hay planes disponibles para esta API</p>
      <q-btn
        v-if="isOwner"
        label="Crear Primer Plan"
        color="primary"
        icon="add"
        no-caps
        unelevated
        @click="abrirGestionPlanes"
      />
    </div>

    <!-- Dialog de confirmación de suscripción -->
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

          <p v-if="selectedPlan?.price === 0" class="text-grey-5 text-caption q-mt-md">
            Este es un plan gratuito. Podrás comenzar a usarlo inmediatamente.
          </p>
          <p v-else class="text-grey-5 text-caption q-mt-md">
            Serás redirigido a Mercado Pago para completar el pago de forma segura.
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="grey-5" no-caps v-close-popup />
          <q-btn
            :label="selectedPlan?.price === 0 ? 'Activar Plan Gratis' : 'Continuar al pago'"
            color="primary"
            no-caps
            unelevated
            @click="confirmarPlan"
            :loading="processingPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para gestionar planes (solo para owner) -->
    <q-dialog v-model="showManagePlansDialog" maximized dark @hide="handleDialogClose">
      <q-card flat class="bg-dark">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-white">Gestionar Planes</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <RegistrarPlanes
            v-if="showManagePlansDialog"
            ref="planesFormRef"
            :api-id="apiId"
            @success="handlePlanesActualizados"
            @cancel="showManagePlansDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePagosStore } from 'stores/pagos-store.js'
import { useAuthStore } from 'stores/auth-store.js'
import { useApisStore } from 'stores/apis-store.js'
import RegistrarPlanes from 'src/components/pagos/FormularioApiPlans.vue'

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
  owner: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['plan-selected', 'subscription-created', 'plans-updated'])

const $q = useQuasar()
const pagosStore = usePagosStore()
const authStore = useAuthStore()
const apisStore = useApisStore()

const loading = ref(false)
const billingCycle = ref('monthly')
const selectedPlan = ref(null)
const showConfirmDialog = ref(false)
const showManagePlansDialog = ref(false)
const processingPlanId = ref(null)
const processingPayment = ref(false)
const planesFormRef = ref(null)

// Verificar si el usuario actual es el owner
const isOwner = computed(() => {
  if (!authStore.loggedIn || !props.owner) return false
  return authStore.user?.email === props.owner
})

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
    // Si el plan es gratuito
    if (selectedPlan.value.price === 0) {
      // Cerrar dialog
      showConfirmDialog.value = false

      $q.notify({
        type: 'info',
        message: 'Plan gratuito activado. Próximamente podrás usar esta API.',
        icon: 'celebration',
        timeout: 3000,
      })

      // TODO: Implementar lógica para activar plan gratuito
      emit('subscription-created', selectedPlan.value)

      return
    }

    // Crear checkout para planes de pago
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
    console.error('Error al procesar suscripción:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.ejecucion?.respuesta?.mensaje || 'Error al procesar la suscripción',
      icon: 'error',
    })
  } finally {
    processingPayment.value = false
    processingPlanId.value = null
  }
}

// Funciones para gestión de planes (solo owner)
function abrirGestionPlanes() {
  showManagePlansDialog.value = true
}

function editarPlan(plan) {
  // Abrir el dialog de gestión en modo edición
  showManagePlansDialog.value = true

  // Esperar a que el componente se monte y luego cargar los datos del plan
  setTimeout(() => {
    if (planesFormRef.value && planesFormRef.value.editarPlan) {
      planesFormRef.value.editarPlan(plan)
    }
  }, 300)
}

function confirmarEliminarPlan(planId) {
  $q.dialog({
    title: 'Eliminar Plan',
    message: '¿Estás seguro de que deseas eliminar este plan? Los usuarios suscritos perderán el acceso.',
    dark: true,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-5',
    },
    ok: {
      label: 'Eliminar',
      color: 'negative',
    },
  }).onOk(async () => {
    await eliminarPlan(planId)
  })
}

async function eliminarPlan(planId) {
  try {
    $q.loading.show()
    await pagosStore.eliminarPlan(props.apiId, planId)

    $q.notify({
      type: 'positive',
      message: 'Plan eliminado exitosamente',
      icon: 'check_circle',
    })

    // Notificar al padre para recargar planes
    emit('plans-updated')
  } catch (error) {
    console.error('Error al eliminar plan:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el plan',
      icon: 'error',
    })
  } finally {
    $q.loading.hide()
  }
}

function handleDialogClose() {
  if (planesFormRef.value && planesFormRef.value.resetForm) {
    planesFormRef.value.resetForm()
  }
}

async function handlePlanesActualizados() {
  showManagePlansDialog.value = false

  $q.notify({
    type: 'positive',
    message: 'Planes actualizados exitosamente',
    icon: 'check_circle',
  })

  // Notificar al padre para recargar planes
  emit('plans-updated')
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
  line-height: 1.5;
}

// Billing Toggle
.billing-toggle {
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-btn) {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

// Plan Cards
.plan-card {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
  overflow: hidden;

  &:hover {
    border-color: #00a8a8;
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 168, 168, 0.15);

    .plan-edit-actions {
      opacity: 1;
    }
  }

  &.plan-popular {
    border-color: #00a8a8;
    background: linear-gradient(135deg, rgba(0, 168, 168, 0.08) 0%, rgba(0, 0, 0, 0) 100%);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #00a8a8, #00d4d4);
    }
  }

  &.plan-free {
    border-color: #4caf50;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #4caf50;
    }
  }
}

.plan-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 28px 24px;
}

.popular-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #00a8a8, #00d4d4);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 4px 12px rgba(0, 168, 168, 0.3);
  z-index: 2;
}

.plan-edit-actions {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  padding: 4px;
  border-radius: 8px;
}

.plan-name {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.plan-price-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  min-height: 70px;
}

.plan-price-free {
  font-size: 40px;
  font-weight: 700;
  color: #4caf50;
  line-height: 1;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  line-height: 1;
}

.plan-price-currency {
  font-size: 24px;
  font-weight: 600;
  color: #00a8a8;
  margin-right: 4px;
}

.plan-price-amount {
  font-size: 42px;
  font-weight: 700;
  color: #ffffff;
}

.plan-price-period {
  font-size: 15px;
  color: #b0b0b0;
  margin-top: 8px;
  display: block;
}

.plan-description {
  color: #b0b0b0;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  min-height: 44px;
}

.features-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #2a2a2a, transparent);
  margin-bottom: 20px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.5;

  .q-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  strong {
    color: #ffffff;
    font-weight: 600;
  }
}

.flex-spacer {
  flex-grow: 1;
}

.cta-button {
  font-size: 15px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &.popular-button {
    background: linear-gradient(135deg, #00a8a8, #00d4d4);
    box-shadow: 0 4px 16px rgba(0, 168, 168, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(0, 168, 168, 0.4);
      transform: translateY(-2px);
    }
  }

  &:not(.popular-button) {
    border: 1px solid #2a2a2a;

    &:hover {
      border-color: #00a8a8;
      background: rgba(0, 168, 168, 0.1);
    }
  }
}

.subscribed-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4caf50;
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px;
  padding: 8px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 6px;
}

// No plans
.no-plans-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: #0d0d0d;
  border: 1px dashed #2a2a2a;
  border-radius: 12px;
}

// Skeleton
.plan-card-skeleton {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 28px 24px;
  height: 500px;
}

.skeleton-item {
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 6px;
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
  min-width: 450px;
}

.summary-box {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: #e0e0e0;
  font-size: 15px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  span:first-child {
    color: #b0b0b0;
  }

  span:last-child {
    font-weight: 600;
  }
}

// Responsive
@media (max-width: 768px) {
  .pricing-container {
    padding: 12px 0;
  }

  .section-title {
    font-size: 20px;
  }

  .section-subtitle {
    font-size: 13px;
  }

  .billing-toggle {
    font-size: 12px;
  }

  .plan-content {
    padding: 24px 20px;
  }

  .plan-name {
    font-size: 20px;
  }

  .plan-price-amount {
    font-size: 36px;
  }

  .plan-description {
    font-size: 13px;
  }

  .feature-item {
    font-size: 13px;
  }

  .plan-edit-actions {
    opacity: 1;
  }

  .confirm-dialog-card {
    min-width: auto;
    width: 90vw;
  }

  .summary-box {
    padding: 16px;
  }
}
</style>
