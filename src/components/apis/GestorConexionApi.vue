<template>
  <div class="gestor-conexion-container">
    <!-- Estado: cargando -->
    <div v-if="cargando" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
      <p class="text-grey-4 q-mt-md">Cargando configuración de conexión...</p>
    </div>

    <!-- Estado: conexión existente (vista resumen + edición) -->
    <q-card
      v-else-if="conexionExistente && !modoEdicion"
      flat
      class="resumen-card"
    >
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="link" color="primary" size="md" />
            <div>
              <div class="text-h6 text-white text-weight-medium">
                Configuración de conexión
              </div>
              <div class="text-caption text-grey-4">
                Estos son los datos con los que CoreAPI se conecta a tu servicio.
              </div>
            </div>
          </div>

          <!-- Status badge -->
          <q-badge
            :color="colorStatus"
            class="status-badge"
            outline
          >
            <q-icon :name="iconStatus" size="xs" class="q-mr-xs" />
            <span class="text-uppercase text-weight-medium" style="font-size: 11px">
              {{ labelStatus }}
            </span>
          </q-badge>
        </div>

        <!-- Datos actuales -->
        <div class="datos-grid q-mb-md">
          <div class="dato-item">
            <span class="dato-label">Base URL</span>
            <span class="dato-valor text-white">{{ conexionExistente.base_url }}</span>
          </div>

          <div class="dato-item">
            <span class="dato-label">Tipo de Auth</span>
            <span class="dato-valor text-white">{{ formatearAuthType(conexionExistente.auth_type) }}</span>
          </div>

          <div class="dato-item">
            <span class="dato-label">Health check</span>
            <span class="dato-valor text-white">
              {{ conexionExistente.health_check_method || 'GET' }}
              {{ conexionExistente.health_check_endpoint || '/' }}
            </span>
          </div>

          <div v-if="conexionExistente.last_checked_at" class="dato-item">
            <span class="dato-label">Última verificación</span>
            <span class="dato-valor text-white">{{ formatearFecha(conexionExistente.last_checked_at) }}</span>
          </div>

          <div v-if="conexionExistente.last_check_latency_ms" class="dato-item">
            <span class="dato-label">Latencia</span>
            <span class="dato-valor text-white">{{ conexionExistente.last_check_latency_ms }}ms</span>
          </div>

          <div v-if="conexionExistente.auth_type !== 'none'" class="dato-item">
            <span class="dato-label">Credencial</span>
            <span class="dato-valor text-grey-4 text-italic">
              <q-icon name="lock" size="xs" class="q-mr-xs" />
              Cifrada (oculta por seguridad)
            </span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="row q-gutter-sm justify-end">
          <q-btn
            label="Probar conexión"
            color="grey-5"
            outline
            no-caps
            icon="play_circle"
            :loading="loadingTest"
            @click="probarConexionActual"
          />
          <q-btn
            label="Editar configuración"
            color="primary"
            no-caps
            icon="edit"
            @click="iniciarEdicion"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Estado: sin conexión o en edición → mostrar formulario -->
    <div v-else>
      <q-banner
        v-if="!conexionExistente"
        class="q-mb-md sin-conexion-banner"
        dense
      >
        <template v-slot:avatar>
          <q-icon name="info" color="primary" />
        </template>
        <div class="text-white text-weight-medium">
          Tu API aún no tiene conexión configurada
        </div>
        <div class="text-grey-4 text-caption q-mt-xs">
          Configura cómo CoreAPI se conectará con tu servicio para que el gateway pueda
          enrutar las solicitudes de los consumidores.
        </div>
      </q-banner>

      <FormularioConexionApi
        :api-id="apiId"
        :datos-iniciales="conexionExistente"
        :modo-edicion="!!conexionExistente"
        @success="onConexionGuardada"
        @cancel="onCancelarEdicion"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { axiosInstance } from 'boot/axios'
import { useGatewayStore } from 'src/stores/gateway-store.js'

const FormularioConexionApi = defineAsyncComponent(
  () => import('src/components/apis/FormularioConexionApi.vue')
)

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['conexion-actualizada'])

const $q = useQuasar()
const gatewayStore = useGatewayStore()

// ─── State ────────────────────────────────────────────────────────────────────
const cargando = ref(true)
const conexionExistente = ref(null)
const modoEdicion = ref(false)
const loadingTest = ref(false)

// ─── Computed ─────────────────────────────────────────────────────────────────

const colorStatus = computed(() => {
  if (!conexionExistente.value) return 'grey-5'
  const s = conexionExistente.value.status
  if (s === 'active') return 'positive'
  if (s === 'failed') return 'negative'
  return 'warning' // pending
})

const iconStatus = computed(() => {
  if (!conexionExistente.value) return 'help_outline'
  const s = conexionExistente.value.status
  if (s === 'active') return 'verified'
  if (s === 'failed') return 'error'
  return 'pending' // pending
})

const labelStatus = computed(() => {
  if (!conexionExistente.value) return 'Sin configurar'
  const s = conexionExistente.value.status
  if (s === 'active') return 'Activa'
  if (s === 'failed') return 'Falló verificación'
  return 'Pendiente'
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await cargarConexion()
})

// ─── Methods ──────────────────────────────────────────────────────────────────

async function cargarConexion() {
  cargando.value = true
  try {
    // Endpoint que devuelve la conexión actual (sin la credencial cifrada)
    const response = await axiosInstance.get(`/gateway/conexion/${props.apiId}`)
    const ejec = response.data?.ejecucion

    if (ejec?.respuesta?.estado === 'OK' && ejec.data) {
      conexionExistente.value = ejec.data
    } else {
      conexionExistente.value = null
    }
  } catch (error) {
    // Si es 404 → no hay conexión todavía (está bien)
    if (error.response?.status === 404) {
      conexionExistente.value = null
    } else {
      console.error('Error al cargar conexión:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar la configuración de conexión.',
        icon: 'error',
        position: 'top',
      })
    }
  } finally {
    cargando.value = false
  }
}

function iniciarEdicion() {
  modoEdicion.value = true
}

function onCancelarEdicion() {
  modoEdicion.value = false
}

async function onConexionGuardada(resultado) {
  modoEdicion.value = false
  await cargarConexion()
  emit('conexion-actualizada', resultado)
}

async function probarConexionActual() {
  if (!conexionExistente.value) return

  loadingTest.value = true
  try {
    // Probamos sin enviar credencial (el back usa la cifrada)
    const resultado = await gatewayStore.verificarConexion(
      {
        baseUrl: conexionExistente.value.base_url,
        authType: conexionExistente.value.auth_type,
        credential: null, // el back resolverá con la credencial cifrada si la hay
        apiKeyHeaderName: conexionExistente.value.api_key_header_name,
        healthCheckEndpoint: conexionExistente.value.health_check_endpoint,
        healthCheckMethod: conexionExistente.value.health_check_method,
      },
      props.apiId
    )

    $q.notify({
      type: resultado.ok ? 'positive' : 'warning',
      message: resultado.ok
        ? `Conexión exitosa · HTTP ${resultado.statusCode} · ${resultado.latencyMs}ms`
        : `Conexión fallida · ${resultado.error || `HTTP ${resultado.statusCode}`}`,
      icon: resultado.ok ? 'check_circle' : 'warning',
      position: 'top',
    })

    // Recargar para mostrar el nuevo status
    await cargarConexion()
    emit('conexion-actualizada', resultado)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al verificar la conexión.',
      icon: 'error',
      position: 'top',
    })
  } finally {
    loadingTest.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatearAuthType(authType) {
  const labels = {
    bearer: 'Bearer Token',
    api_key: 'API Key',
    oauth2: 'OAuth 2.0',
    none: 'Sin autenticación',
  }
  return labels[authType] || authType
}

function formatearFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
</script>

<style lang="scss" scoped>
.gestor-conexion-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.resumen-card {
  background: linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 100%);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.4);
}

.datos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(0, 168, 168, 0.1);
}

.dato-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dato-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #b0bec5; // gris claro legible sobre fondo oscuro
}

.dato-valor {
  font-size: 14px;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  word-break: break-all;
}

.sin-conexion-banner {
  background: rgba(0, 168, 168, 0.08);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 12px;
}
</style>
