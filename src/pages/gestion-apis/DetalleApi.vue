<template>
  <q-page class="bg-bgpage">
    <q-tabs
      v-model="tab"
      class="text-white"
      style="display: flex; justify-content: start !important"
      dense
    >
      <q-tab name="Overview" label="Overview" class="q-ml-sm" no-caps />
      <q-tab name="Documentation" label="Documentation" no-caps />
      <q-tab name="Pricing" label="Pricing" no-caps />
      <q-tab name="Conection" label="Conection" no-caps />
      <q-tab v-if="esOwner" name="Metricas" no-caps>
        <div class="row items-center q-gutter-xs">
          <q-icon name="show_chart" size="xs" />
          <span>Métricas</span>
        </div>
      </q-tab>
    </q-tabs>

    <div class="q-pa-sm">
      <ApiOverview v-if="tab === 'Overview'" :apiId="apiId" @owner="getOwner" />
    </div>

    <div class="q-pa-sm">
      <ApiDocumentation v-if="tab === 'Documentation'" :apiId="apiId" :owner="owner" />
    </div>

    <div class="q-pa-md" v-if="tab === 'Pricing'">
      <ApiPricingPlans
        :api-id="apiId"
        :plans="apiPlans"
        :user-subscriptions="userSubscriptions"
        :owner="owner"
        :connection-status="connectionStatus"
        @plan-selected="handlePlanSelected"
        @plans-updated="recargarPlanes"
      />
    </div>

    <!-- ── Tab Conection: subdivide en "Configurar" (owner) y "Probar" (todos) ── -->
    <div class="q-pa-md" v-if="tab === 'Conection'">
      <!-- Si es owner: muestra subtabs -->
      <div v-if="esOwner">
        <q-tabs
          v-model="subTabConexion"
          dense
          class="text-white q-mb-md sub-tabs"
          active-color="primary"
          indicator-color="primary"
          align="left"
        >
          <q-tab name="configurar" label="Configurar" icon="settings" no-caps />
          <q-tab v-if="apiSlug" name="probar" label="Probar endpoints" icon="play_circle" no-caps />
        </q-tabs>

        <!-- Subtab Configurar: gestor de conexión (crear/editar) -->
        <GestorConexionApi
          v-if="subTabConexion === 'configurar'"
          :api-id="apiId"
          @conexion-actualizada="onConexionActualizada"
        />

        <!-- Subtab Probar: tester de endpoints (igual que antes) -->
        <ApiConection
          v-else-if="subTabConexion === 'probar' && apiSlug"
          :api-id="apiId"
          :api-slug="apiSlug"
        />
      </div>

      <!-- Si NO es owner: solo el tester (comportamiento original) -->
      <div v-else>
        <ApiConection v-if="apiSlug" :api-id="apiId" :api-slug="apiSlug" />
        <div v-else class="text-center q-pa-xl">
          <q-icon name="warning" size="48px" color="warning" />
          <p class="text-grey-4 q-mt-md">Esta API aún no tiene conexión configurada.</p>
        </div>
      </div>
    </div>

    <div class="q-pa-md" v-if="tab === 'Metricas' && esOwner">
      <ApiMetricas :api-id="apiId" />
    </div>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'
import { useAuthStore } from 'stores/auth-store.js'
import { usePagosStore } from 'stores/pagos-store.js'

const ApiOverview = defineAsyncComponent(() => import('src/components/apis/ApiOverview.vue'))
const ApiPricingPlans = defineAsyncComponent(
  () => import('src/components/pagos/ApiPricingPlans.vue'),
)
const ApiDocumentation = defineAsyncComponent(
  () => import('src/components/apis/ApiDocumentation.vue'),
)
const ApiMetricas = defineAsyncComponent(() => import('src/components/apis/ApiMetricas.vue'))
const ApiConection = defineAsyncComponent(() => import('src/components/apis/ApiConection.vue'))
const GestorConexionApi = defineAsyncComponent(
  () => import('src/components/apis/GestorConexionApi.vue'),
)

const route = useRoute()
const $q = useQuasar()

const tab = ref('Overview')
const subTabConexion = ref('configurar') // 'configurar' | 'probar'
const apiPlans = ref([])
const userSubscriptions = ref([])
const owner = ref(null)
const esOwner = ref(false)
const apiSlug = ref(null)
const connectionStatus = ref(null) // 'active' | 'failed' | 'pending' | null

const apiId = computed({
  get() {
    return window.atob(route.params.id) || null
  },
})

const apisStore = useApisStore()
const authStore = useAuthStore()
const pagosStore = usePagosStore()

onMounted(async () => {
  try {
    await cargarDatosApi()
  } catch (error) {
    console.error('Error al cargar API:', error)
  }
})

async function cargarDatosApi() {
  try {
    $q.loading.show()

    // Cargar overview para obtener el slug
    const overview = await apisStore.consultarApiOverview(apiId.value)
    apiSlug.value = overview?.slug || null
    connectionStatus.value = overview?.connection?.status || null

    apiPlans.value = await apisStore.consultarApiPlanes(apiId.value)

    if (authStore.loggedIn) {
      await apisStore.actualizarViews(apiId.value).catch(() => {})
      await pagosStore.cargarMisSuscripciones()
      userSubscriptions.value = pagosStore.suscripciones.filter(
        (sub) => (sub.api_id?.id ?? sub.api_id) === apiId.value,
      )
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    $q.loading.hide()
  }
}

async function recargarPlanes() {
  try {
    $q.loading.show()
    apiPlans.value = await apisStore.consultarApiPlanes(apiId.value)
    if (authStore.loggedIn) {
      await pagosStore.cargarMisSuscripciones()
      userSubscriptions.value = pagosStore.suscripciones.filter(
        (sub) => (sub.api_id?.id ?? sub.api_id) === apiId.value,
      )
    }
  } catch (error) {
    console.error('Error al recargar planes:', error)
    $q.notify({ type: 'negative', message: 'Error al recargar los planes', icon: 'error' })
  } finally {
    $q.loading.hide()
  }
}

function getOwner(ownerEmail) {
  owner.value = ownerEmail
  esOwner.value = authStore.loggedIn && authStore.user?.email === ownerEmail
}

function handlePlanSelected(plan) {
  console.log('Plan seleccionado:', plan)
}

// Cuando se actualiza la conexión, recargamos el overview para que el badge
// "API segura" se refresque y se actualice apiSlug si la API se conectó por
// primera vez.
async function onConexionActualizada() {
  try {
    const overview = await apisStore.consultarApiOverview(apiId.value)
    apiSlug.value = overview?.slug || null
    connectionStatus.value = overview?.connection?.status || null
  } catch (error) {
    console.error('Error al recargar overview tras conexión:', error)
  }
}
</script>

<style lang="scss" scoped>
:deep(.q-tabs__content) {
  display: flex;
  margin-top: 3vmax;
  justify-content: start !important;
  border-bottom: 2px solid black;
}

.sub-tabs {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 4px 8px;
  border: 1px solid rgba(0, 168, 168, 0.15);
  max-width: max-content;
}

.sub-tabs :deep(.q-tab) {
  min-height: 36px;
  padding: 0 16px;
}
</style>
