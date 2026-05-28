<template>
  <q-page class="bg-bgpage">

    <!-- ─── Hero Section ──────────────────────────────────────────────────── -->
    <div class="hero-section">
      <div class="hero-bg-glow" />

      <div class="hero-content q-px-lg">
        <div class="text-center q-mb-xl">
          <div class="text-caption text-primary letter-spacing-wide q-mb-sm">
            MARKETPLACE DE APIS
          </div>
          <h1 class="hero-title text-white q-mb-md">
            Descubre APIs listas<br>
            <span class="text-primary">para usar hoy</span>
          </h1>
          <p class="hero-subtitle text-grey-4">
            Explora el catálogo, suscríbete en segundos y empieza a consumir<br>
            servicios reales a través del gateway de CoreAPI.
          </p>
        </div>

        <!-- Buscador principal -->
        <div class="search-container q-mx-auto q-mb-xl">
          <q-input
            v-model="busqueda"
            rounded outlined
            placeholder="Buscar APIs por nombre, tecnología o tipo..."
            bg-color="dark"
            color="primary"
            dark
            @keyup.enter="aplicarBusqueda"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-5" />
            </template>
            <template v-slot:append>
              <q-btn
                v-if="busqueda"
                flat round dense
                icon="close"
                color="grey-5"
                @click="busqueda = ''; aplicarBusqueda()"
              />
              <q-btn
                unelevated rounded
                color="primary"
                label="Buscar"
                no-caps
                class="q-ml-sm q-mr-xs"
                @click="aplicarBusqueda"
              />
            </template>
          </q-input>
        </div>

        <!-- Stats rápidas -->
        <div class="row justify-center q-gutter-x-xl q-mb-md">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-h5 text-primary text-weight-bold">{{ stat.value }}</div>
            <div class="text-caption text-grey-5">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Catálogo ──────────────────────────────────────────────────────── -->
    <div class="q-px-md q-pb-xl">
      <ListaApis />
    </div>

  </q-page>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useApisStore } from 'stores/apis-store.js'

const ListaApis = defineAsyncComponent(
  () => import('src/components/catalogo/ListaApis.vue')
)

const apisStore = useApisStore()
const busqueda  = ref('')

const stats = [
  { value: '3+',   label: 'APIs disponibles'  },
  { value: '100%', label: 'Certificadas'       },
  { value: '24/7', label: 'Uptime garantizado' },
]

function aplicarBusqueda() {
  apisStore.filter.asunto = busqueda.value
  apisStore.cargarApis(true)
}
</script>

<style lang="scss" scoped>
.hero-section {
  position: relative;
  padding: 60px 0 40px;
  overflow: hidden;
}

.hero-bg-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(0, 168, 168, 0.12) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
}

.search-container {
  max-width: 680px;
}

.search-container :deep(.q-field__control) {
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 168, 168, 0.3);
  &:hover { border-color: rgba(0, 168, 168, 0.6); }
}

.letter-spacing-wide {
  letter-spacing: 4px;
  font-weight: 600;
}
</style>
