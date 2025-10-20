<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <ListaApis />
    </div>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
const ListaApis = defineAsyncComponent(() => import('src/components/catalogo/ListaApis.vue'))
</script>

<style lang="scss" scoped></style>
