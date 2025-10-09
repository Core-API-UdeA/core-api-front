<template>
  <div class="fullscreen bg-dark text-white flex flex-center">
    <q-spinner color="white" size="40px" />
    <span class="q-ml-md">Conectando con GitHub...</span>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'
import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

onMounted(async () => {
  const code = route.query.code

  if (!code) {
    $q.notify({
      color: 'negative',
      message: 'No se recibió el código de autenticación de GitHub.',
      icon: 'warning',
    })
    router.push('/')
    return
  }

  try {
    await authStore.githubLogin(code)
    router.push('/main')
  } catch (err) {
    console.error('Error en GitHub callback:', err)
    $q.notify({
      color: 'negative',
      message: 'Error al autenticar con GitHub.',
      icon: 'warning',
    })
    router.push('/')
  }
})
</script>
