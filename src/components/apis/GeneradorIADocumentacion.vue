<template>
  <div>
    <!-- ─── Trigger button (se usa dentro de FormularioApiDocumentation) ── -->
    <q-btn
      v-bind="$attrs"
      unelevated
      rounded
      no-caps
      color="primary"
      icon="auto_awesome"
      label="Generar con IA"
      :loading="generando"
      @click="abrirDialog"
    >
      <q-tooltip class="bg-dark text-white">
        CoreAPI IA analiza tu API y genera la documentación completa automáticamente
      </q-tooltip>
    </q-btn>

    <!-- ─── Dialog principal ──────────────────────────────────────────────── -->
    <q-dialog
      v-model="dialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-bgpage text-white" style="border-radius: 0">
        <!-- Header del dialog -->
        <q-bar class="bg-dark q-py-md" style="height: auto">
          <div class="row items-center q-gutter-sm col">
            <q-icon name="auto_awesome" color="primary" size="sm" />
            <span class="text-subtitle1 text-weight-bold"
              >CoreAPI IA — Generador de documentación</span
            >
            <q-badge color="primary" label="Beta" class="q-ml-sm" />
          </div>
          <q-btn flat round dense icon="close" color="grey-4" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-lg" style="max-width: 800px; margin: 0 auto">
          <!-- ── Paso 1: Input ──────────────────────────────────────────── -->
          <div v-if="paso === 1">
            <div class="text-h6 text-white q-mb-xs">Describe tu API</div>
            <div class="text-grey-5 text-caption q-mb-lg">
              La IA analizará tu API y generará automáticamente los endpoints con sus parámetros,
              body, respuestas y descripciones.
            </div>

            <div class="row q-col-gutter-md">
              <!-- URL base -->
              <div class="col-12">
                <q-input
                  v-model="form.baseUrl"
                  label="URL base de tu API *"
                  outlined
                  dark
                  dense
                  color="primary"
                  bg-color="dark"
                  placeholder="https://api.miservicio.com/v1"
                  :rules="[(v) => !!v || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="link" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Nombre -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.nombre"
                  label="Nombre de la API *"
                  outlined
                  dark
                  dense
                  color="primary"
                  bg-color="dark"
                  placeholder="Ej: Weather Service, Payment API..."
                  :rules="[(v) => !!v || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="api" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Tipo -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.tipo"
                  :options="tiposApi"
                  label="Tipo de API"
                  outlined
                  dark
                  dense
                  color="primary"
                  bg-color="dark"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="category" color="primary" />
                  </template>
                </q-select>
              </div>

              <!-- Descripción -->
              <div class="col-12">
                <q-input
                  v-model="form.descripcion"
                  label="Descripción de qué hace la API *"
                  outlined
                  dark
                  dense
                  autogrow
                  color="primary"
                  bg-color="dark"
                  type="textarea"
                  placeholder="Ej: API REST para consultar datos meteorológicos en tiempo real. Permite obtener clima actual, pronósticos a 7 días y calidad del aire por ciudad o coordenadas."
                  :rules="[
                    (v) => !!v || 'Requerido',
                    (v) => v.length >= 20 || 'Mínimo 20 caracteres',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Endpoints conocidos (opcional) -->
              <div class="col-12">
                <q-input
                  v-model="form.endpointsConocidos"
                  label="Endpoints que conoces (opcional)"
                  outlined
                  dark
                  dense
                  autogrow
                  color="primary"
                  bg-color="dark"
                  type="textarea"
                  placeholder="GET /weather, POST /alerts, GET /forecast/{city}..."
                  hint="Si ya conoces algunos endpoints, la IA los documentará con más precisión"
                >
                  <template v-slot:prepend>
                    <q-icon name="route" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Auth type -->
              <div class="col-12">
                <div class="text-caption text-grey-5 q-mb-sm">
                  Tipo de autenticación del proveedor
                </div>
                <q-btn-toggle
                  v-model="form.authType"
                  spread
                  no-caps
                  toggle-color="primary"
                  color="dark"
                  text-color="grey-4"
                  :options="[
                    { label: 'Sin auth', value: 'none' },
                    { label: 'API Key', value: 'api_key' },
                    { label: 'Bearer', value: 'bearer' },
                    { label: 'OAuth2', value: 'oauth2' },
                  ]"
                />
              </div>
            </div>

            <!-- Botón generar -->
            <div class="row justify-end q-mt-xl q-gutter-sm">
              <q-btn flat no-caps label="Cancelar" color="grey-4" v-close-popup />
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                icon="auto_awesome"
                label="Generar documentación"
                size="md"
                :disable="!form.baseUrl || !form.nombre || !form.descripcion"
                :loading="generando"
                @click="generarDocumentacion"
              />
            </div>
          </div>

          <!-- ── Paso 2: Generando ──────────────────────────────────────── -->
          <div v-else-if="paso === 2" class="text-center q-py-xl">
            <q-spinner-dots color="primary" size="60px" class="q-mb-lg" />
            <div class="text-h6 text-white q-mb-sm">Analizando tu API...</div>
            <div class="text-grey-5 q-mb-xl">{{ mensajeProgreso }}</div>
            <div class="progreso-steps">
              <div
                v-for="(step, i) in pasosProceso"
                :key="i"
                class="progreso-step"
                :class="{
                  'step-done': i < pasoActual,
                  'step-active': i === pasoActual,
                  'step-pending': i > pasoActual,
                }"
              >
                <q-icon
                  :name="
                    i < pasoActual
                      ? 'check_circle'
                      : i === pasoActual
                        ? 'radio_button_checked'
                        : 'radio_button_unchecked'
                  "
                  :color="i < pasoActual ? 'positive' : i === pasoActual ? 'primary' : 'grey-7'"
                  size="sm"
                  class="q-mr-sm"
                />
                <span>{{ step }}</span>
              </div>
            </div>
          </div>

          <!-- ── Paso 3: Resultado ──────────────────────────────────────── -->
          <div v-else-if="paso === 3">
            <div class="row items-center q-mb-lg">
              <q-icon name="check_circle" color="positive" size="md" class="q-mr-sm" />
              <div>
                <div class="text-h6 text-white">Documentación generada</div>
                <div class="text-caption text-grey-5">
                  Se encontraron {{ endpointsGenerados.length }} endpoints. Revísalos y edítalos si
                  es necesario antes de guardar.
                </div>
              </div>
              <q-space />
              <q-btn
                flat
                no-caps
                icon="refresh"
                color="primary"
                label="Regenerar"
                @click="paso = 1"
                size="sm"
              />
            </div>

            <!-- Preview de endpoints generados -->
            <div class="endpoints-preview q-mb-lg">
              <q-expansion-item
                v-for="(ep, i) in endpointsGenerados"
                :key="i"
                :label="`${ep.method} ${ep.path}`"
                :caption="ep.description"
                :header-class="`method-header method-${ep.method?.toLowerCase()}`"
                expand-icon-class="text-grey-4"
                class="endpoint-preview-item q-mb-xs"
                dense
              >
                <div class="q-pa-md bg-black rounded-borders">
                  <!-- Params -->
                  <div v-if="ep.parameters?.length" class="q-mb-sm">
                    <div class="text-caption text-primary q-mb-xs" style="letter-spacing: 2px">
                      PARÁMETROS
                    </div>
                    <div v-for="p in ep.parameters" :key="p.name" class="row q-gutter-xs q-mb-xs">
                      <q-badge :color="p.required ? 'primary' : 'grey-7'" :label="p.name" />
                      <span class="text-caption text-grey-5"
                        >{{ p.type }} — {{ p.description }}</span
                      >
                      <q-badge
                        v-if="p.example"
                        outline
                        color="grey-6"
                        :label="`ej: ${p.example}`"
                      />
                    </div>
                  </div>
                  <!-- Body -->
                  <div v-if="ep.bodies?.length" class="q-mb-sm">
                    <div class="text-caption text-primary q-mb-xs" style="letter-spacing: 2px">
                      REQUEST BODY
                    </div>
                    <pre class="ejemplo-code">{{
                      JSON.stringify(ep.bodies[0]?.example, null, 2)
                    }}</pre>
                  </div>
                  <!-- Responses -->
                  <div v-if="ep.responses?.length">
                    <div class="text-caption text-primary q-mb-xs" style="letter-spacing: 2px">
                      RESPUESTAS
                    </div>
                    <div
                      v-for="r in ep.responses"
                      :key="r.status_code"
                      class="row items-center q-gutter-xs q-mb-xs"
                    >
                      <q-badge
                        :color="r.status_code < 400 ? 'positive' : 'negative'"
                        :label="String(r.status_code)"
                      />
                      <span class="text-caption text-grey-5">{{ r.description }}</span>
                    </div>
                  </div>
                </div>
              </q-expansion-item>
            </div>

            <!-- Acciones -->
            <div class="row justify-end q-gutter-sm">
              <q-btn flat no-caps label="Descartar" color="grey-4" @click="paso = 1" />
              <q-btn
                unelevated
                rounded
                no-caps
                color="primary"
                icon="check"
                label="Usar esta documentación"
                @click="confirmarYCerrar"
              />
            </div>
          </div>

          <!-- ── Paso 4: Error ──────────────────────────────────────────── -->
          <div v-else-if="paso === 4" class="text-center q-py-xl">
            <q-icon name="error_outline" color="negative" size="60px" class="q-mb-lg" />
            <div class="text-h6 text-white q-mb-sm">No se pudo generar la documentación</div>
            <div class="text-grey-5 q-mb-xl">{{ errorMsg }}</div>
            <q-btn
              unelevated
              rounded
              no-caps
              color="primary"
              label="Intentar de nuevo"
              @click="paso = 1"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { axiosInstance } from 'boot/axios.js'

const emit = defineEmits(['endpoints-generados'])

// ─── State ────────────────────────────────────────────────────────────────
const dialog = ref(false)
const paso = ref(1)
const generando = ref(false)
const pasoActual = ref(0)
const mensajeProgreso = ref('')
const endpointsGenerados = ref([])
const errorMsg = ref('')

const form = reactive({
  baseUrl: '',
  nombre: '',
  tipo: 'REST',
  descripcion: '',
  endpointsConocidos: '',
  authType: 'api_key',
})

const tiposApi = [
  { label: 'REST', value: 'REST' },
  { label: 'GraphQL', value: 'GraphQL' },
  { label: 'SOAP', value: 'SOAP' },
  { label: 'WebSocket', value: 'WebSocket' },
]

const pasosProceso = [
  'Analizando el tipo y dominio de la API',
  'Identificando endpoints y rutas',
  'Generando parámetros y ejemplos',
  'Creando esquemas de request body',
  'Definiendo respuestas y códigos HTTP',
]

// ─── Métodos ──────────────────────────────────────────────────────────────
function abrirDialog() {
  paso.value = 1
  dialog.value = true
}

async function generarDocumentacion() {
  generando.value = true
  paso.value = 2
  pasoActual.value = 0

  // Animación de progreso
  const intervalo = setInterval(() => {
    if (pasoActual.value < pasosProceso.length - 1) {
      pasoActual.value++
      mensajeProgreso.value = pasosProceso[pasoActual.value]
    }
  }, 1800)

  try {
    // Llamar al back (evita el bloqueo CORS de Anthropic)
    const response = await axiosInstance.post('/catalogo/generar-documentacion-ia', {
      nombre: form.nombre,
      tipo: form.tipo,
      baseUrl: form.baseUrl,
      descripcion: form.descripcion,
      endpointsConocidos: form.endpointsConocidos || undefined,
      authType: form.authType,
    })

    clearInterval(intervalo)

    const ejec = response.data?.ejecucion
    if (ejec?.respuesta?.estado !== 'OK') {
      throw new Error(ejec?.respuesta?.mensaje || 'Error al generar documentación')
    }

    const parsed = ejec.data
    endpointsGenerados.value = parsed.endpoints ?? []

    if (endpointsGenerados.value.length === 0) {
      throw new Error('La IA no generó endpoints. Intenta con una descripción más detallada.')
    }

    pasoActual.value = pasosProceso.length - 1
    await new Promise((r) => setTimeout(r, 500))
    paso.value = 3
  } catch (error) {
    clearInterval(intervalo)
    console.error('Error generando documentación:', error)
    errorMsg.value = (
      error.response?.data?.ejecucion?.respuesta?.mensaje ||
      error.message ||
      'Error al comunicarse con la IA.'
    ).toString()
    paso.value = 4
  } finally {
    generando.value = false
  }
}

function confirmarYCerrar() {
  emit('endpoints-generados', {
    endpoints: endpointsGenerados.value,
    metadata: {
      nombre: form.nombre,
      tipo: form.tipo,
      descripcion: form.descripcion,
      authType: form.authType,
    },
  })
  dialog.value = false
  // Reset para próxima vez
  paso.value = 1
  endpointsGenerados.value = []
}
</script>

<style lang="scss" scoped>
.progreso-steps {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.progreso-step {
  display: flex;
  align-items: center;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step-done {
  color: #10b981;
}
.step-active {
  color: #00a8a8;
  font-weight: 600;
}
.step-pending {
  color: #475569;
}

.endpoint-preview-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
}

.method-header {
  border-left: 3px solid;
}
.method-get {
  border-color: #10b981;
}
.method-post {
  border-color: #3b82f6;
}
.method-put {
  border-color: #f59e0b;
}
.method-patch {
  border-color: #8b5cf6;
}
.method-delete {
  border-color: #ef4444;
}

.ejemplo-code {
  font-family: 'Consolas', 'Roboto Mono', monospace;
  font-size: 11px;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  padding: 8px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
