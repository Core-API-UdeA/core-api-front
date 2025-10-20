<template>
  <!-- Contenido cargado -->
  <div v-if="apiCargada" class="documentation-container">
    <!-- Endpoints List -->
    <div class="endpoints-section q-mb-lg">
      <h3 class="section-title">Endpoints</h3>

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
          <p class="endpoint-description">{{ endpoint.description }}</p>
        </div>
      </div>
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
            <p class="param-description">{{ param.description }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>No parameters</p>
      </div>

      <!-- Body -->
      <div v-if="selectedEndpoint.body.length > 0" class="q-mb-lg">
        <h4 class="detail-title">Body</h4>
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
              <span class="code-value">{{ getResponseCode(index) }}</span>
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
    <!-- Endpoints skeleton -->
    <div class="q-mb-lg">
      <div
        class="skeleton-item skeleton-title"
        style="width: 150px; height: 24px; margin-bottom: 20px"
      ></div>
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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
})

const apisStore = useApisStore()
const $q = useQuasar()

const apiDocumentation = ref(null)
const apiCargada = ref(false)
const selectedEndpoint = ref(null)

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

function getMethodColor(method) {
  const colors = {
    GET: 'info',
    POST: 'warning',
    PUT: 'primary',
    DELETE: 'negative',
    PATCH: 'secondary',
  }
  return colors[method] || 'grey-7'
}

function getResponseCode(index) {
  // Códigos HTTP comunes para respuestas
  const codes = [200, 201, 400, 404, 500]
  return codes[index] || 200 + index * 100
}

function formatJSON(obj) {
  return JSON.stringify(obj, null, 2)
}
</script>

<style lang="scss" scoped>
.documentation-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Titles and Headers
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
  margin-top: 0;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  margin-top: 0;
}

.detail-subtitle {
  font-size: 12px;
  color: #b0b0b0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  font-weight: 500;
}

// Endpoints
.endpoints-list {
  display: flex;
  flex-direction: column;
}

.endpoint-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00a8a8;
    background: #242424;
    box-shadow: 0 4px 12px rgba(0, 168, 168, 0.15);
  }

  &.active {
    border-color: #00a8a8;
    background: rgba(0, 168, 168, 0.05);
    box-shadow: 0 4px 16px rgba(0, 168, 168, 0.2);
  }
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.method-badge {
  font-weight: 700;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
}

.endpoint-path {
  color: #b0b0b0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 500;
}

.endpoint-description {
  color: #808080;
  font-size: 12px;
  margin: 0;
  line-height: 1.5;
}

// Parameters
.parameters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.parameter-item {
  background: #252525;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 12px;
}

.param-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.param-name {
  color: #00a8a8;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 600;
}

.param-type-badge,
.param-required-badge {
  font-size: 10px;
  font-weight: 600;
}

.param-description {
  color: #b0b0b0;
  font-size: 12px;
  margin: 0;
  line-height: 1.5;
}

// Code Block
.code-block {
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 12px;

  pre {
    margin: 0;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;

    code {
      color: #00a8a8;
      word-break: break-word;
      white-space: pre-wrap;
    }
  }
}

// Responses
.responses-list {
  display: flex;
  flex-direction: column;
}

.response-item {
  background: #252525;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
}

.response-code {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.code-label {
  color: #b0b0b0;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-value {
  color: #00a8a8;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
}

.no-data {
  background: #252525;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  text-align: center;

  p {
    color: #808080;
    font-size: 13px;
    margin: 0;
  }
}

// Skeleton
.skeleton-container {
  animation: fadeIn 0.3s ease-in-out;
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
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
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
  .section-title {
    font-size: 18px;
  }

  .endpoint-header {
    flex-wrap: wrap;
  }

  .param-header {
    gap: 6px;
  }

  .code-block {
    padding: 12px;

    pre code {
      font-size: 11px;
    }
  }
}
</style>
