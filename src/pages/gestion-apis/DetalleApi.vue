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
import { defineAsyncComponent, computed, ref } from 'vue'
import { useRoute } from 'vue-router'

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
</script>

<style lang="scss" scoped>
:deep(.q-tabs__content) {
  display: flex;
  margin-top: 3vmax;
  justify-content: start !important;
  border-bottom: 2px solid black;
}
</style>
