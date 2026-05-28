<template>
  <div class="sdk-snippets">
    <!-- ─── Header ─────────────────────────────────────────────────────── -->
    <div class="row items-center q-mb-md" style="min-width: 0; flex-wrap: wrap; gap: 8px">
      <div class="row items-center" style="min-width: 0; flex: 1">
        <q-icon name="code" color="primary" size="sm" class="q-mr-sm" style="flex-shrink: 0" />
        <span class="text-subtitle2 text-white text-weight-bold ellipsis"
          >SDK — Código listo para usar</span
        >
      </div>
      <div class="lang-toggle-wrap">
        <q-btn-toggle
          v-model="lenguaje"
          flat
          dense
          no-caps
          toggle-color="primary"
          text-color="grey-5"
          :options="lenguajes"
          size="xs"
        />
      </div>
    </div>

    <!-- ─── Sin endpoints ───────────────────────────────────────────────── -->
    <div v-if="!endpoints.length" class="text-center q-py-md">
      <q-icon name="info_outline" color="grey-6" size="sm" class="q-mr-xs" />
      <span class="text-caption text-grey-6">
        Esta API aún no tiene documentación de endpoints registrada.
      </span>
    </div>

    <!-- ─── Selector de endpoint ────────────────────────────────────────── -->
    <div v-else>
      <q-select
        v-model="endpointSeleccionado"
        :options="opcionesEndpoints"
        label="Selecciona un endpoint"
        outlined
        dark
        dense
        color="primary"
        bg-color="dark"
        class="q-mb-md"
        emit-value
        map-options
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-badge
                :color="colorMetodo(scope.opt.method)"
                :label="scope.opt.method"
                style="font-size: 10px; min-width: 48px; justify-content: center"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white" style="font-family: monospace">
                {{ scope.opt.path }}
              </q-item-label>
              <q-item-label caption class="text-grey-5">
                {{ scope.opt.description }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:selected-item="scope">
          <div class="row items-center q-gutter-xs">
            <q-badge
              :color="colorMetodo(scope.opt.method)"
              :label="scope.opt.method"
              style="font-size: 10px"
            />
            <span class="text-white" style="font-family: monospace">{{ scope.opt.path }}</span>
          </div>
        </template>
      </q-select>

      <!-- ─── Bloque de código ───────────────────────────────────────────── -->
      <div class="code-block">
        <!-- Toolbar del bloque -->
        <div class="code-toolbar row items-center justify-between q-px-md q-py-sm">
          <div class="row items-center q-gutter-xs">
            <!-- Dots decorativos estilo macOS -->
            <div class="mac-dot bg-negative" />
            <div class="mac-dot bg-warning" />
            <div class="mac-dot bg-positive" />
            <span class="text-caption text-grey-6 q-ml-sm">{{ labelArchivo }}</span>
          </div>
          <q-btn
            flat
            dense
            no-caps
            icon="content_copy"
            color="primary"
            label="Copiar"
            size="xs"
            @click="copiarCodigo"
          >
            <q-tooltip class="bg-dark" anchor="top middle" self="bottom middle">
              Copiar código al portapapeles
            </q-tooltip>
          </q-btn>
        </div>

        <!-- Código -->
        <div class="code-content q-pa-md">
          <pre class="code-pre"><code v-html="codigoHighlighted" /></pre>
        </div>
      </div>

      <!-- ─── Nota de variables ────────────────────────────────────────── -->
      <div class="q-mt-sm text-caption text-grey-6 row items-center q-gutter-xs">
        <q-icon name="info_outline" size="xs" />
        <span>
          Reemplaza <code class="inline-code">TU_API_KEY</code> con tu API Key personal o usa
          directamente la colección de Postman que ya tiene tu key configurada.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  // Suscripción activa del consumidor
  suscripcion: {
    type: Object,
    required: true,
  },
  // Endpoints de la documentación (array de objetos endpoint)
  endpoints: {
    type: Array,
    default: () => [],
  },
})

const $q = useQuasar()

// ─── State ────────────────────────────────────────────────────────────────
const lenguaje = ref('curl')
const endpointSeleccionado = ref(null)

const lenguajes = [
  { label: 'cURL', value: 'curl' },
  { label: 'JavaScript', value: 'js' },
  { label: 'Python', value: 'python' },
]

// ─── Computed ─────────────────────────────────────────────────────────────

const opcionesEndpoints = computed(() =>
  props.endpoints.map((ep) => ({
    label: `${ep.method} ${ep.path}`,
    value: ep,
    method: ep.method,
    path: ep.path,
    description: ep.description,
  })),
)

const endpointActual = computed(() => endpointSeleccionado.value)

const gatewayBase = computed(() => {
  const origin = window.location.origin
  const base = origin.includes('localhost') ? 'http://localhost:1337/scapi' : origin + '/scapi'
  const slug = props.suscripcion?.api_id?.slug ?? 'api-slug'
  return `${base}/gateway/${slug}`
})

const apiKey = computed(() => props.suscripcion?.api_key ?? 'TU_API_KEY')

const labelArchivo = computed(() => {
  const map = { curl: 'terminal', js: 'ejemplo.js', python: 'ejemplo.py' }
  return map[lenguaje.value] || 'ejemplo'
})

const codigoGenerado = computed(() => {
  const ep = endpointActual.value
  if (!ep) return '# Selecciona un endpoint arriba'

  const url = construirUrl(ep)

  switch (lenguaje.value) {
    case 'curl':
      return generarCurl(ep, url)
    case 'js':
      return generarJs(ep, url)
    case 'python':
      return generarPython(ep, url)
    default:
      return ''
  }
})

// Syntax highlighting básico sin dependencias externas
const codigoHighlighted = computed(() => {
  const code = codigoGenerado.value
  if (!code) return ''

  return (
    code
      // Strings entre comillas dobles y simples
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="hl-string">$1</span>')
      // Keywords de Python
      .replace(
        /\b(import|from|def|return|if|else|elif|for|in|with|as|True|False|None|print|requests|json|headers|response|data)\b/g,
        '<span class="hl-keyword">$1</span>',
      )
      // Keywords de JS
      .replace(
        /\b(const|let|var|function|async|await|fetch|then|catch|console|log|JSON|stringify|parse|new|Headers|Request|Response)\b/g,
        '<span class="hl-keyword">$1</span>',
      )
      // Comentarios
      .replace(/(#[^\n]*|\/\/[^\n]*)/g, '<span class="hl-comment">$1</span>')
      // Números
      .replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>')
      // Flags de curl
      .replace(/\s(-[a-zA-Z]+|--[a-zA-Z-]+)/g, ' <span class="hl-flag">$1</span>')
      // Saltos de línea
      .replace(/\n/g, '<br>')
  )
})

// ─── Lifecycle ────────────────────────────────────────────────────────────
onMounted(() => {
  if (props.endpoints.length > 0) {
    endpointSeleccionado.value = props.endpoints[0]
  }
})

watch(
  () => props.endpoints,
  (newEndpoints) => {
    if (newEndpoints.length > 0 && !endpointSeleccionado.value) {
      endpointSeleccionado.value = newEndpoints[0]
    }
  },
)

// ─── Generadores de código ────────────────────────────────────────────────

function construirUrl(ep) {
  const queryParams = (ep.parameters || [])
    .filter((p) => (p.location === 'query' || !p.location) && p.required)
    .map((p) => `${p.name}=${p.example || 'VALOR'}`)
    .join('&')

  const pathConEjemplo = ep.path.replace(/{(\w+)}/g, 'VALOR_$1')
  const urlBase = `${gatewayBase.value}${pathConEjemplo}`
  return queryParams ? `${urlBase}?${queryParams}` : urlBase
}

function generarCurl(ep, url) {
  const method = ep.method
  const tieneBody = ['POST', 'PUT', 'PATCH'].includes(method) && ep.bodies?.length

  const lines = [
    `curl -X ${method} \\`,
    `  "${url}" \\`,
    `  -H "X-Api-Key: ${apiKey.value}" \\`,
    `  -H "Content-Type: application/json"`,
  ]

  // Headers opcionales documentados
  ;(ep.headers || [])
    .filter((h) => h.required)
    .forEach((h) => {
      lines[lines.length - 1] += ' \\'
      lines.push(`  -H "${h.name}: ${h.example || 'VALOR'}"`)
    })

  // Body
  if (tieneBody) {
    const bodyEjemplo = ep.bodies[0]?.example ?? {}
    lines[lines.length - 1] += ' \\'
    lines.push(`  -d '${JSON.stringify(bodyEjemplo, null, 2)}'`)
  }

  return lines.join('\n')
}

function generarJs(ep, url) {
  const method = ep.method
  const tieneBody = ['POST', 'PUT', 'PATCH'].includes(method) && ep.bodies?.length
  const bodyEjemplo = tieneBody ? (ep.bodies[0]?.example ?? {}) : null

  const headerAdicionales = (ep.headers || [])
    .filter((h) => h.required)
    .map((h) => `  "${h.name}": "${h.example || 'VALOR'}"`)
    .join(',\n')

  return [
    `// Instalación: no requiere dependencias externas`,
    ``,
    `const url = "${url}";`,
    ``,
    `const headers = {`,
    `  "X-Api-Key": "${apiKey.value}",`,
    `  "Content-Type": "application/json"${headerAdicionales ? ',' : ''}`,
    ...(headerAdicionales ? [headerAdicionales] : []),
    `};`,
    ``,
    `const options = {`,
    `  method: "${method}",`,
    `  headers,`,
    ...(tieneBody
      ? [`  body: JSON.stringify(${JSON.stringify(bodyEjemplo, null, 2).replace(/\n/g, '\n  ')}),`]
      : []),
    `};`,
    ``,
    `const response = await fetch(url, options);`,
    `const data = await response.json();`,
    ``,
    `console.log(data);`,
  ].join('\n')
}

function generarPython(ep, url) {
  const method = ep.method.lower?.() ?? ep.method.toLowerCase()
  const tieneBody = ['post', 'put', 'patch'].includes(method) && ep.bodies?.length
  const bodyEjemplo = tieneBody ? (ep.bodies[0]?.example ?? {}) : null

  const headersAdicionales = (ep.headers || [])
    .filter((h) => h.required)
    .map((h) => `    "${h.name}": "${h.example || 'VALOR'}"`)
    .join(',\n')

  return [
    `# Instalación: pip install requests`,
    `import requests`,
    ``,
    `url = "${url}"`,
    ``,
    `headers = {`,
    `    "X-Api-Key": "${apiKey.value}",`,
    `    "Content-Type": "application/json"${headersAdicionales ? ',' : ''}`,
    ...(headersAdicionales ? [headersAdicionales] : []),
    `}`,
    ``,
    ...(tieneBody
      ? [
          `payload = ${JSON.stringify(bodyEjemplo, null, 4).replace(/\n/g, '\n')}`,
          ``,
          `response = requests.${method}(url, headers=headers, json=payload)`,
        ]
      : [`response = requests.${method}(url, headers=headers)`]),
    ``,
    `print(response.status_code)`,
    `print(response.json())`,
  ].join('\n')
}

// ─── Acciones ─────────────────────────────────────────────────────────────
function copiarCodigo() {
  navigator.clipboard.writeText(codigoGenerado.value)
  $q.notify({
    type: 'positive',
    message: 'Código copiado al portapapeles',
    icon: 'content_copy',
    timeout: 2000,
  })
}

function colorMetodo(method) {
  const map = {
    GET: 'positive',
    POST: 'blue',
    PUT: 'warning',
    PATCH: 'purple',
    DELETE: 'negative',
  }
  return map[method] || 'grey'
}
</script>

<style lang="scss" scoped>
.sdk-snippets {
  /* Contener todo dentro del ancho disponible */
  min-width: 0;
  overflow: hidden;
}

.code-block {
  background: #0d1117;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  /* Evitar que rompa el ancho del padre */
  min-width: 0;
  max-width: 100%;
}

.code-toolbar {
  background: #161b22;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.mac-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.7;
  flex-shrink: 0;
}

.code-content {
  overflow-x: auto;
  max-height: 280px;
  overflow-y: auto;
}

.code-pre {
  margin: 0;
  font-family: 'Consolas', 'Roboto Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #e6edf3;
  /* pre-wrap: respeta saltos pero hace wrap en pantallas pequeñas */
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Selector de lenguaje responsive: en pantallas pequeñas usa scroll */
.lang-toggle-wrap {
  overflow-x: auto;
  flex-shrink: 0;
}

:deep(.hl-string) {
  color: #a5d6ff;
}
:deep(.hl-keyword) {
  color: #ff7b72;
}
:deep(.hl-comment) {
  color: #8b949e;
  font-style: italic;
}
:deep(.hl-number) {
  color: #79c0ff;
}
:deep(.hl-flag) {
  color: #d2a8ff;
}

.inline-code {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 1px 5px;
  font-family: monospace;
  font-size: 11px;
  color: #a5d6ff;
  word-break: break-all;
}
</style>
