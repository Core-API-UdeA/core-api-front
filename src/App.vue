<template>
  <router-view />
</template>

<script setup>
import { watch } from 'vue'
import { useQuasar } from 'quasar'
import { useThemeStore } from 'stores/theme-store'

const $q = useQuasar()
const themeStore = useThemeStore()

$q.dark.set(themeStore.isDark)
watch(() => themeStore.isDark, (val) => $q.dark.set(val))
</script>
