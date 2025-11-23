<template>
  <div class="planes-manager-container">
    <!-- Preview de Planes Existentes -->
    <div v-if="planesExistentes.length > 0" class="planes-preview-section q-mb-xl">
      <div class="section-header q-mb-md">
        <h5 class="section-title q-ma-none">Planes Creados</h5>
        <q-badge
          :label="`${planesExistentes.length} plan${planesExistentes.length > 1 ? 'es' : ''}`"
          color="primary"
        />
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="plan in planesExistentes" :key="plan.id" class="col-12 col-sm-6 col-md-4">
          <q-card
            flat
            class="plan-preview-card"
            :class="{
              'plan-popular': plan.is_popular,
              'plan-free': plan.price === 0,
              'plan-inactive': !plan.is_active,
            }"
          >
            <!-- Badge Popular -->
            <div v-if="plan.is_popular" class="popular-badge">
              <q-icon name="star" size="14px" class="q-mr-xs" />
              Más Popular
            </div>

            <!-- Badge Inactivo -->
            <div v-if="!plan.is_active" class="inactive-badge">
              <q-icon name="visibility_off" size="14px" class="q-mr-xs" />
              Inactivo
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
                <div class="feature-item">
                  <q-icon name="check_circle" color="primary" size="18px" />
                  <span>
                    <strong>{{ formatRequestLimit(plan.max_requests_per_month) }}</strong>
                    requests/mes
                  </span>
                </div>

                <div v-if="plan.max_requests_per_day" class="feature-item">
                  <q-icon name="check_circle" color="primary" size="18px" />
                  <span>
                    <strong>{{ formatNumber(plan.max_requests_per_day) }}</strong> requests/día
                  </span>
                </div>

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

              <!-- Actions -->
              <div class="plan-actions q-mt-md">
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="primary"
                  icon="edit"
                  label="Editar"
                  no-caps
                  @click="editarPlan(plan)"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="negative"
                  icon="delete"
                  label="Eliminar"
                  no-caps
                  @click="confirmarEliminarPlan(plan.id)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Formulario de Creación/Edición -->
    <div class="formulario-section">
      <div class="section-header q-mb-md">
        <h5 class="section-title q-ma-none">
          {{ modoEdicion ? 'Editar Plan' : 'Agregar Nuevo Plan' }}
        </h5>
        <q-btn
          v-if="modoEdicion"
          flat
          dense
          size="sm"
          color="grey-5"
          icon="close"
          label="Cancelar Edición"
          no-caps
          @click="cancelarEdicion"
        />
      </div>

      <q-card flat class="planes-form-card">
        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-y-md">
            <!-- Nombre y Estado -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="formData.name"
                  label="Nombre del Plan *"
                  outlined
                  dense
                  dark
                  color="primary"
                  bg-color="dark"
                  :rules="[(val) => !!val || 'El nombre es requerido']"
                  placeholder="Free, Basic, Pro, Enterprise..."
                >
                  <template v-slot:prepend>
                    <q-icon name="label" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-4">
                <div class="row q-gutter-sm">
                  <q-checkbox
                    v-model="formData.is_active"
                    label="Activo"
                    dark
                    dense
                    color="primary"
                  />
                  <q-checkbox
                    v-model="formData.is_popular"
                    label="Popular"
                    dark
                    dense
                    color="primary"
                  />
                </div>
              </div>
            </div>

            <!-- Precio y Ciclo -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="formData.price"
                  label="Precio *"
                  type="number"
                  outlined
                  dense
                  dark
                  color="primary"
                  bg-color="dark"
                  step="0.01"
                  min="0"
                  :rules="[(val) => val >= 0 || 'El precio debe ser mayor o igual a 0']"
                  :hint="formData.price === 0 ? 'Plan gratuito' : ''"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" color="primary" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="formData.billing_cycle"
                  label="Ciclo de Facturación *"
                  outlined
                  dense
                  dark
                  color="primary"
                  bg-color="dark"
                  :options="ciclosFacturacion"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="event_repeat" color="primary" />
                  </template>
                </q-select>
              </div>
            </div>

            <!-- Descripción -->
            <q-input
              v-model="formData.description"
              label="Descripción"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              type="textarea"
              rows="2"
              placeholder="Describe brevemente este plan..."
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>

            <!-- Límites de Requests -->
            <div class="limits-section">
              <div class="section-header">
                <span class="section-title">Límites de Requests</span>
                <q-icon name="help" size="xs" color="grey-5" class="q-ml-xs">
                  <q-tooltip class="bg-primary text-white" max-width="300px">
                    Deja en blanco o 0 para ilimitado
                  </q-tooltip>
                </q-icon>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="formData.max_requests_per_month"
                    label="Por Mes"
                    type="number"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    min="0"
                    placeholder="10000"
                    hint="0 = ilimitado"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_today" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="formData.max_requests_per_day"
                    label="Por Día"
                    type="number"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    min="0"
                    placeholder="500"
                    hint="0 = ilimitado"
                  >
                    <template v-slot:prepend>
                      <q-icon name="today" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-4">
                  <q-input
                    v-model.number="formData.max_requests_per_minute"
                    label="Por Minuto"
                    type="number"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    min="0"
                    placeholder="10"
                    hint="0 = ilimitado"
                  >
                    <template v-slot:prepend>
                      <q-icon name="schedule" color="primary" size="sm" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Features -->
            <div class="features-section">
              <div class="section-header">
                <span class="section-title">Características del Plan</span>
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="primary"
                  icon="add"
                  label="Agregar"
                  no-caps
                  @click="agregarFeature"
                />
              </div>

              <div v-if="formData.features.length > 0" class="features-list q-gutter-sm">
                <div
                  v-for="(feature, index) in formData.features"
                  :key="index"
                  class="feature-item-form"
                >
                  <q-input
                    v-model="formData.features[index]"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    placeholder="Ej: Soporte 24/7, API Key incluida..."
                  >
                    <template v-slot:prepend>
                      <q-icon name="check_circle" color="primary" size="sm" />
                    </template>
                    <template v-slot:append>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        size="sm"
                        @click="eliminarFeature(index)"
                      />
                    </template>
                  </q-input>
                </div>
              </div>

              <div v-else class="no-features">
                <q-icon name="info" size="sm" color="grey-5" />
                <span class="text-grey-5 q-ml-sm">
                  No hay características. Haz clic en "Agregar" para incluir algunas.
                </span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn
                v-if="!modoEdicion"
                label="Cancelar"
                flat
                color="grey-5"
                no-caps
                @click="onCancel"
                :disable="loading"
              />
              <q-btn
                :label="modoEdicion ? 'Actualizar Plan' : 'Crear Plan'"
                type="submit"
                color="primary"
                no-caps
                unelevated
                :loading="loading"
                :disable="loading"
              >
                <template v-slot:loading>
                  <q-spinner-dots />
                </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePagosStore } from 'stores/pagos-store.js'
import { useApisStore } from 'stores/apis-store.js'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['success', 'cancel'])

const $q = useQuasar()
const pagosStore = usePagosStore()
const apisStore = useApisStore()

const loading = ref(false)
const planesExistentes = ref([])
const modoEdicion = ref(false)
const planEditando = ref(null)

const formData = ref({
  name: '',
  description: '',
  price: 0,
  billing_cycle: 'monthly',
  max_requests_per_month: 0,
  max_requests_per_day: 0,
  max_requests_per_minute: 0,
  features: [],
  is_active: true,
  is_popular: false,
})

const ciclosFacturacion = [
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'yearly' },
  { label: 'De por vida', value: 'lifetime' },
  { label: 'Por uso', value: 'pay_per_use' },
]

onMounted(async () => {
  await cargarPlanesExistentes()
})

async function cargarPlanesExistentes() {
  try {
    planesExistentes.value = await apisStore.consultarApiPlanes(props.apiId)
  } catch (error) {
    console.error('Error al cargar planes:', error)
  }
}

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

function agregarFeature() {
  formData.value.features.push('')
}

function eliminarFeature(index) {
  formData.value.features.splice(index, 1)
}

function editarPlan(plan) {
  modoEdicion.value = true
  planEditando.value = plan.id

  formData.value = {
    name: plan.name || '',
    description: plan.description || '',
    price: plan.price || 0,
    billing_cycle: plan.billing_cycle || 'monthly',
    max_requests_per_month: plan.max_requests_per_month || 0,
    max_requests_per_day: plan.max_requests_per_day || 0,
    max_requests_per_minute: plan.max_requests_per_minute || 0,
    features: [...(plan.features || [])],
    is_active: plan.is_active !== undefined ? plan.is_active : true,
    is_popular: plan.is_popular || false,
  }

  // Scroll al formulario
  setTimeout(() => {
    document.querySelector('.formulario-section')?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

function cancelarEdicion() {
  modoEdicion.value = false
  planEditando.value = null
  resetForm()
}

function confirmarEliminarPlan(planId) {
  $q.dialog({
    title: 'Eliminar Plan',
    message: '¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.',
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
    loading.value = true
    await pagosStore.eliminarPlan(props.apiId, planId)

    $q.notify({
      type: 'positive',
      message: 'Plan eliminado exitosamente',
      icon: 'check_circle',
    })

    await cargarPlanesExistentes()
  } catch (error) {
    console.error('Error al eliminar plan:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el plan',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  loading.value = true

  try {
    // Limpiar features vacías
    formData.value.features = formData.value.features.filter((f) => f.trim() !== '')

    // Convertir 0 a null para "ilimitado"
    const planData = {
      ...formData.value,
      max_requests_per_month: formData.value.max_requests_per_month || null,
      max_requests_per_day: formData.value.max_requests_per_day || null,
      max_requests_per_minute: formData.value.max_requests_per_minute || null,
    }

    // Usar el store para gestionar el plan
    await pagosStore.gestionarPlan(
      props.apiId,
      planData,
      modoEdicion.value ? planEditando.value : null,
    )

    $q.notify({
      type: 'positive',
      message: modoEdicion.value ? 'Plan actualizado exitosamente' : 'Plan creado exitosamente',
      icon: 'check_circle',
    })

    // Recargar planes
    await cargarPlanesExistentes()

    emit('success')

    if (modoEdicion.value) {
      cancelarEdicion()
    } else {
      resetForm()
    }
  } catch (error) {
    console.error('Error al guardar plan:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.ejecucion?.respuesta?.mensaje || 'Error al guardar el plan',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

function onCancel() {
  emit('cancel')
  resetForm()
}

function resetForm() {
  formData.value = {
    name: '',
    description: '',
    price: 0,
    billing_cycle: 'monthly',
    max_requests_per_month: 0,
    max_requests_per_day: 0,
    max_requests_per_minute: 0,
    features: [],
    is_active: true,
    is_popular: false,
  }
}

defineExpose({
  resetForm,
})
</script>

<style lang="scss" scoped>
.planes-manager-container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

// Preview Section
.planes-preview-section {
  padding: 24px;
  background: rgba(0, 168, 168, 0.03);
  border: 1px solid rgba(0, 168, 168, 0.1);
  border-radius: 12px;
}

.plan-preview-card {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
  overflow: hidden;

  &:hover {
    border-color: #00a8a8;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 168, 168, 0.15);
  }

  &.plan-popular {
    border-color: #00a8a8;

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

  &.plan-inactive {
    opacity: 0.6;
    border-color: #666;
  }
}

.plan-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
}

.popular-badge,
.inactive-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  z-index: 1;
}

.popular-badge {
  background: linear-gradient(135deg, #00a8a8, #00d4d4);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 168, 168, 0.3);
}

.inactive-badge {
  background: #666;
  color: white;
}

.plan-name {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.plan-price-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  min-height: 60px;
}

.plan-price-free {
  font-size: 36px;
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
  font-size: 20px;
  font-weight: 600;
  color: #00a8a8;
  margin-right: 4px;
}

.plan-price-amount {
  font-size: 38px;
  font-weight: 700;
  color: #ffffff;
}

.plan-price-period {
  font-size: 14px;
  color: #b0b0b0;
  margin-top: 6px;
  display: block;
}

.plan-description {
  color: #b0b0b0;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  min-height: 40px;
}

.features-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #2a2a2a, transparent);
  margin-bottom: 16px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #e0e0e0;
  font-size: 13px;
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

.plan-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #2a2a2a;
}

// Form Section
.formulario-section {
  scroll-margin-top: 20px;
}

.planes-form-card {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
}

.limits-section,
.features-section {
  background: rgba(0, 168, 168, 0.03);
  border: 1px solid rgba(0, 168, 168, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.features-list {
  display: flex;
  flex-direction: column;
}

.no-features {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

// Animations
.planes-manager-container {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 768px) {
  .planes-preview-section {
    padding: 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .plan-content {
    padding: 20px;
  }

  .plan-name {
    font-size: 18px;
  }

  .plan-price-amount {
    font-size: 32px;
  }
}
</style>
