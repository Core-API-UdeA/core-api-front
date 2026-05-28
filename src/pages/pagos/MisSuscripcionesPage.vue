<template>
  <q-page class="bg-bgpage q-pa-lg">
    <MisSuscripciones />
  </q-page>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const MisSuscripciones = defineAsyncComponent(
  () => import('src/components/pagos/MisSuscripciones.vue')
)
</script>
