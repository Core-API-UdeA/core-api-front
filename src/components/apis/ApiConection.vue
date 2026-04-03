<template>
  <div class="conection-container">
    <div class="row q-col-gutter-md">
      <!-- Panel izquierdo: selector de endpoints -->
      <div class="col-md-3 col-xs-12">
        <div class="endpoints-panel">
          <div class="panel-title q-mb-md">
            <q-icon name="api" color="primary" size="xs" class="q-mr-xs" />
            <span>Endpoints</span>
          </div>

          <div v-if="documentation.length > 0" class="endpoints-list">
            <div
              v-for="ep in documentation"
              :key="ep.id"
              class="endpoint-item"
              :class="{ active: endpointSeleccionado?.id === ep.id }"
              @click="seleccionarEndpoint(ep)"
            >
              <q-badge :color="colorMetodo(ep.method)" class="method-badge q-mr-sm">
                {{ ep.method }}
              </q-badge>
              <span class="endpoint-path">{{ ep.path }}</span>
            </div>
          </div>

          <div v-else class="text-grey-6 text-caption q-pa-sm">Sin endpoints documentados.</div>
        </div>
      </div>

      <!-- Panel derecho: configuración y prueba -->
      <div class="col-md-9 col-xs-12">
        <div v-if="endpointSeleccionado" class="tester-panel">
          <!-- Banner de flujo de auth si el endpoint lo requiere -->
          <q-banner
            v-if="endpointSeleccionado.auth_notes || endpointSeleccionado.requires_token_from"
            class="q-mb-md auth-flow-banner"
            dense
          >
            <template v-slot:avatar>
              <q-icon name="info" color="primary" />
            </template>
            <div
              v-if="endpointSeleccionado.is_auth_endpoint"
              class="text-positive text-caption text-weight-medium q-mb-xs"
            >
              Este endpoint genera un token — úsalo en llamadas posteriores.
            </div>
            <div
              v-if="endpointSeleccionado.requires_token_from"
              class="text-warning text-caption q-mb-xs"
            >
              Requiere token del endpoint:
              <code>{{ endpointSeleccionado.requires_token_from }}</code>
            </div>
            <div
              v-if="endpointSeleccionado.auth_notes"
              class="text-grey-4 text-caption"
              style="white-space: pre-wrap"
            >
              {{ endpointSeleccionado.auth_notes }}
            </div>
          </q-banner>

          <!-- URL del endpoint -->
          <div class="url-bar row items-center q-mb-lg q-col-gutter-sm">
            <div class="col-auto">
              <q-badge :color="colorMetodo(endpointSeleccionado.method)" class="method-badge-lg">
                {{ endpointSeleccionado.method }}
              </q-badge>
            </div>
            <div class="col">
              <div class="url-display">
                <span class="url-base text-grey-5">{{ gatewayBaseUrl }}/gateway/{{ apiSlug }}</span>
                <span class="url-path text-white">{{ endpointSeleccionado.path }}</span>
              </div>
            </div>
            <div class="col-auto row q-gutter-sm">
              <q-btn
                label="Test Endpoint"
                color="primary"
                no-caps
                icon="play_arrow"
                :loading="ejecutando"
                :disable="!tieneJwt"
                @click="ejecutarEndpoint"
              >
                <template v-slot:loading><q-spinner-dots /></template>
                <q-tooltip v-if="!tieneJwt" class="bg-negative">
                  Inicia sesión para probar endpoints
                </q-tooltip>
              </q-btn>
              <q-btn
                label="Get CURL"
                color="primary"
                outline
                no-caps
                icon="terminal"
                @click="descargarCurl"
              >
                <q-tooltip class="bg-grey-8">Copiar comando CURL al portapapeles</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Tabs: Response / Params / Headers -->
          <q-tabs
            v-model="tabActivo"
            dense
            dark
            no-caps
            align="left"
            class="tester-tabs q-mb-md"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="response" label="Response" />
            <q-tab name="params" label="Params" />
            <q-tab name="headers" label="Headers" />
          </q-tabs>

          <!-- Tab: Response -->
          <div v-show="tabActivo === 'response'" class="tab-content">
            <div v-if="respuesta" class="response-area">
              <!-- Status bar -->
              <div class="response-status-bar q-mb-sm row items-center q-gutter-sm">
                <q-badge :color="colorStatus(respuesta.status)" class="status-badge">
                  {{ respuesta.status }}
                </q-badge>
                <span class="text-grey-5 text-caption"> {{ respuesta.latencia }}ms </span>
                <q-space />
                <q-btn
                  flat
                  dense
                  no-caps
                  icon="content_copy"
                  label="Copiar"
                  color="grey-5"
                  size="sm"
                  @click="copiarRespuesta"
                />
              </div>
              <!-- Body -->
              <div class="code-block">
                <pre><code>{{ respuestaFormateada }}</code></pre>
              </div>
            </div>

            <div v-else class="response-empty">
              <q-icon name="send" size="36px" color="grey-7" />
              <p class="text-grey-6 q-mt-sm">
                Presiona <strong class="text-primary">Test Endpoint</strong> para ver la respuesta
              </p>
            </div>
          </div>

          <!-- Tab: Params (query params) -->
          <div v-show="tabActivo === 'params'" class="tab-content">
            <div class="params-header row items-center justify-between q-mb-sm">
              <span class="text-grey-4 text-caption">Query parameters</span>
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="add"
                label="Agregar"
                size="sm"
                @click="agregarParam"
              />
            </div>

            <div
              v-for="(param, i) in queryParams"
              :key="i"
              class="row q-col-gutter-sm q-mb-sm items-center"
            >
              <div class="col-5">
                <q-input
                  v-model="param.key"
                  placeholder="nombre"
                  outlined
                  dense
                  dark
                  color="primary"
                  bg-color="dark"
                  class="custom-input"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="param.value"
                  placeholder="valor"
                  outlined
                  dense
                  dark
                  color="primary"
                  bg-color="dark"
                  class="custom-input"
                />
              </div>
              <div class="col-1 flex items-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="queryParams.splice(i, 1)"
                />
              </div>
            </div>

            <div
              v-if="queryParams.length === 0"
              class="text-grey-6 text-caption q-pa-md text-center"
            >
              Sin parámetros. Haz clic en "Agregar" para añadir.
            </div>
          </div>

          <!-- Tab: Headers -->
          <div v-show="tabActivo === 'headers'" class="tab-content">
            <!-- Auth del consumidor -->
            <div class="auth-section q-mb-lg">
              <div class="section-label q-mb-sm">Autenticación del consumidor</div>
              <div class="row q-col-gutter-sm items-center">
                <div class="col-md-3 col-xs-12">
                  <q-select
                    v-model="authConsumidor.tipo"
                    :options="tiposAuth"
                    emit-value
                    map-options
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    class="custom-select"
                  />
                </div>
                <div class="col-md-9 col-xs-12">
                  <q-input
                    v-model="authConsumidor.token"
                    :label="
                      authConsumidor.tipo === 'none' ? 'Sin autenticación' : 'Token JWT de CoreAPI'
                    "
                    :disable="authConsumidor.tipo === 'none'"
                    :type="mostrarToken ? 'text' : 'password'"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    class="custom-input"
                    :hint="
                      authConsumidor.tipo !== 'none'
                        ? 'Token que obtienes al iniciar sesión en CoreAPI'
                        : ''
                    "
                  >
                    <template v-slot:append>
                      <q-icon
                        v-if="authConsumidor.tipo !== 'none'"
                        :name="mostrarToken ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        color="grey-5"
                        @click="mostrarToken = !mostrarToken"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Headers adicionales -->
            <div class="section-label q-mb-sm">
              Headers adicionales
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="add"
                label="Agregar"
                size="sm"
                class="q-ml-sm"
                @click="agregarHeader"
              />
            </div>

            <div
              v-for="(header, i) in headersAdicionales"
              :key="i"
              class="row q-col-gutter-sm q-mb-sm items-center"
            >
              <div class="col-5">
                <q-input
                  v-model="header.key"
                  placeholder="nombre del header"
                  outlined
                  dense
                  dark
                  color="primary"
                  bg-color="dark"
                  class="custom-input"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="header.value"
                  placeholder="valor"
                  outlined
                  dense
                  dark
                  color="primary"
                  bg-color="dark"
                  class="custom-input"
                />
              </div>
              <div class="col-1 flex items-center">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="headersAdicionales.splice(i, 1)"
                />
              </div>
            </div>

            <div
              v-if="headersAdicionales.length === 0"
              class="text-grey-6 text-caption q-pa-md text-center"
            >
              Sin headers adicionales.
            </div>
          </div>

          <!-- Footer: tiempo y código de la última respuesta -->
          <div v-if="respuesta" class="response-footer">
            Time {{ respuesta.latencia }} ms | Code
            <span :class="colorStatusText(respuesta.status)">{{ respuesta.status }}</span>
          </div>
        </div>

        <!-- Sin endpoint seleccionado -->
        <div v-else class="no-selection text-center q-pa-xl">
          <q-icon name="touch_app" size="48px" color="grey-7" />
          <p class="text-grey-5 q-mt-md">Selecciona un endpoint de la lista para probarlo</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'
import { useAuthStore } from 'stores/auth-store.js'
import { axiosInstance } from 'boot/axios.js'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
  apiSlug: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const apisStore = useApisStore()
const authStore = useAuthStore()

const apiDocumentation = ref(null)
const endpointSeleccionado = ref(null)
const tabActivo = ref('response')
const ejecutando = ref(false)
const respuesta = ref(null)
const mostrarToken = ref(false)

const queryParams = ref([])
const headersAdicionales = ref([])

const authConsumidor = ref({
  tipo: 'bearer',
  token: '',
})

const tiposAuth = [
  { label: 'Bearer Token', value: 'bearer' },
  { label: 'Sin auth', value: 'none' },
]

// ─── Computed ─────────────────────────────────────────────────────────────────

const documentation = computed(() => apiDocumentation.value?.documentation || [])

const gatewayBaseUrl = computed(() => {
  // Construir la base URL del gateway a partir del axiosInstance
  return (process.env.BASE_URL_API || 'http://localhost:1337') + (process.env.PREFIX || '/scapi')
})

const tieneJwt = computed(() => {
  return authConsumidor.value.tipo === 'none' || !!authConsumidor.value.token
})

const respuestaFormateada = computed(() => {
  if (!respuesta.value?.body) return ''
  try {
    return JSON.stringify(JSON.parse(respuesta.value.body), null, 2)
  } catch {
    return respuesta.value.body
  }
})

const urlCompleta = computed(() => {
  if (!endpointSeleccionado.value) return ''
  let url = `${gatewayBaseUrl.value}/gateway/${props.apiSlug}${endpointSeleccionado.value.path}`
  const paramsActivos = queryParams.value.filter((p) => p.key && p.value)
  if (paramsActivos.length > 0) {
    const qs = paramsActivos
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&')
    url += '?' + qs
  }
  return url
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    $q.loading.show()
    apiDocumentation.value = await apisStore.consultarApiDocumentation(props.apiId)

    if (documentation.value.length > 0) {
      seleccionarEndpoint(documentation.value[0])
    }
  } catch (error) {
    console.error('Error al cargar documentación:', error)
  } finally {
    $q.loading.hide()
  }

  // Pre-cargar el JWT del usuario si está logueado
  if (authStore.loggedIn && authStore.token) {
    authConsumidor.value.token = authStore.token
  }
})

// Actualizar token si el usuario inicia sesión mientras está en la vista
watch(
  () => authStore.token,
  (newToken) => {
    if (newToken) authConsumidor.value.token = newToken
  },
)

// ─── Métodos ──────────────────────────────────────────────────────────────────

function seleccionarEndpoint(ep) {
  endpointSeleccionado.value = ep
  respuesta.value = null
  tabActivo.value = 'response'

  // Pre-poblar query params documentados
  queryParams.value = (ep.parameters || [])
    .filter((p) => !p.location || p.location === 'query')
    .map((p) => ({ key: p.name, value: '' }))

  // Pre-poblar headers documentados con su valor de ejemplo
  headersAdicionales.value = (ep.headers || []).map((h) => ({
    key: h.name,
    value: h.example || '',
  }))

  // Si el endpoint tiene notas de auth, cambiar al tab de headers para que el usuario las vea
  if (ep.auth_notes || ep.requires_token_from) {
    tabActivo.value = 'headers'
  }
}

function agregarParam() {
  queryParams.value.push({ key: '', value: '' })
}

function agregarHeader() {
  headersAdicionales.value.push({ key: '', value: '' })
}

async function ejecutarEndpoint() {
  if (!endpointSeleccionado.value) return

  ejecutando.value = true
  respuesta.value = null
  tabActivo.value = 'response'

  const inicio = Date.now()

  try {
    // Construir headers
    const headers = {}

    if (authConsumidor.value.tipo === 'bearer' && authConsumidor.value.token) {
      headers['Authorization'] = `Bearer ${authConsumidor.value.token}`
    }

    // Headers adicionales activos
    headersAdicionales.value
      .filter((h) => h.key && h.value)
      .forEach((h) => {
        headers[h.key] = h.value
      })

    // Query params activos
    const params = {}
    queryParams.value
      .filter((p) => p.key && p.value)
      .forEach((p) => {
        params[p.key] = p.value
      })

    const method = endpointSeleccionado.value.method.toLowerCase()
    const url = `${gatewayBaseUrl.value}/gateway/${props.apiSlug}${endpointSeleccionado.value.path}`

    const config = { headers, params, validateStatus: () => true }

    const res = await axiosInstance[method](
      `/gateway/${props.apiSlug}${endpointSeleccionado.value.path}`,
      config,
    )

    const latencia = Date.now() - inicio

    respuesta.value = {
      status: res.status,
      latencia,
      body: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
    }
  } catch (error) {
    const latencia = Date.now() - inicio
    respuesta.value = {
      status: error.response?.status || 0,
      latencia,
      body: JSON.stringify({ error: error.message }),
    }
  } finally {
    ejecutando.value = false
  }
}

function descargarCurl() {
  if (!endpointSeleccionado.value) return

  const url = urlCompleta.value
  const method = endpointSeleccionado.value.method

  const headerLines = []

  if (authConsumidor.value.tipo === 'bearer' && authConsumidor.value.token) {
    headerLines.push(`  -H "Authorization: Bearer ${authConsumidor.value.token}"`)
  }

  headerLines.push(`  -H "Content-Type: application/json"`)

  headersAdicionales.value
    .filter((h) => h.key && h.value)
    .forEach((h) => headerLines.push(`  -H "${h.key}: ${h.value}"`))

  const curl = [
    `curl -X ${method} \\`,
    `  "${url}" \\`,
    ...headerLines.map((l, i) => (i < headerLines.length - 1 ? l + ' \\' : l)),
  ].join('\n')

  // Copiar al portapapeles
  navigator.clipboard
    .writeText(curl)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Comando CURL copiado al portapapeles',
        icon: 'terminal',
        position: 'top',
        timeout: 2000,
      })
    })
    .catch(() => {
      // Fallback: mostrar en dialog
      $q.dialog({
        title: 'Comando CURL',
        message: curl,
        dark: true,
        ok: { label: 'Cerrar', flat: true },
      })
    })
}

function copiarRespuesta() {
  if (!respuesta.value) return
  navigator.clipboard.writeText(respuestaFormateada.value).then(() => {
    $q.notify({ type: 'positive', message: 'Respuesta copiada', position: 'top', timeout: 1500 })
  })
}

// ─── Helpers de color ─────────────────────────────────────────────────────────

function colorMetodo(method) {
  return (
    { GET: 'positive', POST: 'primary', PUT: 'warning', PATCH: 'orange', DELETE: 'negative' }[
      method
    ] || 'grey'
  )
}

function colorStatus(status) {
  if (status >= 200 && status < 300) return 'positive'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'negative'
  return 'grey'
}

function colorStatusText(status) {
  if (status >= 200 && status < 300) return 'text-positive'
  if (status >= 400 && status < 500) return 'text-warning'
  if (status >= 500) return 'text-negative'
  return 'text-grey'
}
</script>

<style lang="scss" scoped>
.conection-container {
  padding: 20px 0;
  animation: fadeIn 0.3s ease-out;
}

// ─── Panel de endpoints ───────────────────────────────────────────────────────

.endpoints-panel {
  background: #0d0d0d;
  border: 1px solid rgba(0, 168, 168, 0.15);
  border-radius: 10px;
  padding: 16px;
  min-height: 400px;
}

.panel-title {
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
}

.endpoints-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.endpoint-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: rgba(0, 168, 168, 0.06);
    border-color: rgba(0, 168, 168, 0.2);
  }

  &.active {
    background: rgba(0, 168, 168, 0.1);
    border-color: rgba(0, 168, 168, 0.4);
  }
}

.method-badge {
  font-size: 10px;
  font-weight: 700;
  min-width: 46px;
  text-align: center;
  border-radius: 4px;
}

.endpoint-path {
  color: #ccc;
  font-size: 12px;
  font-family: 'Monaco', 'Courier New', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ─── Tester panel ─────────────────────────────────────────────────────────────

.tester-panel {
  background: #0d0d0d;
  border: 1px solid rgba(0, 168, 168, 0.15);
  border-radius: 10px;
  padding: 20px;
}

.url-bar {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
}

.method-badge-lg {
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  padding: 4px 10px;
}

.url-display {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.url-base {
  opacity: 0.5;
}
.url-path {
  font-weight: 600;
}

.tester-tabs {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

// ─── Tab content ──────────────────────────────────────────────────────────────

.tab-content {
  min-height: 260px;
}

.response-empty {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #555;
}

.response-status-bar {
  padding: 6px 0;
}

.status-badge {
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  padding: 3px 10px;
}

.code-block {
  background: #0a0a0a;
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
  max-height: 360px;

  pre {
    margin: 0;
    code {
      color: #00a8a8;
      font-size: 12px;
      font-family: 'Monaco', 'Courier New', monospace;
      line-height: 1.6;
    }
  }
}

.response-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: #555;
  text-align: right;
}

// ─── Auth section ─────────────────────────────────────────────────────────────

.auth-section {
  background: rgba(0, 168, 168, 0.03);
  border: 1px solid rgba(0, 168, 168, 0.1);
  border-radius: 8px;
  padding: 14px;
}

.section-label {
  color: #aaa;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.params-header {
  margin-bottom: 8px;
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

.custom-input,
.custom-select {
  :deep(.q-field__control) {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    transition: all 0.2s ease;

    &:before {
      border-color: rgba(0, 168, 168, 0.25);
    }
    &:hover:before {
      border-color: rgba(0, 168, 168, 0.5);
    }
    &:after {
      border-color: #00a8a8;
    }
  }
}

.no-selection {
  background: #0d0d0d;
  border: 1px dashed rgba(0, 168, 168, 0.15);
  border-radius: 10px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.auth-flow-banner {
  background: rgba(0, 168, 168, 0.06);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 8px;
  color: var(--q-color-grey-4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .endpoints-panel {
    min-height: auto;
  }
  .url-display {
    font-size: 11px;
  }
}
</style>
