<template>
  <div class="registrar-api-container">
    <q-card flat class="api-form-card">
      <q-card-section class="q-pb-none">
        <div class="text-h5 text-white text-weight-medium q-mb-md">
          {{ modoEdicion ? 'Editar API' : 'Registrar Nueva API' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-col-gutter-md row">
          <!-- Título -->
          <div class="col-md-12 col-sm-12 col-xs-12">
            <q-input
              v-model="formData.title"
              label="Título del API *"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              :rules="[(val) => !!val || 'El título es requerido']"
              maxlength="150"
              counter
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="title" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="col-md-6 col-sm-12 col-xs-12">
            <q-select
              v-model="formData.type"
              label="Tipo de API"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              :options="tiposApi"
              emit-value
              map-options
              class="custom-select"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>
          </div>

          <div class="col-md-6 col-sm-12 col-xs-12">
            <q-input
              v-model.number="formData.price"
              label="Precio"
              type="number"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              step="0.01"
              min="0"
              :rules="[(val) => val >= 0 || 'El precio debe ser mayor o igual a 0']"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Resumen corto -->
          <div class="col-md-12 col-sm-12 col-xs-12">
            <q-input
              v-model="formData.short_summary"
              label="Resumen corto"
              outlined
              dense
              dark
              color="primary"
              bg-color="dark"
              type="textarea"
              rows="2"
              counter
              maxlength="300"
              class="custom-textarea"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Technology Stack -->
          <div class="col-md-12 col-sm-12 col-xs-12">
            <div class="tech-stack-section">
              <div class="section-header">
                <span class="section-title">Technology Stack</span>
                <q-icon name="help" size="xs" color="grey-5" class="q-ml-xs">
                  <q-tooltip class="bg-primary text-white" max-width="300px">
                    Selecciona las tecnologías de la lista o agrega una personalizada.
                  </q-tooltip>
                </q-icon>
              </div>

              <q-select
                v-model="selectedTechnologies"
                :options="filteredTechOptions"
                outlined
                dense
                dark
                color="primary"
                bg-color="dark"
                multiple
                use-chips
                use-input
                input-debounce="0"
                @filter="filterTech"
                @input-value="onTechInput"
                @new-value="createTech"
                new-value-mode="add-unique"
                class="custom-select tech-select"
                placeholder="Selecciona o escribe para agregar..."
              >
                <template v-slot:prepend>
                  <q-icon name="code" color="primary" />
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon
                        :name="scope.opt.icon || 'label'"
                        :color="scope.opt.color || 'grey'"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <q-chip
                    removable
                    @remove="scope.removeAtIndex(scope.index)"
                    :tabindex="scope.tabindex"
                    color="primary"
                    text-color="white"
                    class="tech-chip"
                  >
                    <q-avatar
                      v-if="scope.opt.icon"
                      :icon="scope.opt.icon"
                      :color="scope.opt.color || 'primary'"
                      text-color="white"
                    />
                    {{ scope.opt.label }}
                  </q-chip>
                </template>

                <template v-slot:hint>
                  Presiona Enter para agregar una tecnología personalizada
                </template>
              </q-select>

              <!-- Preview de tecnologías seleccionadas -->
              <div v-if="selectedTechnologies.length > 0" class="tech-preview">
                <div class="preview-label">Tecnologías seleccionadas:</div>
                <div class="tech-grid">
                  <div v-for="tech in selectedTechnologies" :key="tech.value" class="tech-card">
                    <q-icon
                      :name="tech.icon || 'label'"
                      :color="tech.color || 'primary'"
                      size="sm"
                    />
                    <span>{{ tech.label }}</span>
                    <q-btn
                      flat
                      round
                      dense
                      size="xs"
                      icon="close"
                      color="grey-5"
                      @click="removeTech(tech)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- README Editor -->
          <div class="col-md-12 col-sm-12 col-xs-12">
            <div class="readme-editor-container">
              <div class="section-header">
                <div>
                  <span class="section-title">README (Markdown)</span>
                  <q-icon name="help" size="xs" color="grey-5" class="q-ml-xs">
                    <q-tooltip class="bg-primary text-white" max-width="300px">
                      Usa Markdown para formatear tu documentación.<br />
                      # Título, **negrita**, *cursiva*, [enlace](url), etc.
                    </q-tooltip>
                  </q-icon>
                </div>

                <q-btn-toggle
                  v-model="editorMode"
                  toggle-color="primary"
                  color="dark"
                  text-color="white"
                  size="sm"
                  no-caps
                  class="editor-toggle"
                  :options="[
                    { label: 'Editor', value: 'edit', icon: 'edit' },
                    { label: 'Preview', value: 'preview', icon: 'visibility' },
                    { label: 'Split', value: 'split', icon: 'vertical_split' },
                  ]"
                />
              </div>

              <div class="editor-wrapper" :class="`mode-${editorMode}`">
                <!-- Editor -->
                <div v-show="editorMode === 'edit' || editorMode === 'split'" class="editor-pane">
                  <q-input
                    v-model="formData.readme"
                    type="textarea"
                    outlined
                    dark
                    color="primary"
                    bg-color="dark"
                    class="markdown-editor"
                    placeholder="# Mi API

Descripción de tu API...

## Características

- Característica 1
- Característica 2

## Uso

```javascript
// Ejemplo de código
const api = require('mi-api');
```"
                    :input-style="{
                      minHeight: '400px',
                      fontFamily: 'Monaco, Courier New, monospace',
                      fontSize: '13px',
                      lineHeight: '1.6',
                    }"
                  />
                </div>

                <!-- Preview -->
                <div
                  v-show="editorMode === 'preview' || editorMode === 'split'"
                  class="preview-pane"
                >
                  <div class="readme-content markdown-body" v-html="renderedMarkdown"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="row justify-end q-gutter-sm q-mt-lg action-buttons">
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
              :label="modoEdicion ? 'Guardar Cambios' : 'Crear API'"
              type="submit"
              color="primary"
              no-caps
              :loading="loading"
              :disable="loading"
              class="submit-btn"
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'
import { marked } from 'marked'

const props = defineProps({
  apiId: {
    type: String,
    default: null,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['success', 'cancel', 'api-created', 'api-updated'])

const apisStore = useApisStore()
const $q = useQuasar()

const loading = ref(false)
const editorMode = ref('edit')
const modoEdicion = computed(() => !!props.apiId)
const selectedTechnologies = ref([])
const techInput = ref('')
const filteredTechOptions = ref([])

const formData = ref({
  title: '',
  type: 'REST',
  short_summary: '',
  price: 0,
  technology_stack: '',
  readme: '',
})

const tiposApi = [
  { label: 'REST', value: 'REST' },
  { label: 'GraphQL', value: 'GraphQL' },
  { label: 'SOAP', value: 'SOAP' },
  { label: 'WebSocket', value: 'WebSocket' },
  { label: 'gRPC', value: 'gRPC' },
  { label: 'Webhook', value: 'Webhook' },
]

const availableTechnologies = [
  // Frontend
  { label: 'React', value: 'react', icon: 'fab fa-react', color: 'primary' },
  { label: 'Vue.js', value: 'vue', icon: 'fab fa-vuejs', color: 'primary' },
  { label: 'Angular', value: 'angular', icon: 'fab fa-angular', color: 'primary' },
  { label: 'Next.js', value: 'nextjs', icon: 'fas fa-n', color: 'primary' },
  { label: 'Nuxt.js', value: 'nuxtjs', icon: 'fas fa-layer-group', color: 'primary' },
  { label: 'Svelte', value: 'svelte', icon: 'fas fa-fire', color: 'primary' },

  // Backend
  { label: 'Node.js', value: 'nodejs', icon: 'fab fa-node-js', color: 'primary' },
  { label: 'Express', value: 'express', icon: 'fas fa-server', color: 'primary' },
  { label: 'NestJS', value: 'nestjs', icon: 'fas fa-crow', color: 'primary' },
  { label: 'Django', value: 'django', icon: 'fas fa-guitar', color: 'primary' },
  { label: 'Flask', value: 'flask', icon: 'fas fa-flask', color: 'primary' },
  { label: 'FastAPI', value: 'fastapi', icon: 'fas fa-bolt', color: 'primary' },
  { label: 'Spring Boot', value: 'spring', icon: 'fab fa-java', color: 'primary' },
  { label: 'Laravel', value: 'laravel', icon: 'fab fa-laravel', color: 'primary' },
  { label: 'Ruby on Rails', value: 'rails', icon: 'fas fa-gem', color: 'primary' },

  // Databases
  { label: 'MongoDB', value: 'mongodb', icon: 'fas fa-leaf', color: 'primary' },
  { label: 'PostgreSQL', value: 'postgresql', icon: 'fas fa-database', color: 'primary' },
  { label: 'MySQL', value: 'mysql', icon: 'fas fa-database', color: 'primary' },
  { label: 'Redis', value: 'redis', icon: 'fas fa-cube', color: 'primary' },
  { label: 'Firebase', value: 'firebase', icon: 'fas fa-fire', color: 'primary' },
  { label: 'Supabase', value: 'supabase', icon: 'fas fa-bolt', color: 'primary' },

  // Cloud & DevOps
  { label: 'AWS', value: 'aws', icon: 'fab fa-aws', color: 'primary' },
  { label: 'Google Cloud', value: 'gcp', icon: 'fab fa-google', color: 'primary' },
  { label: 'Azure', value: 'azure', icon: 'fab fa-microsoft', color: 'primary' },
  { label: 'Docker', value: 'docker', icon: 'fab fa-docker', color: 'primary' },
  { label: 'Kubernetes', value: 'kubernetes', icon: 'fas fa-dharmachakra', color: 'primary' },
  { label: 'Vercel', value: 'vercel', icon: 'fas fa-triangle', color: 'primary' },
  { label: 'Netlify', value: 'netlify', icon: 'fas fa-network-wired', color: 'primary' },

  // Languages
  { label: 'JavaScript', value: 'javascript', icon: 'fab fa-js', color: 'primary' },
  { label: 'TypeScript', value: 'typescript', icon: 'fas fa-code', color: 'primary' },
  { label: 'Python', value: 'python', icon: 'fab fa-python', color: 'primary' },
  { label: 'Java', value: 'java', icon: 'fab fa-java', color: 'primary' },
  { label: 'Go', value: 'go', icon: 'fab fa-golang', color: 'primary' },
  { label: 'Rust', value: 'rust', icon: 'fab fa-rust', color: 'primary' },
  { label: 'PHP', value: 'php', icon: 'fab fa-php', color: 'primary' },
  { label: 'Ruby', value: 'ruby', icon: 'fas fa-gem', color: 'primary' },

  // Tools & Others
  { label: 'GraphQL', value: 'graphql', icon: 'fas fa-diagram-project', color: 'primary' },
  { label: 'REST API', value: 'rest', icon: 'fas fa-plug', color: 'primary' },
  { label: 'WebSocket', value: 'websocket', icon: 'fas fa-arrows-left-right', color: 'primary' },
  { label: 'Prisma', value: 'prisma', icon: 'fas fa-layer-group', color: 'primary' },
  { label: 'Tailwind CSS', value: 'tailwind', icon: 'fas fa-wind', color: 'primary' },
]

// Computed
const renderedMarkdown = computed(() => {
  if (!formData.value.readme) {
    return '<p class="text-grey-6">Vista previa del README...</p>'
  }
  return marked(formData.value.readme, {
    breaks: true,
    gfm: true,
  })
})

// Watchers
watch(
  selectedTechnologies,
  (newTechs) => {
    formData.value.technology_stack = newTechs.map((t) => t.label).join(', ')
  },
  { deep: true },
)

watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      loadFormData(newData)
    }
  },
  { immediate: true, deep: true },
)

// Lifecycle
onMounted(() => {
  filteredTechOptions.value = [...availableTechnologies]

  if (props.initialData && Object.keys(props.initialData).length > 0) {
    loadFormData(props.initialData)
  }
})

// Methods
function loadFormData(data) {
  formData.value = {
    title: data.title || '',
    type: data.type || 'REST',
    short_summary: data.short_summary || '',
    price: data.price || 0,
    technology_stack: data.technology_stack || '',
    readme: data.readme || '',
  }

  // Cargar tecnologías seleccionadas
  if (data.technology_stack) {
    const techs = data.technology_stack.split(',').map((t) => t.trim())
    selectedTechnologies.value = techs.map((tech) => {
      const found = availableTechnologies.find((t) => t.label.toLowerCase() === tech.toLowerCase())
      return (
        found || {
          label: tech,
          value: tech.toLowerCase().replace(/\s+/g, '-'),
          icon: 'label',
          color: 'grey',
        }
      )
    })
  }
}

function filterTech(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    filteredTechOptions.value = availableTechnologies.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    )
  })
}

function onTechInput(val) {
  techInput.value = val
}

function createTech(val, done) {
  if (val.length > 0) {
    const newTech = {
      label: val,
      value: val.toLowerCase().replace(/\s+/g, '-'),
      icon: 'label',
      color: 'grey',
    }

    // Agregar a la lista de tecnologías disponibles
    availableTechnologies.push(newTech)

    done(newTech, 'add-unique')
  }
}

function removeTech(tech) {
  const index = selectedTechnologies.value.findIndex((t) => t.value === tech.value)
  if (index > -1) {
    selectedTechnologies.value.splice(index, 1)
  }
}

async function onSubmit() {
  loading.value = true

  try {
    let result

    if (modoEdicion.value) {
      result = await apisStore.registarApiOverview(formData.value, props.apiId)

      $q.notify({
        type: 'positive',
        message: 'API actualizada exitosamente',
        icon: 'check_circle',
      })

      emit('api-updated', result.id)
    } else {
      result = await apisStore.registarApiOverview(formData.value)

      $q.notify({
        type: 'positive',
        message: 'API creada exitosamente',
        icon: 'check_circle',
      })

      emit('api-created', result.id)
    }

    emit('success', result.id)
    resetForm()
  } catch (error) {
    console.error('Error al guardar API:', error)

    $q.notify({
      type: 'negative',
      message: error.message || 'Error al guardar la API. Por favor, intenta de nuevo.',
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
    title: '',
    type: 'REST',
    short_summary: '',
    price: 0,
    technology_stack: '',
    readme: '',
  }
  selectedTechnologies.value = []
  editorMode.value = 'edit'
}

defineExpose({
  resetForm,
  setFormData: (data) => {
    loadFormData(data)
  },
})
</script>

<style lang="scss" scoped>
.registrar-api-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.api-form-card {
  background: linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 100%);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 168, 168, 0.4);
    box-shadow: 0 12px 48px rgba(0, 168, 168, 0.1);
  }
}

// Estilos personalizados para inputs
.custom-input,
.custom-select,
.custom-textarea {
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
}

// Section headers
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

// Technology Stack Section
.tech-stack-section {
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

.tech-select {
  :deep(.q-chip) {
    background: rgba(0, 168, 168, 0.2);
    backdrop-filter: blur(10px);
  }
}

.tech-chip {
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 168, 168, 0.3);
  }
}

.tech-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 168, 168, 0.1);
}

.preview-label {
  color: #b0b0b0;
  font-size: 13px;
  margin-bottom: 12px;
  font-weight: 500;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.tech-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: #ffffff;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 168, 168, 0.1);
    border-color: rgba(0, 168, 168, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 168, 168, 0.2);
  }

  span {
    flex: 1;
  }
}

// README Editor
.readme-editor-container {
  background: rgba(0, 168, 168, 0.03);
  border: 1px solid rgba(0, 168, 168, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.editor-toggle {
  border-radius: 8px;
  overflow: hidden;

  :deep(.q-btn) {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 168, 168, 0.1);
    }
  }
}

.editor-wrapper {
  display: flex;
  gap: 16px;
  min-height: 400px;
  margin-top: 16px;

  &.mode-edit,
  &.mode-preview {
    .editor-pane,
    .preview-pane {
      flex: 1;
    }
  }

  &.mode-split {
    .editor-pane,
    .preview-pane {
      flex: 1;
    }
  }
}

.editor-pane,
.preview-pane {
  flex: 1;
  min-width: 0;
  border-radius: 8px;
  overflow: hidden;
}

.markdown-editor {
  :deep(.q-field__control) {
    border-radius: 8px;
  }

  :deep(textarea) {
    background: rgba(0, 0, 0, 0.4) !important;
  }
}

.preview-pane {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 168, 168, 0.2);
  padding: 20px;
  overflow-y: auto;
  max-height: 500px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 168, 168, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(0, 168, 168, 0.5);
    }
  }
}

// README Content Styles
.readme-content {
  &:deep() {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #ffffff;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(0, 168, 168, 0.2);
      padding-bottom: 10px;

      &:first-child {
        margin-top: 0;
      }
    }

    h1 {
      font-size: 28px;
    }
    h2 {
      font-size: 24px;
    }
    h3 {
      font-size: 20px;
    }
    h4 {
      font-size: 18px;
    }
    h5 {
      font-size: 16px;
    }
    h6 {
      font-size: 14px;
    }

    p {
      color: #b0b0b0;
      line-height: 1.8;
      margin-bottom: 16px;
      font-size: 14px;
    }

    a {
      color: #00d4d4;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      border-bottom: 1px solid transparent;

      &:hover {
        border-bottom-color: #00d4d4;
        color: #00ffff;
      }
    }

    pre {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(0, 168, 168, 0.3);
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 16px;

      code {
        color: #00d4d4;
        font-size: 12px;
        font-family: 'Monaco', 'Courier New', monospace;
      }
    }

    code {
      background: rgba(0, 168, 168, 0.15);
      color: #00d4d4;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
    }

    ul,
    ol {
      color: #b0b0b0;
      margin-bottom: 16px;
      padding-left: 24px;

      li {
        margin-bottom: 8px;
        line-height: 1.8;
      }
    }

    blockquote {
      background: rgba(0, 168, 168, 0.08);
      border-left: 4px solid #00a8a8;
      color: #b0b0b0;
      padding: 16px 20px;
      margin-bottom: 16px;
      border-radius: 0 8px 8px 0;
      font-style: italic;
      font-size: 14px;

      p {
        margin: 0;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;
      border-radius: 8px;
      overflow: hidden;

      thead {
        background: rgba(0, 168, 168, 0.2);

        th {
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #00a8a8;
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid rgba(0, 168, 168, 0.1);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(0, 168, 168, 0.08);
          }

          td {
            color: #b0b0b0;
            padding: 12px;
          }
        }
      }
    }

    hr {
      border: none;
      border-top: 1px solid rgba(0, 168, 168, 0.2);
      margin: 24px 0;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid rgba(0, 168, 168, 0.2);
    }

    strong {
      color: #ffffff;
      font-weight: 600;
    }

    em {
      font-style: italic;
      color: #c0c0c0;
    }
  }
}

// Action Buttons
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

.submit-btn {
  background: linear-gradient(135deg, #00a8a8 0%, #00d4d4 100%);
  box-shadow: 0 4px 12px rgba(0, 168, 168, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 168, 168, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 768px) {
  .registrar-api-container {
    padding: 8px;
  }

  .editor-wrapper.mode-split {
    flex-direction: column;

    .editor-pane,
    .preview-pane {
      width: 100%;
    }
  }

  .tech-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  .tech-card {
    padding: 8px 12px;
    font-size: 12px;
  }

  .readme-content {
    &:deep() {
      h1 {
        font-size: 22px;
      }
      h2 {
        font-size: 18px;
      }
      h3 {
        font-size: 16px;
      }
      p,
      code,
      blockquote {
        font-size: 13px;
      }
    }
  }
}

@media (max-width: 480px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

// Animations
.api-form-card {
  animation: fadeInUp 0.4s ease-out;
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

.tech-card,
.tech-chip {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Focus states
.custom-input,
.custom-select,
.custom-textarea {
  :deep(.q-field__control) {
    &:focus-within {
      box-shadow: 0 0 0 2px rgba(0, 168, 168, 0.2);
    }
  }
}
</style>
