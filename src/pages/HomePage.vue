<template>
  <q-page class="bg-bgpage q-pa-lg">

    <!-- ─── Bienvenida personalizada ───────────────────────────────────────── -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-caption text-primary letter-spacing q-mb-xs">DASHBOARD</div>
        <h2 class="text-h4 text-white text-weight-bold q-mb-xs">
          Hola, {{ primerNombre }} 👋
        </h2>
        <p class="text-grey-5 q-mb-none">
          Aquí tienes un resumen de tu actividad en CoreAPI.
        </p>
      </div>

      <!-- Acceso rápido -->
      <div class="row q-gutter-sm">
        <q-btn
          unelevated rounded no-caps
          color="primary"
          label="Explorar APIs"
          icon="explore"
          to="/"
        />
        <q-btn
          outline rounded no-caps
          color="primary"
          label="Mis APIs"
          icon="api"
          to="/main/apis"
        />
      </div>
    </div>

    <!-- ─── Suscripciones activas ───────────────────────────────────────────── -->
    <MisSuscripciones />

  </q-page>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useAuthStore } from 'stores/auth-store.js'

const MisSuscripciones = defineAsyncComponent(
  () => import('src/components/pagos/MisSuscripciones.vue')
)

const authStore = useAuthStore()

const primerNombre = computed(() => {
  const username = authStore.user?.username || authStore.user?.email || ''
  // Tomar solo el primer nombre
  return username.split(' ')[0].split('.')[0]
})
</script>

<style lang="scss" scoped>
.letter-spacing {
  letter-spacing: 4px;
  font-weight: 600;
}
</style>
