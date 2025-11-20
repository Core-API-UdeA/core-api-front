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
    </q-tabs>
    <div class="q-pa-sm">
      <ApiOverview :apiId="apiId" v-if="tab === 'Overview'" @owner="getOwner" />
    </div>
    <div class="q-pa-sm">
      <ApiDocumentation :apiId="apiId" v-if="tab === 'Documentation'" :owner="owner" />
    </div>
    <div class="q-pa-md" v-if="tab === 'Pricing'">
      <ApiPricingPlans
        :api-id="apiId"
        :plans="apiPlans"
        :user-subscriptions="userSubscriptions"
        @plan-selected="handlePlanSelected"
      />
    </div>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()

const tab = ref('Overview')
const apiPlans = ref([])
const userSubscriptions = ref([])
const owner = ref(null)
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
    apiPlans.value = await apisStore.consultarApiPlanes(apiId.value)

    if (authStore.loggedIn) {
      await apisStore.actualizarViews(apiId.value).catch(() => {})

      await pagosStore.cargarMisSuscripciones()
      userSubscriptions.value = pagosStore.suscripciones.filter(
        sub => sub.api_id === apiId.value
      )
    }
  } catch (error) {
    console.error('Error al cargar API:', error)
  }
})

function getOwner(ownerD) {
  owner.value = ownerD
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
