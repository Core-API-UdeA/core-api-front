<template>
  <q-page padding>
    <ListaApis :isMine="true" />
  </q-page>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
const ListaApis = defineAsyncComponent(() => import('src/components/catalogo/ListaApis.vue'))
</script>

<style lang="scss" scoped></style>
