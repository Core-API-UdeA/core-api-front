<template>
  <!-- Contenido cargado -->
  <div v-if="apiCargada" class="documentation-container">
    <!-- Header con botón de edición -->
    <div class="row justify-between items-center q-mb-lg">
      <h3 class="section-title q-ma-none">Documentación de Endpoints</h3>
      <q-btn
        v-if="isOwner"
        flat
        dense
        icon="edit"
        label="Editar Documentación"
        color="primary"
        size="sm"
        no-caps
        @click="editarDocumentacion"
      >
        <q-tooltip class="bg-primary">Editar endpoints y documentación</q-tooltip>
      </q-btn>
    </div>

    <!-- Endpoints List -->
    <div v-if="documentation.length > 0" class="endpoints-section q-mb-lg">
      <div class="endpoints-list q-gutter-md">
        <div
          v-for="endpoint in documentation"
          :key="endpoint.id"
          class="endpoint-card"
          :class="{ active: selectedEndpoint?.id === endpoint.id }"
          @click="selectedEndpoint = endpoint"
        >
          <div class="endpoint-header">
            <q-badge
              :label="endpoint.method"
              :color="getMethodColor(endpoint.method)"
              class="method-badge"
            />
            <span class="endpoint-path">{{ endpoint.path }}</span>
          </div>
          <p class="endpoint-description">{{ endpoint.description || 'Sin descripción' }}</p>
        </div>
      </div>
    </div>

    <!-- Sin endpoints -->
    <div v-else class="no-endpoints q-pa-xl text-center">
      <q-icon name="api" size="64px" color="grey-6" />
      <p class="text-grey-5 q-mt-md q-mb-md">No hay endpoints documentados aún</p>
      <q-btn
        v-if="isOwner"
        label="Agregar Endpoints"
        color="primary"
        icon="add"
        no-caps
        @click="editarDocumentacion"
      />
    </div>

    <!-- Endpoint Details -->
    <div v-if="selectedEndpoint" class="endpoint-details">
      <!-- Parameters -->
      <div v-if="selectedEndpoint.parameters.length > 0" class="q-mb-lg">
        <h4 class="detail-title">Parameters</h4>
        <div class="parameters-list">
          <div
            v-for="param in selectedEndpoint.parameters"
            :key="param.name"
            class="parameter-item"
          >
            <div class="param-header">
              <span class="param-name">{{ param.name }}</span>
              <q-badge :label="param.type" color="primary" class="param-type-badge" />
              <q-badge
                v-if="param.required"
                label="Required"
                color="negative"
                class="param-required-badge"
              />
            </div>
            <p class="param-description">{{ param.description || 'Sin descripción' }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p class="text-grey-6">No parameters</p>
      </div>

      <!-- Body -->
      <div v-if="selectedEndpoint.body.length > 0" class="q-mb-lg">
        <h4 class="detail-title">Request Body</h4>
        <p class="detail-subtitle">Example value</p>
        <div class="code-block">
          <pre><code>{{ formatJSON(selectedEndpoint.body[0].example) }}</code></pre>
        </div>
      </div>

      <!-- Responses -->
      <div v-if="selectedEndpoint.responses.length > 0" class="q-mb-lg">
        <h4 class="detail-title">Responses</h4>

        <div class="responses-list q-gutter-md">
          <div
            v-for="(response, index) in selectedEndpoint.responses"
            :key="index"
            class="response-item"
          >
            <div class="response-code">
              <span class="code-label">Code</span>
              <span class="code-value">{{ response.code || getResponseCode(index) }}</span>
              <span v-if="response.description" class="code-description">
                - {{ response.description }}
              </span>
            </div>
            <div class="code-block">
              <pre><code>{{ formatJSON(response.example) }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Skeleton Loading -->
  <div v-else class="skeleton-container">
    <!-- Header skeleton -->
    <div class="row justify-between items-center q-mb-lg">
      <div class="skeleton-item skeleton-title" style="width: 250px; height: 24px"></div>
      <div class="skeleton-item" style="width: 120px; height: 32px; border-radius: 6px"></div>
    </div>

    <!-- Endpoints skeleton -->
    <div class="q-mb-lg">
      <div class="q-gutter-md">
        <div v-for="n in 3" :key="'endpoint-skeleton-' + n" class="skeleton-endpoint">
          <div
            class="skeleton-item"
            style="width: 80px; height: 24px; border-radius: 6px; margin-bottom: 12px"
          ></div>
          <div class="skeleton-item" style="width: 60%; height: 16px"></div>
        </div>
      </div>
    </div>

    <!-- Details skeleton -->
    <div>
      <div
        class="skeleton-item skeleton-title"
        style="width: 200px; height: 24px; margin-bottom: 16px"
      ></div>
      <div class="q-gutter-md">
        <div
          v-for="n in 4"
          :key="'detail-skeleton-' + n"
          class="skeleton-item"
          style="width: 100%; height: 60px; border-radius: 8px"
        ></div>
      </div>
    </div>
  </div>

  <!-- Dialog para editar Documentación -->
  <q-dialog v-model="showEditDialog" maximized dark @hide="handleDialogClose">
    <q-card flat class="bg-dark">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">Editar Documentación de Endpoints</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <RegistrarEndpoints
          v-if="showEditDialog"
          ref="endpointsFormRef"
          :api-id="apiId"
          @success="handleDocumentationUpdated"
          @cancel="showEditDialog = false"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'
import { useAuthStore } from 'stores/auth-store.js'
import RegistrarEndpoints from 'src/components/apis/FormularioApiDocumentation.vue'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    default: null,
  },
})

const apisStore = useApisStore()
const authStore = useAuthStore()
const $q = useQuasar()

const apiDocumentation = ref(null)
const apiCargada = ref(false)
const selectedEndpoint = ref(null)
const showEditDialog = ref(false)
const endpointsFormRef = ref(null)

onMounted(async () => {
  try {
    $q.loading.show()
    apiDocumentation.value = await apisStore.consultarApiDocumentation(props.apiId)
    apiCargada.value = true

    // Seleccionar el primer endpoint por defecto
    if (apiDocumentation.value?.documentation?.length > 0) {
      selectedEndpoint.value = apiDocumentation.value.documentation[0]
    }
  } catch (error) {
    console.error('Error fetching API documentation:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load API documentation. Please try again later.',
    })
  } finally {
    $q.loading.hide()
  }
})

const api = computed(() => apiDocumentation.value || {})
const documentation = computed(() => api.value.documentation || [])

// Verificar si el usuario actual es el owner
const isOwner = computed(() => {
  if (!authStore.loggedIn || !props.owner) return false

  return authStore.user?.email === props.owner
})

function getMethodColor(method) {
  const colors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'purple',
  }
  return colors[method] || 'grey-7'
}

function getResponseCode(index) {
  // Códigos HTTP comunes para respuestas
  const codes = [200, 201, 400, 404, 500]
  return codes[index] || 200 + index * 100
}

function formatJSON(obj) {
  if (!obj) return 'null'
  return JSON.stringify(obj, null, 2)
}

function editarDocumentacion() {
  showEditDialog.value = true
}

function handleDialogClose() {
  if (endpointsFormRef.value) {
    endpointsFormRef.value.resetForm()
  }
}

async function handleDocumentationUpdated() {
  showEditDialog.value = false

  $q.loading.show()
  try {
    // Recargar la documentación actualizada
    apiDocumentation.value = await apisStore.consultarApiDocumentation(props.apiId)

    // Mantener el endpoint seleccionado o seleccionar el primero
    if (apiDocumentation.value?.documentation?.length > 0) {
      const currentId = selectedEndpoint.value?.id
      const stillExists = apiDocumentation.value.documentation.find((e) => e.id === currentId)

      if (stillExists) {
        selectedEndpoint.value = stillExists
      } else {
        selectedEndpoint.value = apiDocumentation.value.documentation[0]
      }
    } else {
      selectedEndpoint.value = null
    }

    $q.notify({
      type: 'positive',
      message: 'Documentación actualizada exitosamente',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error al recargar documentación:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al recargar la documentación',
    })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style lang="scss" scoped>
.documentation-container {
  padding: 20px 0;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
}

.endpoints-section {
  margin-bottom: 30px;
}

.endpoints-list {
  display: flex;
  flex-direction: column;
}

.endpoint-card {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00a8a8;
    transform: translateX(4px);
  }

  &.active {
    border-color: #00a8a8;
    background: rgba(0, 168, 168, 0.05);
  }
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.method-badge {
  font-weight: 600;
  font-size: 11px;
  min-width: 70px;
  text-align: center;
}

.endpoint-path {
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}

.endpoint-description {
  color: #b0b0b0;
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

.no-endpoints {
  background: #0f0f0f;
  border: 1px dashed #2a2a2a;
  border-radius: 12px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.endpoint-details {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 24px;
}

.detail-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: 1px solid #2a2a2a;
  padding-bottom: 8px;
}

.detail-subtitle {
  color: #b0b0b0;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.parameters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parameter-item {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  padding: 12px;
}

.param-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.param-name {
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}

.param-type-badge {
  font-size: 10px;
}

.param-required-badge {
  font-size: 10px;
}

.param-description {
  color: #b0b0b0;
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

.no-data {
  padding: 20px;
  text-align: center;
}

.code-block {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;

  pre {
    margin: 0;
    font-family: 'Monaco', 'Courier New', monospace;

    code {
      color: #00a8a8;
      font-size: 12px;
      line-height: 1.6;
    }
  }
}

.responses-list {
  display: flex;
  flex-direction: column;
}

.response-item {
  margin-bottom: 16px;
}

.response-code {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #1a1a1a;
  border-radius: 6px;

  .code-label {
    color: #b0b0b0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .code-value {
    color: #00a8a8;
    font-weight: 600;
    font-size: 14px;
  }

  .code-description {
    color: #b0b0b0;
    font-size: 13px;
  }
}

// Skeleton Styles
.skeleton-container {
  padding: 20px 0;
}

.skeleton-item {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.skeleton-title {
  border-radius: 6px;
}

.skeleton-endpoint {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Responsive
@media (max-width: 768px) {
  .documentation-container {
    padding: 12px 0;
  }

  .section-title {
    font-size: 20px;
  }

  .endpoint-card {
    padding: 12px;

    &:hover {
      transform: translateX(2px);
    }
  }

  .endpoint-path {
    font-size: 13px;
  }

  .endpoint-description {
    font-size: 12px;
  }

  .endpoint-details {
    padding: 16px;
  }

  .detail-title {
    font-size: 16px;
  }

  .code-block {
    padding: 12px;

    pre code {
      font-size: 11px;
    }
  }
}
</style>
