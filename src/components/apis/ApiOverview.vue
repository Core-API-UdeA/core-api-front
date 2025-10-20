<template>
  <!-- Contenido cargado -->
  <div v-if="apiCargada">
    <div class="row justify-between">
      <!-- Header row -->
      <div class="row flex q-gutter-md" style="align-items: center">
        <!-- Avatar -->
        <div
          class="flex flex-center bg-white avatar-circle"
          style="border-radius: 50px; width: 40px; height: 40px; border: solid 3px black"
        >
          <span class="text-weight-bolder">
            {{ getInitials(api.owner?.username || 'Juan Lema') }}
          </span>
        </div>

        <!-- Título -->
        <span class="text-h6 text-white">
          {{ api.title }}
        </span>

        <!-- Tipo -->
        <q-badge unelevated color="white" style="border-radius: 8px">
          <span class="text-accentitems q-px-sm q-py-xs" style="font-size: 1vmax">{{
            api.type
          }}</span>
        </q-badge>

        <!-- Corazón -->
        <q-icon name="eva-heart-outline" color="accentitems" size="md" class="heart-icon" />

        <!-- Precio -->
        <q-badge unelevated color="primary" style="border-radius: 8px">
          <q-icon name="attach_money" color="white" size="sm" />
          <span class="text-white q-py-xs" style="font-size: 1vmax">{{ api.price }}</span>
        </q-badge>

        <!-- Rating -->
        <div class="row items-center q-gutter-xs">
          <q-icon
            v-for="n in stars.full"
            :key="'full-' + n"
            name="star"
            color="yellow-7"
            size="sm"
          />
          <q-icon v-if="stars.half" name="star_half" color="yellow-7" size="sm" />
          <q-icon
            v-for="n in stars.empty"
            :key="'empty-' + n"
            name="star_outline"
            color="grey-5"
            size="sm"
          />
          <span class="text-white text-caption q-ml-xs"> ({{ api.rating_average }}) </span>
        </div>
      </div>

      <q-btn
        style="padding: 0 30px 0 30px; font-size: 0.6vmax; border-radius: 10px"
        dense
        no-caps
        flat
        color="white"
        label="volver atras"
        @click="$router.go(-1)"
        icon="arrow_back"
      />
    </div>

    <!-- Resumen corto -->
    <div class="row q-pt-md">
      <span class="text-subtitle1 text-weight-light text-accentitems">
        {{ api.short_summary }}
      </span>
    </div>

    <!-- Technology Stack -->
    <div class="column q-pt-xl">
      <span class="text-white text-weight-medium q-mb-sm" style="font-size: 1vmax">
        Technology Stack
      </span>

      <div class="row q-gutter-md">
        <div
          v-for="tech in parsedStack"
          :key="tech"
          class="column items-center cursor-pointer"
          style="width: 35px"
        >
          <q-icon :class="getTechIcon(tech)" style="font-size: 24px" color="accentitems" />
          <q-tooltip class="bg-primary text-white" anchor="bottom middle" self="top middle">
            {{ tech }}
          </q-tooltip>
        </div>
      </div>
    </div>

    <!-- README Section -->
    <div class="column q-pt-xl q-mt-lg readme-section">
      <span class="text-white text-weight-medium q-mb-md" style="font-size: 1vmax"> README </span>
      <div class="readme-content markdown-body" v-html="renderedMarkdown"></div>
    </div>
  </div>

  <!-- Skeleton Loading -->
  <div v-else>
    <!-- Header skeleton -->
    <div class="row flex q-gutter-md skeleton-header" style="align-items: center">
      <!-- Avatar skeleton -->
      <div
        class="skeleton-item skeleton-circle"
        style="width: 40px; height: 40px; border-radius: 50px"
      ></div>

      <!-- Título skeleton -->
      <div class="skeleton-item skeleton-title" style="width: 200px; height: 24px"></div>

      <!-- Tipo skeleton -->
      <div class="skeleton-item" style="width: 80px; height: 24px; border-radius: 8px"></div>

      <!-- Corazón skeleton -->
      <div class="skeleton-item" style="width: 24px; height: 24px"></div>

      <!-- Precio skeleton -->
      <div class="skeleton-item" style="width: 80px; height: 24px; border-radius: 8px"></div>

      <!-- Rating skeleton -->
      <div class="skeleton-item" style="width: 150px; height: 20px"></div>
    </div>

    <!-- Resumen skeleton -->
    <div class="q-pt-md">
      <div class="skeleton-item" style="width: 100%; height: 16px; margin-bottom: 8px"></div>
      <div class="skeleton-item" style="width: 95%; height: 16px; margin-bottom: 8px"></div>
      <div class="skeleton-item" style="width: 85%; height: 16px"></div>
    </div>

    <!-- Technology Stack skeleton -->
    <div class="column q-pt-xl">
      <!-- Título stack -->
      <div class="skeleton-item" style="width: 150px; height: 16px; margin-bottom: 16px"></div>

      <!-- Iconos skeleton -->
      <div class="row q-gutter-md">
        <div
          v-for="n in 8"
          :key="'tech-skeleton-' + n"
          class="column items-center"
          style="width: 35px"
        >
          <div class="skeleton-item skeleton-circle" style="width: 35px; height: 35px"></div>
          <div
            class="skeleton-item skeleton-circle"
            style="width: 20px; height: 8px; margin-top: 8px"
          ></div>
        </div>
      </div>
    </div>

    <!-- README Skeleton -->
    <div class="column q-pt-xl q-mt-lg">
      <div class="skeleton-item" style="width: 100px; height: 16px; margin-bottom: 20px"></div>
      <div class="skeleton-item" style="width: 100%; height: 12px; margin-bottom: 12px"></div>
      <div class="skeleton-item" style="width: 100%; height: 12px; margin-bottom: 12px"></div>
      <div class="skeleton-item" style="width: 90%; height: 12px; margin-bottom: 20px"></div>
      <div class="skeleton-item" style="width: 100%; height: 12px; margin-bottom: 12px"></div>
      <div class="skeleton-item" style="width: 95%; height: 12px"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'
import { marked } from 'marked'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
})

const apisStore = useApisStore()
const $q = useQuasar()

const apiOverview = ref(null)
const apiCargada = ref(false)

onMounted(async () => {
  try {
    $q.loading.show()
    apiOverview.value = await apisStore.consultarApiOverview(props.apiId)
    apiCargada.value = true
  } catch (error) {
    console.error('Error fetching API overview:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load API overview. Please try again later.',
    })
  } finally {
    $q.loading.hide()
  }
})

const api = computed(() => apiOverview.value || {})

function getInitials(cadena) {
  if (!cadena) return ''
  return cadena.slice(0, 2).toUpperCase()
}

function getStars(rating, maxStars = 5) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0)
  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars,
  }
}

const stars = computed(() => getStars(Number(api.value.rating_average)))

const parsedStack = computed(() =>
  api.value.technology_stack ? api.value.technology_stack.split(',').map((t) => t.trim()) : [],
)

const renderedMarkdown = computed(() => {
  if (!api.value.readme) return '<p class="text-grey-6">No README available</p>'
  return marked(api.value.readme, {
    breaks: true,
    gfm: true,
  })
})

const techIcons = {
  'Node.js': 'fab fa-node-js',
  Node: 'fab fa-node-js',
  Express: 'fas fa-server',
  React: 'fab fa-react',
  Vue: 'fab fa-vuejs',
  Angular: 'fab fa-angular',
  'Next.js': 'fas fa-forward',
  Nuxt: 'fas fa-leaf',
  Python: 'fab fa-python',
  Django: 'fas fa-feather',
  Flask: 'fas fa-flask',
  Java: 'fab fa-java',
  Spring: 'fas fa-seedling',
  PHP: 'fab fa-php',
  Laravel: 'fab fa-laravel',
  'C#': 'fas fa-code',
  '.NET': 'fas fa-network-wired',
  HTML: 'fab fa-html5',
  CSS: 'fab fa-css3-alt',
  JavaScript: 'fab fa-js-square',
  TypeScript: 'fab fa-js',
  Tailwind: 'fas fa-wind',
  Bootstrap: 'fab fa-bootstrap',
  PostgreSQL: 'fas fa-database',
  MySQL: 'fas fa-database',
  MongoDB: 'fas fa-leaf',
  Redis: 'fas fa-memory',
  AWS: 'fab fa-aws',
  Firebase: 'fas fa-fire',
  Docker: 'fab fa-docker',
  Kubernetes: 'fas fa-project-diagram',
  OpenWeatherMap: 'fas fa-cloud-sun-rain',
  API: 'fas fa-code-branch',
  GitHub: 'fab fa-github',
  GitLab: 'fab fa-gitlab',
  Bitbucket: 'fab fa-bitbucket',
}

function getTechIcon(tech) {
  return techIcons[tech] || 'fas fa-code'
}
</script>

<style lang="scss" scoped>
.avatar-circle {
  font-size: 14px;
  text-transform: uppercase;
}

.cursor-pointer {
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }
}

// Skeleton Styles
.skeleton-item {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}

.skeleton-circle {
  border-radius: 50% !important;
}

.skeleton-title {
  border-radius: 6px;
}

.skeleton-header {
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    .skeleton-item {
      &:nth-child(3),
      &:nth-child(5) {
        flex: 0 0 calc(50% - 6px);
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Estados de carga
.q-pt-md {
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

// README Styles
.readme-section {
  border-top: 1px solid #2a2a2a;
}

.readme-content {
  background: #0d0d0d;
  border-radius: 10px;
  padding: 24px;
  overflow-x: auto;
  max-width: 100%;

  &:deep() {
    // Headings
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #ffffff;
      font-weight: 600;
      margin-top: 20px;
      margin-bottom: 12px;
      border-bottom: 1px solid #2a2a2a;
      padding-bottom: 8px;

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

    // Paragraphs
    p {
      color: #b0b0b0;
      line-height: 1.8;
      margin-bottom: 16px;
      font-size: 14px;
    }

    // Links
    a {
      color: #00a8a8;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        text-decoration: underline;
        color: #00d4d4;
      }
    }

    // Code blocks
    pre {
      background: #0f0f0f;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 16px;
      font-family: 'Monaco', 'Courier New', monospace;

      code {
        color: #00a8a8;
        font-size: 12px;
      }
    }

    // Inline code
    code {
      background: #252525;
      color: #00a8a8;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
    }

    // Lists
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

    ul {
      list-style-type: disc;
    }

    ol {
      list-style-type: decimal;
    }

    // Blockquotes
    blockquote {
      background: rgba(0, 168, 168, 0.05);
      border-left: 4px solid #00a8a8;
      color: #b0b0b0;
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 4px;
      font-style: italic;
      font-size: 14px;

      p {
        margin: 0;
      }
    }

    // Tables
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;

      thead {
        background: #252525;

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
          border-bottom: 1px solid #2a2a2a;

          &:hover {
            background: rgba(0, 168, 168, 0.05);
          }

          td {
            color: #b0b0b0;
            padding: 12px;
          }
        }
      }
    }

    // Horizontal rule
    hr {
      border: none;
      border-top: 1px solid #2a2a2a;
      margin: 24px 0;
    }

    // Images
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    // Strong and emphasis
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

// Responsive
@media (max-width: 768px) {
  .readme-content {
    padding: 16px;

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
</style>
