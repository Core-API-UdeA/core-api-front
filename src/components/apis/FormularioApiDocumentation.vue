<template>
  <div class="endpoints-container">
    <q-card flat class="endpoints-card">
      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h5 text-white text-weight-medium">
            {{ modoEdicion ? 'Editar Endpoints' : 'Agregar Endpoints' }}
          </div>
          <q-chip color="primary" text-color="white" icon="info">
            {{ endpoints.length }} endpoint{{ endpoints.length !== 1 ? 's' : '' }}
          </q-chip>
        </div>

        <!-- Versión y Changelog -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-4">
            <q-input
              v-model="versionName"
              label="Versión *"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              placeholder="v1, 1.0.0, etc."
              :rules="[(val) => !!val || 'La versión es requerida']"
              :disable="modoEdicion"
            >
              <template v-slot:prepend>
                <q-icon name="tag" color="primary" />
              </template>
              <template v-if="modoEdicion" v-slot:append>
                <q-icon name="lock" color="grey-5">
                  <q-tooltip>No se puede cambiar la versión al editar</q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-8">
            <q-input
              v-model="changelog"
              label="Changelog"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              placeholder="Cambios en esta versión..."
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Botón agregar endpoint -->
        <q-btn
          color="primary"
          icon="add"
          label="Agregar Endpoint"
          no-caps
          outline
          class="q-mb-md"
          @click="agregarEndpoint"
        />
      </q-card-section>

      <q-card-section>
        <!-- Lista de endpoints -->
        <q-expansion-item
          v-for="(endpoint, index) in endpoints"
          :key="endpoint.tempId || index"
          :label="`${endpoint.method} ${endpoint.path || '/path'}`"
          :caption="endpoint.description || 'Sin descripción'"
          dark
          class="endpoint-item q-mb-sm"
          :header-class="`endpoint-header method-${endpoint.method.toLowerCase()}`"
          expand-icon-class="text-white"
          :default-opened="index === 0"
        >
          <template v-slot:header>
            <div class="row items-center full-width">
              <q-chip
                :color="getMethodColor(endpoint.method)"
                text-color="white"
                size="sm"
                class="method-chip"
              >
                {{ endpoint.method }}
              </q-chip>
              <span class="text-white q-ml-sm text-weight-medium">
                {{ endpoint.path || '/path' }}
              </span>
              <q-space />
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click.stop.prevent="eliminarEndpoint(index)"
              >
                <q-tooltip>Eliminar endpoint</q-tooltip>
              </q-btn>
            </div>
          </template>

          <q-card flat dark class="endpoint-details">
            <q-card-section>
              <!-- Path y Método -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-8">
                  <q-input
                    v-model="endpoint.path"
                    label="Path *"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    placeholder="/users, /users/:id"
                    :rules="[(val) => !!val || 'El path es requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="route" color="primary" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="endpoint.method"
                    label="Método *"
                    outlined
                    dense
                    dark
                    color="primary"
                    bg-color="dark"
                    :options="metodosHttp"
                    emit-value
                    map-options
                  >
                    <template v-slot:prepend>
                      <q-icon name="http" color="primary" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Descripción -->
              <q-input
                v-model="endpoint.description"
                label="Descripción"
                outlined
                dense
                dark
                color="primary"
                bg-color="dark"
                type="textarea"
                rows="2"
                class="q-mb-md"
              />

              <!-- Tabs para Parameters, Body, Responses -->
              <q-tabs
                v-model="endpoint.activeTab"
                dark
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="left"
              >
                <q-tab name="parameters" label="Parameters" />
                <q-tab name="body" label="Request Body" />
                <q-tab name="responses" label="Responses" />
              </q-tabs>

              <q-separator dark />

              <q-tab-panels v-model="endpoint.activeTab" animated dark class="bg-transparent">
                <!-- Parameters -->
                <q-tab-panel name="parameters">
                  <div class="q-pa-none">
                    <div class="row items-center justify-between q-mb-sm">
                      <span class="text-white text-weight-medium">Parámetros</span>
                      <q-btn
                        color="primary"
                        icon="add"
                        label="Agregar"
                        size="sm"
                        no-caps
                        flat
                        dense
                        @click="agregarParametro(index)"
                      />
                    </div>

                    <div
                      v-for="(param, pIndex) in endpoint.parameters"
                      :key="pIndex"
                      class="parameter-row q-mb-sm"
                    >
                      <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-3">
                          <q-input
                            v-model="param.name"
                            label="Nombre"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                            placeholder="page, id, etc."
                          />
                        </div>
                        <div class="col-12 col-sm-3">
                          <q-select
                            v-model="param.type"
                            label="Tipo"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                            :options="tiposParametro"
                            emit-value
                            map-options
                          />
                        </div>
                        <div class="col-12 col-sm-4">
                          <q-input
                            v-model="param.description"
                            label="Descripción"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                          />
                        </div>
                        <div class="col-12 col-sm-1 flex items-center">
                          <q-checkbox
                            v-model="param.required"
                            label="Req."
                            dark
                            dense
                            color="primary"
                          />
                        </div>
                        <div class="col-12 col-sm-1 flex items-center justify-end">
                          <q-btn
                            flat
                            dense
                            round
                            icon="delete"
                            color="negative"
                            size="sm"
                            @click="eliminarParametro(index, pIndex)"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="endpoint.parameters.length === 0"
                      class="text-grey-6 text-center q-pa-md"
                    >
                      No hay parámetros definidos
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Request Body -->
                <q-tab-panel name="body">
                  <div class="q-pa-none">
                    <div class="row items-center justify-between q-mb-sm">
                      <span class="text-white text-weight-medium">Request Body</span>
                      <q-btn
                        color="primary"
                        icon="add"
                        label="Agregar"
                        size="sm"
                        no-caps
                        flat
                        dense
                        @click="agregarBody(index)"
                      />
                    </div>

                    <div
                      v-for="(body, bIndex) in endpoint.bodies"
                      :key="bIndex"
                      class="body-row q-mb-md"
                    >
                      <div class="row q-col-gutter-sm items-end">
                        <div class="col-12 col-sm-3">
                          <q-select
                            v-model="body.content_type"
                            label="Content-Type"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                            :options="contentTypes"
                            emit-value
                            map-options
                          />
                        </div>
                        <div class="col-12 col-sm-8">
                          <q-input
                            v-model="body.exampleText"
                            label="Ejemplo (JSON)"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                            type="textarea"
                            rows="4"
                            placeholder='{ "name": "John", "email": "john@example.com" }'
                            @blur="parseJsonBody(index, bIndex)"
                          />
                          <div v-if="body.jsonError" class="text-negative text-caption q-mt-xs">
                            {{ body.jsonError }}
                          </div>
                        </div>
                        <div class="col-12 col-sm-1 flex items-start">
                          <q-btn
                            flat
                            dense
                            round
                            icon="delete"
                            color="negative"
                            size="sm"
                            @click="eliminarBody(index, bIndex)"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="endpoint.bodies.length === 0"
                      class="text-grey-6 text-center q-pa-md"
                    >
                      No hay body definido
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Responses -->
                <q-tab-panel name="responses">
                  <div class="q-pa-none">
                    <div class="row items-center justify-between q-mb-sm">
                      <span class="text-white text-weight-medium">Respuestas</span>
                      <q-btn
                        color="primary"
                        icon="add"
                        label="Agregar"
                        size="sm"
                        no-caps
                        flat
                        dense
                        @click="agregarResponse(index)"
                      />
                    </div>

                    <div
                      v-for="(response, rIndex) in endpoint.responses"
                      :key="rIndex"
                      class="response-row q-mb-md"
                    >
                      <div class="row q-col-gutter-sm items-end">
                        <div class="col-12 col-sm-2">
                          <q-input
                            v-model.number="response.status_code"
                            label="Status Code"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                            type="number"
                            placeholder="200"
                          />
                        </div>
                        <div class="col-12 col-sm-2">
                          <q-select
                            v-model="response.content_type"
                            label="Content-Type"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                            :options="contentTypes"
                            emit-value
                            map-options
                          />
                        </div>
                        <div class="col-12 col-sm-7">
                          <q-input
                            v-model="response.exampleText"
                            label="Ejemplo (JSON)"
                            outlined
                            dense
                            dark
                            bg-color="dark"
                            type="textarea"
                            rows="4"
                            placeholder='{ "id": 1, "name": "John" }'
                            @blur="parseJsonResponse(index, rIndex)"
                          />
                          <div v-if="response.jsonError" class="text-negative text-caption q-mt-xs">
                            {{ response.jsonError }}
                          </div>
                        </div>
                        <div class="col-12 col-sm-1 flex items-start">
                          <q-btn
                            flat
                            dense
                            round
                            icon="delete"
                            color="negative"
                            size="sm"
                            @click="eliminarResponse(index, rIndex)"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="endpoint.responses.length === 0"
                      class="text-grey-6 text-center q-pa-md"
                    >
                      No hay respuestas definidas
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <div v-if="endpoints.length === 0" class="text-grey-6 text-center q-pa-xl">
          <q-icon name="api" size="64px" color="grey-6" />
          <p class="q-mt-md">No hay endpoints definidos. Comienza agregando uno.</p>
        </div>
      </q-card-section>

      <!-- Botones de acción -->
      <q-card-section>
        <div class="row justify-end q-gutter-sm">
          <q-btn
            label="Cancelar"
            flat
            color="grey-5"
            no-caps
            @click="onCancel"
            :disable="loading"
          />
          <q-btn
            :label="modoEdicion ? 'Actualizar Documentación' : 'Guardar Documentación'"
            color="primary"
            no-caps
            @click="onSubmit"
            :loading="loading"
            :disable="loading || !isValid"
          >
            <template v-slot:loading>
              <q-spinner-dots />
            </template>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['success', 'cancel'])

const apisStore = useApisStore()
const $q = useQuasar()

const loading = ref(false)
const loadingData = ref(false)
const versionName = ref('v1')
const changelog = ref('')
const endpoints = ref([])
const modoEdicion = ref(false)
const initialLoadDone = ref(false)

const metodosHttp = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
]

const tiposParametro = [
  { label: 'String', value: 'string' },
  { label: 'Integer', value: 'integer' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Array', value: 'array' },
  { label: 'Object', value: 'object' },
]

const contentTypes = [
  { label: 'application/json', value: 'application/json' },
  { label: 'application/xml', value: 'application/xml' },
  { label: 'text/plain', value: 'text/plain' },
  { label: 'multipart/form-data', value: 'multipart/form-data' },
]

const isValid = computed(() => {
  return (
    versionName.value &&
    endpoints.value.length > 0 &&
    endpoints.value.every((ep) => ep.path && ep.method)
  )
})

onMounted(async () => {
  if (!initialLoadDone.value) {
    await cargarDocumentacionExistente()
    initialLoadDone.value = true
  }
})

async function cargarDocumentacionExistente() {
  try {
    loadingData.value = true

    endpoints.value = []
    versionName.value = 'v1'
    changelog.value = ''
    modoEdicion.value = false

    const documentation = await apisStore.consultarApiDocumentation(props.apiId)

    if (documentation && documentation.documentation && documentation.documentation.length > 0) {
      modoEdicion.value = true

      const loadedEndpoints = documentation.documentation.map((endpoint, idx) => {

        return {
          tempId: endpoint.id || `temp-${Date.now()}-${idx}`,
          id: endpoint.id,
          path: endpoint.path,
          method: endpoint.method,
          description: endpoint.description || '',
          activeTab: 'parameters',
          parameters: (endpoint.parameters || []).map((p) => ({
            name: p.name || '',
            type: p.type || 'string',
            required: p.required || false,
            description: p.description || '',
          })),
          bodies: (endpoint.body || []).map((b) => ({
            content_type: b.content_type || 'application/json',
            example: b.example || null,
            exampleText: b.example ? JSON.stringify(b.example, null, 2) : '',
            jsonError: null,
          })),
          responses: (endpoint.responses || []).map((r) => ({
            status_code: r.code || 200,
            content_type: r.content_type || 'application/json',
            example: r.example || null,
            exampleText: r.example ? JSON.stringify(r.example, null, 2) : '',
            jsonError: null,
          })),
        }
      })

      versionName.value = documentation.version.name
      changelog.value = documentation.version.changelog

      // Asignar el nuevo array
      endpoints.value = loadedEndpoints

      $q.notify({
        type: 'info',
        message: `${endpoints.value.length} endpoint(s) cargado(s). Puedes editarlos o agregar nuevos.`,
        icon: 'info',
      })
    } else {
      endpoints.value = []
    }
  } catch (error) {
    console.error('Error al cargar documentación:', error)
    // Iniciar en modo creación
    endpoints.value = []
    modoEdicion.value = false
  } finally {
    loadingData.value = false
  }
}

function getMethodColor(method) {
  const colors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'purple',
  }
  return colors[method] || 'grey'
}

function agregarEndpoint() {
  const newEndpoint = {
    // Agregar un ID único temporal
    tempId: `temp-${Date.now()}-${Math.random()}`,
    path: '',
    method: 'GET',
    description: '',
    activeTab: 'parameters',
    parameters: [],
    bodies: [],
    responses: [],
  }

  endpoints.value.push(newEndpoint)
}

function eliminarEndpoint(index) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el endpoint ${endpoints.value[index].method} ${endpoints.value[index].path}?`,
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
  }).onOk(() => {
    // Eliminar el endpoint
    endpoints.value.splice(index, 1)

    $q.notify({
      type: 'info',
      message: 'Endpoint eliminado. Recuerda guardar los cambios.',
      icon: 'delete',
    })
  })
}

function agregarParametro(endpointIndex) {
  endpoints.value[endpointIndex].parameters.push({
    name: '',
    type: 'string',
    required: false,
    description: '',
  })
}

function eliminarParametro(endpointIndex, paramIndex) {
  endpoints.value[endpointIndex].parameters.splice(paramIndex, 1)
}

function agregarBody(endpointIndex) {
  endpoints.value[endpointIndex].bodies.push({
    content_type: 'application/json',
    example: null,
    exampleText: '',
    jsonError: null,
  })
}

function eliminarBody(endpointIndex, bodyIndex) {
  endpoints.value[endpointIndex].bodies.splice(bodyIndex, 1)
}

function parseJsonBody(endpointIndex, bodyIndex) {
  const body = endpoints.value[endpointIndex].bodies[bodyIndex]
  if (!body.exampleText.trim()) {
    body.example = null
    body.jsonError = null
    return
  }

  try {
    body.example = JSON.parse(body.exampleText)
    body.jsonError = null
  } catch (e) {
    body.jsonError = 'JSON inválido'
  }
}

function agregarResponse(endpointIndex) {
  endpoints.value[endpointIndex].responses.push({
    status_code: 200,
    content_type: 'application/json',
    example: null,
    exampleText: '',
    jsonError: null,
  })
}

function eliminarResponse(endpointIndex, responseIndex) {
  endpoints.value[endpointIndex].responses.splice(responseIndex, 1)
}

function parseJsonResponse(endpointIndex, responseIndex) {
  const response = endpoints.value[endpointIndex].responses[responseIndex]
  if (!response.exampleText.trim()) {
    response.example = null
    response.jsonError = null
    return
  }

  try {
    response.example = JSON.parse(response.exampleText)
    response.jsonError = null
  } catch (e) {
    response.jsonError = 'JSON inválido'
  }
}

async function onSubmit() {

  // Validar JSONs antes de enviar
  let hasErrors = false
  endpoints.value.forEach((endpoint, eIndex) => {
    endpoint.bodies.forEach((body, bIndex) => {
      if (body.exampleText && !body.example) {
        parseJsonBody(eIndex, bIndex)
        if (endpoint.bodies[bIndex].jsonError) hasErrors = true
      }
    })
    endpoint.responses.forEach((response, rIndex) => {
      if (response.exampleText && !response.example) {
        parseJsonResponse(eIndex, rIndex)
        if (endpoint.responses[rIndex].jsonError) hasErrors = true
      }
    })
  })

  if (hasErrors) {
    $q.notify({
      type: 'negative',
      message: 'Hay errores en algunos ejemplos JSON. Por favor corrígelos.',
      icon: 'error',
    })
    return
  }

  loading.value = true

  try {
    // Formatear endpoints para el backend
    const formattedEndpoints = endpoints.value.map((ep, idx) => {
      return {
        path: ep.path,
        method: ep.method,
        description: ep.description,
        parameters: ep.parameters.map((p) => ({
          name: p.name,
          type: p.type,
          required: p.required,
          description: p.description,
        })),
        bodies: ep.bodies.map((b) => ({
          content_type: b.content_type,
          example: b.example,
        })),
        responses: ep.responses.map((r) => ({
          status_code: r.status_code,
          content_type: r.content_type,
          example: r.example,
        })),
      }
    })


    const result = await apisStore.registrarApiDocumentation(
      props.apiId,
      versionName.value,
      changelog.value,
      formattedEndpoints,
      modoEdicion.value, // updateExisting
    )


    $q.notify({
      type: 'positive',
      message: modoEdicion.value
        ? 'Documentación actualizada exitosamente'
        : 'Documentación guardada exitosamente',
      icon: 'check_circle',
    })

    emit('success', result)
  } catch (error) {
    console.error('Error al guardar documentación:', error)

    $q.notify({
      type: 'negative',
      message: error.message || 'Error al guardar la documentación',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

function onCancel() {
  emit('cancel')
}

defineExpose({
  resetForm: () => {
    versionName.value = 'v1'
    changelog.value = ''
    endpoints.value = []
    modoEdicion.value = false
    initialLoadDone.value = false
  },
  reloadDocumentation: async () => {
    initialLoadDone.value = false
    await cargarDocumentacionExistente()
    initialLoadDone.value = true
  },
})
</script>

<style lang="scss" scoped>
.endpoints-container {
  max-width: 1400px;
  margin: 0 auto;
}

.endpoints-card {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
}

.endpoint-item {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00a8a8;
  }

  :deep(.q-item__section--side) {
    padding-right: 12px;
  }
}

.endpoint-header {
  background: #1a1a1a;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;

  &.method-get {
    border-left: 4px solid #2196f3;
  }

  &.method-post {
    border-left: 4px solid #4caf50;
  }

  &.method-put {
    border-left: 4px solid #ff9800;
  }

  &.method-delete {
    border-left: 4px solid #f44336;
  }

  &.method-patch {
    border-left: 4px solid #9c27b0;
  }
}

.method-chip {
  font-weight: 600;
  font-size: 11px;
  min-width: 65px;
  justify-content: center;
}

.endpoint-details {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-top: none;
}

.parameter-row,
.body-row,
.response-row {
  background: #1a1a1a;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
}

:deep(.q-tab-panel) {
  padding: 16px 0;
}

:deep(.q-expansion-item__content) {
  padding-top: 0;
}

// Animaciones
.endpoints-card {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Responsive
@media (max-width: 768px) {
  .method-chip {
    font-size: 10px;
    min-width: 55px;
  }

  .parameter-row,
  .body-row,
  .response-row {
    padding: 8px;
  }
}
</style>
