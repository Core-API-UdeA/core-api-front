<template>
  <q-page class="bg-bgpage">
    <q-tabs
      v-model="tab"
      class="text-white"
      style="display: flex; justify-content: start !important"
      dense
    >
      <q-tab name="Overview"      label="Overview"       class="q-ml-sm" no-caps />
      <q-tab name="Documentation" label="Documentation"  no-caps />
      <q-tab name="Pricing"       label="Pricing"        no-caps />
      <q-tab name="Conection"     label="Conection"      no-caps />
      <q-tab v-if="esOwner" name="Metricas" no-caps>
        <div class="row items-center q-gutter-xs">
          <q-icon name="show_chart" size="xs" />
          <span>Métricas</span>
        </div>
      </q-tab>
    </q-tabs>

    <div class="q-pa-sm">
      <ApiOverview
        v-if="tab === 'Overview'"
        :apiId="apiId"
        @owner="getOwner"
      />
    </div>

    <div class="q-pa-sm">
      <ApiDocumentation
        v-if="tab === 'Documentation'"
        :apiId="apiId"
        :owner="owner"
      />
    </div>

    <div class="q-pa-md" v-if="tab === 'Pricing'">
      <ApiPricingPlans
        :api-id="apiId"
        :plans="apiPlans"
        :user-subscriptions="userSubscriptions"
        :owner="owner"
        @plan-selected="handlePlanSelected"
        @plans-updated="recargarPlanes"
      />
    </div>

    <div class="q-pa-md" v-if="tab === 'Conection'">
      <ApiConection
        v-if="apiSlug"
        :api-id="apiId"
        :api-slug="apiSlug"
      />
      <div v-else class="text-center q-pa-xl">
        <q-icon name="warning" size="48px" color="warning" />
        <p class="text-grey-5 q-mt-md">
          Esta API aún no tiene conexión configurada.<br/>
          <span v-if="esOwner">Ve a <strong>Mis APIs</strong> y completa el paso de conexión.</span>
        </p>
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

const ApiOverview      = defineAsyncComponent(() => import('src/components/apis/ApiOverview.vue'))
const ApiPricingPlans  = defineAsyncComponent(() => import('src/components/pagos/ApiPricingPlans.vue'))
const ApiDocumentation = defineAsyncComponent(() => import('src/components/apis/ApiDocumentation.vue'))
const ApiMetricas      = defineAsyncComponent(() => import('src/components/apis/ApiMetricas.vue'))
const ApiConection     = defineAsyncComponent(() => import('src/components/apis/ApiConection.vue'))

const route = useRoute()
const $q    = useQuasar()

const tab               = ref('Overview')
const apiPlans          = ref([])
const userSubscriptions = ref([])
const owner             = ref(null)
const esOwner           = ref(false)
const apiSlug           = ref(null)

const apiId = computed({
  get() { return window.atob(route.params.id) || null },
})

const apisStore  = useApisStore()
const authStore  = useAuthStore()
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
    apiSlug.value  = overview?.slug || null

    apiPlans.value = await apisStore.consultarApiPlanes(apiId.value)

    if (authStore.loggedIn) {
      await apisStore.actualizarViews(apiId.value).catch(() => {})
      await pagosStore.cargarMisSuscripciones()
      userSubscriptions.value = pagosStore.suscripciones.filter(
        sub => (sub.api_id?.id ?? sub.api_id) === apiId.value
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
        sub => (sub.api_id?.id ?? sub.api_id) === apiId.value
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
  owner.value   = ownerEmail
  esOwner.value = authStore.loggedIn && authStore.user?.email === ownerEmail
}

function handlePlanSelected(plan) {
  console.log('Plan seleccionado:', plan)
}
</script>

<style lang="scss" scoped>
:deep(.q-tabs__content) {
  display: flex;
  margin-top: 3vmax;
  justify-content: start !important;
  border-bottom: 2px solid black;
}
</style>
