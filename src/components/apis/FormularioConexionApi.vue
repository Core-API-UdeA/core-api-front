<template>
  <div class="conexion-container">
    <q-card flat class="conexion-card">
      <q-card-section class="q-pb-none">
        <div class="text-h5 text-white text-weight-medium q-mb-xs">Conexión con tu API</div>
        <div class="text-caption text-grey-5 q-mb-md">
          Configura cómo CoreAPI se conectará a tu servicio. Las credenciales se cifran con AES-256
          antes de guardarse.
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-col-gutter-md row">
          <!-- Base URL -->
          <div class="col-md-8 col-sm-12 col-xs-12">
            <q-input
              v-model="formData.baseUrl"
              label="Base URL / Host *"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              placeholder="https://example.com"
              :rules="[
                (val) => !!val || 'La URL base es requerida',
                (val) =>
                  /^https?:\/\/.+/.test(val) || 'Debe ser una URL válida (http:// o https://)',
              ]"
              maxlength="500"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="link" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Método del health check -->
          <div class="col-md-4 col-sm-12 col-xs-12">
            <q-select
              v-model="formData.healthCheckMethod"
              label="Método"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              :options="metodosHttp"
              emit-value
              map-options
              class="custom-select"
            >
              <template v-slot:prepend>
                <q-icon name="swap_horiz" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Auth Type -->
          <div class="col-md-4 col-sm-12 col-xs-12">
            <q-select
              v-model="formData.authType"
              label="Autenticación tipo"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              :options="tiposAuth"
              emit-value
              map-options
              class="custom-select"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Token / API Key -->
          <div class="col-md-8 col-sm-12 col-xs-12">
            <q-input
              v-model="formData.credential"
              :label="labelCredencial"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              :type="mostrarCredencial ? 'text' : 'password'"
              :placeholder="placeholderCredencial"
              :disable="formData.authType === 'none'"
              :rules="reglasCredencial"
              maxlength="2000"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="key" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="mostrarCredencial ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-5"
                  @click="mostrarCredencial = !mostrarCredencial"
                />
              </template>
            </q-input>
          </div>

          <!-- Nombre del header (solo para api_key) -->
          <div v-if="formData.authType === 'api_key'" class="col-md-6 col-sm-12 col-xs-12">
            <q-input
              v-model="formData.apiKeyHeaderName"
              label="Nombre del header"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              placeholder="X-Api-Key"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="label" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Endpoint de prueba -->
          <div
            :class="
              formData.authType === 'api_key'
                ? 'col-md-6 col-sm-12 col-xs-12'
                : 'col-md-12 col-sm-12 col-xs-12'
            "
          >
            <q-input
              v-model="formData.healthCheckEndpoint"
              label="Endpoint de prueba"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              placeholder="/monitoreo"
              maxlength="300"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="route" color="primary" />
              </template>
              <template v-slot:hint>
                Ruta relativa que CoreAPI usará para verificar que tu servicio está activo.
              </template>
            </q-input>
          </div>

          <!-- Sección Headers adicionales -->
          <div class="col-12">
            <div class="headers-section">
              <div class="section-header">
                <span class="section-title">Headers adicionales</span>
                <q-btn
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon="add"
                  label="Agregar"
                  size="sm"
                  @click="agregarHeader"
                />
              </div>

              <div
                v-for="(header, index) in headersAdicionales"
                :key="index"
                class="row q-col-gutter-sm q-mb-sm items-center"
              >
                <div class="col-md-4 col-sm-4 col-xs-4">
                  <q-input
                    v-model="header.nombre"
                    label="Nombre"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    placeholder="x-header"
                    class="custom-input"
                  />
                </div>
                <div class="col-md-3 col-sm-3 col-xs-3">
                  <q-select
                    v-model="header.tipo"
                    label="Tipo"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    :options="['String', 'Number', 'Boolean']"
                    class="custom-select"
                  />
                </div>
                <div class="col-md-4 col-sm-4 col-xs-4">
                  <q-input
                    v-model="header.descripcion"
                    label="Descripción"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    placeholder="lorem ipsum..."
                    class="custom-input"
                  />
                </div>
                <div class="col-md-1 col-sm-1 col-xs-1 flex items-center">
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="eliminarHeader(index)"
                  />
                </div>
              </div>

              <div v-if="headersAdicionales.length === 0" class="text-caption text-grey-6 q-mt-xs">
                Sin headers adicionales configurados.
              </div>
            </div>
          </div>

          <!-- Resultado del Test -->
          <div v-if="resultadoTest" class="col-12">
            <q-banner
              :class="resultadoTest.ok ? 'bg-positive' : 'bg-negative'"
              class="text-white rounded-borders resultado-banner"
              dense
            >
              <template v-slot:avatar>
                <q-icon :name="resultadoTest.ok ? 'check_circle' : 'error'" />
              </template>
              <div class="text-weight-medium">
                {{ resultadoTest.ok ? 'Conexión exitosa' : 'Conexión fallida' }}
              </div>
              <div class="text-caption q-mt-xs">
                <span v-if="resultadoTest.statusCode"> HTTP {{ resultadoTest.statusCode }} · </span>
                <span v-if="resultadoTest.latencyMs"> {{ resultadoTest.latencyMs }}ms </span>
                <span v-if="resultadoTest.error"> · {{ resultadoTest.error }} </span>
              </div>
            </q-banner>
          </div>

          <!-- Botones -->
          <div class="col-12">
            <div class="row justify-between items-center q-mt-sm action-buttons">
              <div class="row q-gutter-sm">
                <q-btn
                  label="Cancelar"
                  flat
                  color="grey-5"
                  no-caps
                  @click="onCancel"
                  :disable="loading"
                  class="cancel-btn"
                />
                <q-btn
                  v-if="!modoEdicion"
                  label="Omitir este paso"
                  flat
                  color="grey-5"
                  no-caps
                  @click="onSkip"
                  :disable="loading"
                >
                  <q-tooltip class="bg-grey-8">
                    Puedes configurar la conexión más tarde desde el detalle de la API.
                  </q-tooltip>
                </q-btn>
              </div>

              <div class="row q-gutter-sm">
                <q-btn
                  label="Test connection"
                  color="primary"
                  outline
                  no-caps
                  icon="wifi_tethering"
                  :loading="loadingTest"
                  :disable="!formData.baseUrl || loading"
                  @click="onTestConnection"
                >
                  <template v-slot:loading>
                    <q-spinner-dots />
                  </template>
                </q-btn>

                <q-btn
                  :label="modoEdicion ? 'Actualizar conexión' : 'Guardar conexión'"
                  type="submit"
                  color="primary"
                  no-caps
                  icon-right="arrow_forward"
                  :loading="loading"
                  :disable="loading || loadingTest"
                >
                  <template v-slot:loading>
                    <q-spinner-dots />
                  </template>
                </q-btn>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useGatewayStore } from 'stores/gateway-store.js'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
  datosIniciales: {
    type: Object,
    default: null,
  },
  modoEdicion: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['success', 'cancel', 'skip'])

const $q = useQuasar()
const gatewayStore = useGatewayStore()

const loading = ref(false)
const loadingTest = ref(false)
const mostrarCredencial = ref(false)
const resultadoTest = ref(null)
const headersAdicionales = ref([])

const formData = ref({
  baseUrl: '',
  authType: 'bearer',
  credential: '',
  apiKeyHeaderName: 'X-Api-Key',
  healthCheckEndpoint: '/',
  healthCheckMethod: 'GET',
})

function aplicarDatosIniciales(datos) {
  if (!datos) return
  formData.value = {
    baseUrl: datos.base_url || '',
    authType: datos.auth_type || 'bearer',
    credential: '',
    apiKeyHeaderName: datos.api_key_header_name || 'X-Api-Key',
    healthCheckEndpoint: datos.health_check_endpoint || '/',
    healthCheckMethod: datos.health_check_method || 'GET',
  }
}

onMounted(() => {
  aplicarDatosIniciales(props.datosIniciales)
})

watch(
  () => props.datosIniciales,
  (nuevos) => {
    aplicarDatosIniciales(nuevos)
  },
)

// ─── Opciones ─────────────────────────────────────────────────────────────────

const tiposAuth = [
  { label: 'Bearer Token', value: 'bearer' },
  { label: 'API Key', value: 'api_key' },
  { label: 'OAuth2', value: 'oauth2' },
  { label: 'Sin auth', value: 'none' },
]

const metodosHttp = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'HEAD', value: 'HEAD' },
]

// ─── Computed ─────────────────────────────────────────────────────────────────

const labelCredencial = computed(() => {
  const labels = {
    bearer: 'Token / Bearer Token *',
    api_key: 'API Key *',
    oauth2: 'Access Token *',
    none: 'Sin credencial',
  }
  return labels[formData.value.authType] || 'Token / APIKey *'
})

const placeholderCredencial = computed(() => {
  if (formData.value.authType === 'none') return '—'
  return 'eyjey567...'
})

const reglasCredencial = computed(() => {
  if (formData.value.authType === 'none') return []
  return [(val) => !!val || 'La credencial es requerida cuando el tipo de auth no es "Sin auth"']
})

// ─── Métodos ──────────────────────────────────────────────────────────────────

function agregarHeader() {
  headersAdicionales.value.push({ nombre: '', tipo: 'String', descripcion: '' })
}

function eliminarHeader(index) {
  headersAdicionales.value.splice(index, 1)
}

async function onTestConnection() {
  if (!formData.value.baseUrl) return

  loadingTest.value = true
  resultadoTest.value = null

  try {
    const resultado = await gatewayStore.verificarConexion({
      baseUrl: formData.value.baseUrl,
      authType: formData.value.authType,
      credential: formData.value.credential || null,
      apiKeyHeaderName: formData.value.apiKeyHeaderName,
      healthCheckEndpoint: formData.value.healthCheckEndpoint,
      healthCheckMethod: formData.value.healthCheckMethod,
    })

    resultadoTest.value = resultado

    $q.notify({
      type: resultado.ok ? 'positive' : 'warning',
      message: resultado.ok
        ? `Conexión exitosa · HTTP ${resultado.statusCode} · ${resultado.latencyMs}ms`
        : `Conexión fallida · ${resultado.error || `HTTP ${resultado.statusCode}`}`,
      icon: resultado.ok ? 'check_circle' : 'warning',
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al verificar la conexión.',
      icon: 'error',
      position: 'top',
    })
  } finally {
    loadingTest.value = false
  }
}

async function onSubmit() {
  loading.value = true

  try {
    const resultado = await gatewayStore.registrarConexion(props.apiId, {
      baseUrl: formData.value.baseUrl,
      authType: formData.value.authType,
      credential: formData.value.credential || null,
      apiKeyHeaderName: formData.value.apiKeyHeaderName,
      healthCheckEndpoint: formData.value.healthCheckEndpoint,
      healthCheckMethod: formData.value.healthCheckMethod,
    })

    const estaActiva = resultado.status === 'active'

    $q.notify({
      type: estaActiva ? 'positive' : 'warning',
      message: estaActiva
        ? 'Conexión guardada y verificada correctamente. Tu API está activa en el gateway.'
        : 'Conexión guardada pero la verificación falló. Revisa la URL y las credenciales.',
      icon: estaActiva ? 'celebration' : 'warning',
      position: 'top',
      timeout: 4000,
    })

    emit('success', resultado)
    resetForm()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al guardar la conexión. Intenta nuevamente.',
      icon: 'error',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function onCancel() {
  emit('cancel')
  resetForm()
}

function onSkip() {
  emit('skip')
}

function resetForm() {
  formData.value = {
    baseUrl: '',
    authType: 'bearer',
    credential: '',
    apiKeyHeaderName: 'X-Api-Key',
    healthCheckEndpoint: '/',
    healthCheckMethod: 'GET',
  }
  headersAdicionales.value = []
  resultadoTest.value = null
  mostrarCredencial.value = false
}

defineExpose({ resetForm })
</script>

<style lang="scss" scoped>
.conexion-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.conexion-card {
  background: linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 100%);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  animation: fadeInUp 0.4s ease-out;

  &:hover {
    border-color: rgba(0, 168, 168, 0.4);
    box-shadow: 0 12px 48px rgba(0, 168, 168, 0.1);
  }
}

.custom-input,
.custom-select {
  :deep(.q-field__control) {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.4);
    }
  }

  :deep(.q-field__control:before) {
    border-color: rgba(0, 168, 168, 0.3);
  }

  :deep(.q-field__control:hover:before) {
    border-color: rgba(0, 168, 168, 0.5);
  }

  :deep(.q-field__control:after) {
    border-color: #00a8a8;
  }

  :deep(.q-field__control:focus-within) {
    box-shadow: 0 0 0 2px rgba(0, 168, 168, 0.2);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.headers-section {
  background: rgba(0, 168, 168, 0.03);
  border: 1px solid rgba(0, 168, 168, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 168, 168, 0.05);
    border-color: rgba(0, 168, 168, 0.2);
  }
}

.resultado-banner {
  border-radius: 8px;
  opacity: 0.9;
}

.action-buttons {
  padding-top: 16px;
  border-top: 1px solid rgba(0, 168, 168, 0.1);
}

.cancel-btn {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
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

@media (max-width: 768px) {
  .conexion-container {
    padding: 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;

    .row {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
