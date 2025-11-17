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
    </q-tabs>
    <div class="q-pa-sm">
      <ApiOverview :apiId="apiId" v-if="tab === 'Overview'" />
    </div>
    <div class="q-pa-sm">
      <ApiDocumentation :apiId="apiId" v-if="tab === 'Documentation'" />
    </div>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApisStore } from 'stores/apis-store.js'
import { useAuthStore } from 'stores/auth-store.js'

const ApiOverview = defineAsyncComponent(() => import('src/components/apis/ApiOverview.vue'))
const ApiDocumentation = defineAsyncComponent(
  () => import('src/components/apis/ApiDocumentation.vue'),
)

const route = useRoute()

const tab = ref('Overview')
const apiId = computed({
  get() {
    return window.atob(route.params.id) || null
  },
})

const apisStore = useApisStore()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    if (authStore.loggedIn) {
      console.log('Estamos logged')
      await apisStore.actualizarViews(apiId.value).catch(() => {})
    }
  } catch (error) {
    console.error('Error al cargar API:', error)
  }
})
</script>

<style lang="scss" scoped>
:deep(.q-tabs__content) {
  display: flex;
  margin-top: 3vmax;
  justify-content: start !important;
  border-bottom: 2px solid black;
}
</style>
