<template>
  <div class="mis-suscripciones">
    <!-- ─── Header ─────────────────────────────────────────────────────────── -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-white text-weight-bold">Mis suscripciones</div>
        <div class="text-caption text-grey-5 q-mt-xs">
          APIs a las que tienes acceso activo a través del gateway de CoreAPI
        </div>
      </div>
      <q-btn
        unelevated
        rounded
        no-caps
        color="primary"
        label="Explorar más APIs"
        icon="explore"
        to="/"
        size="sm"
      />
    </div>

    <!-- ─── Resumen rápido ─────────────────────────────────────────────────── -->
    <div class="row q-gutter-md q-mb-xl">
      <div class="stat-pill">
        <q-icon name="check_circle" color="positive" size="sm" class="q-mr-sm" />
        <span class="text-white text-weight-medium">{{ suscripcionesActivas.length }}</span>
        <span class="text-grey-5 q-ml-xs">activas</span>
      </div>
      <div class="stat-pill">
        <q-icon name="bolt" color="primary" size="sm" class="q-mr-sm" />
        <span class="text-white text-weight-medium">{{ totalRequestsMes }}</span>
        <span class="text-grey-5 q-ml-xs">requests este mes</span>
      </div>
      <div v-if="proximaRenovacion" class="stat-pill">
        <q-icon name="event" color="warning" size="sm" class="q-mr-sm" />
        <span class="text-grey-5">Próxima renovación:</span>
        <span class="text-white q-ml-xs text-weight-medium">{{ proximaRenovacion }}</span>
      </div>
    </div>

    <!-- ─── Cargando ───────────────────────────────────────────────────────── -->
    <div v-if="cargando" class="row q-col-gutter-lg">
      <div v-for="i in 3" :key="i" class="col-12 col-md-6 col-lg-4">
        <q-card flat class="suscripcion-card">
          <q-card-section>
            <q-skeleton type="text" width="60%" class="q-mb-sm" dark />
            <q-skeleton type="text" width="40%" class="q-mb-md" dark />
            <q-skeleton type="rect" height="8px" class="q-mb-md" dark />
            <q-skeleton type="text" width="80%" dark />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ─── Sin suscripciones ──────────────────────────────────────────────── -->
    <div v-else-if="suscripcionesActivas.length === 0" class="empty-state q-py-xl text-center">
      <q-icon name="api" size="64px" color="grey-7" class="q-mb-md" />
      <div class="text-h6 text-grey-4 q-mb-sm">Aún no tienes suscripciones activas</div>
      <div class="text-grey-6 q-mb-lg">
        Explora el catálogo y suscríbete a las APIs que necesitas.
      </div>
      <q-btn
        unelevated
        rounded
        no-caps
        color="primary"
        label="Explorar catálogo de APIs"
        icon="explore"
        to="/"
        size="md"
      />
    </div>

    <!-- ─── Cards de suscripciones ─────────────────────────────────────────── -->
    <div v-else class="row q-col-gutter-lg">
      <div v-for="sub in suscripcionesActivas" :key="sub.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat class="suscripcion-card full-height column">
          <!-- ── Header ─────────────────────────────────────────────────── -->
          <q-card-section class="q-pb-sm">
            <div class="row items-start justify-between q-mb-sm">
              <div class="col" style="min-width: 0">
                <div class="text-subtitle1 text-white text-weight-bold ellipsis-2-lines">
                  {{ nombreApi(sub) }}
                </div>
                <div class="text-caption text-grey-5 q-mt-xs">
                  <q-badge
                    outline
                    color="primary"
                    :label="tipoApi(sub)"
                    class="q-mr-xs"
                    style="font-size: 10px"
                  />
                  <q-badge
                    :color="colorPlan(sub)"
                    :label="nombrePlan(sub)"
                    style="font-size: 10px"
                  />
                </div>
              </div>
              <q-chip
                :color="colorEstado(sub.status)"
                text-color="white"
                dense
                class="q-ml-sm estado-chip"
              >
                <q-icon :name="iconoEstado(sub.status)" size="xs" class="q-mr-xs" />
                {{ labelEstado(sub.status) }}
              </q-chip>
            </div>
          </q-card-section>

          <!-- ── Barra de cuota ──────────────────────────────────────────── -->
          <q-card-section class="q-pt-xs q-pb-sm">
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption text-grey-5">
                <q-icon name="bolt" size="xs" color="primary" class="q-mr-xs" />
                Requests este mes
              </span>
              <span class="text-caption text-weight-bold" :class="colorTextoUso(sub)">
                {{ sub.requests_used_this_month || 0 }}
                <span v-if="limiteRequests(sub)" class="text-grey-6">
                  / {{ formatearNumero(limiteRequests(sub)) }}
                </span>
                <span v-else class="text-grey-6"> / ∞</span>
              </span>
            </div>
            <q-linear-progress
              :value="porcentajeUso(sub)"
              :color="colorBarra(sub)"
              track-color="grey-9"
              rounded
              size="8px"
              class="q-mb-xs"
            />
            <div
              v-if="porcentajeUso(sub) >= 0.8"
              class="text-caption q-mt-xs"
              :class="porcentajeUso(sub) >= 1 ? 'text-negative' : 'text-warning'"
            >
              <q-icon
                :name="porcentajeUso(sub) >= 1 ? 'block' : 'warning'"
                size="xs"
                class="q-mr-xs"
              />
              {{
                porcentajeUso(sub) >= 1 ? 'Cuota agotada — upgrade tu plan' : 'Cuota casi agotada'
              }}
            </div>
          </q-card-section>

          <!-- ── Detalles ────────────────────────────────────────────────── -->
          <q-card-section class="q-pt-xs q-pb-sm">
            <div class="row q-gutter-x-md">
              <div class="col">
                <div class="text-caption text-grey-6">Vence el</div>
                <div
                  class="text-caption text-weight-medium"
                  :class="sub.end_date ? 'text-white' : 'text-positive'"
                >
                  {{ sub.end_date ? formatearFecha(sub.end_date) : 'Sin vencimiento' }}
                </div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6">Hoy</div>
                <div class="text-caption text-white text-weight-medium">
                  {{ sub.requests_used_this_day || 0 }} requests
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- ── API KEY SECTION ────────────────────────────────────────── -->
          <q-card-section class="q-pt-xs q-pb-sm">
            <div class="apikey-box">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center q-gutter-xs">
                  <q-icon name="key" color="primary" size="sm" />
                  <span
                    class="text-caption text-grey-4 text-weight-bold"
                    style="letter-spacing: 2px"
                  >
                    API KEY
                  </span>
                </div>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    round
                    dense
                    size="xs"
                    icon="content_copy"
                    color="grey-4"
                    @click="copiarKey(sub)"
                  >
                    <q-tooltip class="bg-dark text-white" anchor="top middle" self="bottom middle">
                      Copiar API Key
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    size="xs"
                    :icon="keyVisible[sub.id] ? 'visibility_off' : 'visibility'"
                    color="grey-4"
                    @click="toggleVisible(sub.id)"
                  >
                    <q-tooltip class="bg-dark text-white" anchor="top middle" self="bottom middle">
                      {{ keyVisible[sub.id] ? 'Ocultar' : 'Mostrar' }} key
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    dense
                    size="xs"
                    icon="refresh"
                    color="warning"
                    :loading="regenerando[sub.id]"
                    @click="confirmarRegenerar(sub)"
                  >
                    <q-tooltip class="bg-dark text-white" anchor="top middle" self="bottom middle">
                      Regenerar API Key
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- El valor de la key -->
              <div class="apikey-value-row">
                <code class="apikey-value" :class="{ 'apikey-masked': !keyVisible[sub.id] }">
                  {{ keyVisible[sub.id] ? sub.api_key || '—' : maskKey(sub.api_key) }}
                </code>
              </div>

              <!-- Ejemplo de uso rápido -->
              <q-expansion-item
                dense
                flat
                label="Ver ejemplo de uso"
                header-class="text-primary text-caption q-px-none q-pt-sm"
                expand-icon-class="text-primary"
              >
                <div class="ejemplo-box q-mt-sm">
                  <div class="text-caption text-grey-5 q-mb-xs">cURL</div>
                  <code class="ejemplo-code"
                    >curl -H "X-Api-Key: {{ maskKey(sub.api_key) }}" \ "{{
                      baseGatewayUrl
                    }}/gateway/{{ slugApi(sub) }}/TU_RUTA"</code
                  >
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="xs"
                    icon="content_copy"
                    color="primary"
                    label="Copiar ejemplo"
                    @click="copiarEjemplo(sub)"
                    class="q-mt-xs"
                  />
                </div>
              </q-expansion-item>

              <!-- SDK Snippets -->
              <q-expansion-item
                dense
                flat
                label="Ver código SDK"
                header-class="text-primary text-caption q-px-none q-pt-xs"
                expand-icon-class="text-primary"
                @before-show="cargarEndpointsParaSnippets(sub)"
              >
                <div class="q-mt-sm">
                  <SdkSnippets :suscripcion="sub" :endpoints="endpointsPorSub[sub.id] || []" />
                </div>
              </q-expansion-item>
            </div>
          </q-card-section>

          <!-- ── Acciones ────────────────────────────────────────────────── -->
          <q-space />
          <q-separator dark />
          <q-card-actions class="q-px-md q-py-sm">
            <q-btn
              unelevated
              rounded
              no-caps
              color="primary"
              icon="play_arrow"
              label="Usar API"
              size="sm"
              class="col"
              @click="irAlTester(sub)"
            />
            <q-btn
              flat
              rounded
              no-caps
              color="grey-4"
              icon="description"
              label="Docs"
              size="sm"
              @click="irAlDetalle(sub)"
            />
            <q-btn
              flat
              rounded
              no-caps
              color="orange-4"
              size="sm"
              :loading="generandoPostman"
              @click="descargarPostman(sub)"
            >
              <q-icon
                name="img:https://www.svgrepo.com/show/354202/postman-icon.svg"
                size="18px"
                class="q-mr-xs"
              />
              Postman
              <q-tooltip class="bg-dark text-white" anchor="top middle" self="bottom middle">
                Descargar colección de Postman con tu API Key ya configurada
              </q-tooltip>
            </q-btn>
            <q-btn flat round dense color="grey-6" icon="more_vert" size="sm">
              <q-menu dark>
                <q-list dense style="min-width: 160px">
                  <q-item clickable v-close-popup @click="irAlPricing(sub)">
                    <q-item-section avatar>
                      <q-icon name="upgrade" color="primary" size="xs" />
                    </q-item-section>
                    <q-item-section class="text-grey-4">Cambiar plan</q-item-section>
                  </q-item>
                  <q-separator dark />
                  <q-item clickable v-close-popup @click="confirmarCancelar(sub)">
                    <q-item-section avatar>
                      <q-icon name="cancel" color="negative" size="xs" />
                    </q-item-section>
                    <q-item-section class="text-negative">Cancelar suscripción</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- ─── Dialog: Confirmar cancelar ────────────────────────────────────── -->
    <q-dialog v-model="dialogCancelar" persistent>
      <q-card dark style="min-width: 350px; border-radius: 16px">
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="md" class="q-mr-sm" />
          <span class="text-h6 text-white">Cancelar suscripción</span>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-4">
            ¿Seguro que quieres cancelar tu suscripción a
            <strong class="text-white">{{
              subAcancelar?.api_name || nombreApi(subAcancelar)
            }}</strong
            >?
          </p>
          <p class="text-caption text-grey-6">
            Perderás el acceso al gateway y tu API Key quedará invalidada.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="No, mantener" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Sí, cancelar"
            color="negative"
            :loading="cancelando"
            @click="ejecutarCancelar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ─── Dialog: Confirmar regenerar key ───────────────────────────────── -->
    <q-dialog v-model="dialogRegenerar" persistent>
      <q-card dark style="min-width: 380px; border-radius: 16px">
        <q-card-section class="row items-center">
          <q-icon name="refresh" color="warning" size="md" class="q-mr-sm" />
          <span class="text-h6 text-white">Regenerar API Key</span>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-4">
            Se generará una nueva API Key para
            <strong class="text-white">{{ nombreApi(subARegenerar) }}</strong
            >.
          </p>
          <q-banner class="bg-negative text-white q-mt-sm" dense rounded>
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            La key anterior quedará <strong>invalidada inmediatamente</strong>. Cualquier
            integración que la use dejará de funcionar.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancelar" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Sí, regenerar"
            color="warning"
            text-color="dark"
            :loading="regenerando[subARegenerar?.id]"
            @click="ejecutarRegenerar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePagosStore } from 'stores/pagos-store.js'
import { useApisStore } from 'stores/apis-store.js'
import { axiosInstance } from 'boot/axios.js'
import { usePostmanCollection } from 'src/composables/usePostmanCollection.js'
import SdkSnippets from 'src/components/pagos/SdkSnippets.vue'

const router = useRouter()
const $q = useQuasar()
const apisStore = useApisStore()
const pagosStore = usePagosStore()
const { generarYDescargar, generando: generandoPostman } = usePostmanCollection()

// ─── State ────────────────────────────────────────────────────────────────
const cargando = ref(true)
const keyVisible = reactive({})
const regenerando = reactive({})
const dialogCancelar = ref(false)
const dialogRegenerar = ref(false)
const subAcancelar = ref(null)
const subARegenerar = ref(null)
const cancelando = ref(false)
const endpointsPorSub = reactive({})

const baseGatewayUrl = window.location.origin.includes('localhost')
  ? 'http://localhost:1337/scapi'
  : window.location.origin + '/scapi'

// ─── Computed ─────────────────────────────────────────────────────────────
const suscripcionesActivas = computed(() => pagosStore.suscripcionesActivas)

const totalRequestsMes = computed(() =>
  suscripcionesActivas.value.reduce((a, s) => a + (s.requests_used_this_month || 0), 0),
)

const proximaRenovacion = computed(() => {
  const con = suscripcionesActivas.value
    .filter((s) => s.end_date && s.auto_renew)
    .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
  return con.length ? formatearFecha(con[0].end_date) : null
})

// ─── Lifecycle ────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await pagosStore.cargarMisSuscripciones('active')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al cargar suscripciones', icon: 'error' })
  } finally {
    cargando.value = false
  }
})

// ─── Helpers de datos ─────────────────────────────────────────────────────
function nombreApi(sub) {
  return sub?.api_id?.title || sub?.api_name || 'API'
}
function tipoApi(sub) {
  return sub?.api_id?.type || 'REST'
}
function nombrePlan(sub) {
  return sub?.plan_id?.name || sub?.plan_name || 'Plan'
}
function slugApi(sub) {
  return sub?.api_id?.slug || 'api-slug'
}
function limiteRequests(sub) {
  return sub?.plan_id?.max_requests_per_month ?? null
}

function porcentajeUso(sub) {
  const usado = sub?.requests_used_this_month || 0
  const lim = limiteRequests(sub)
  return lim ? Math.min(usado / lim, 1) : 0
}
function colorBarra(sub) {
  const p = porcentajeUso(sub)
  return p >= 1 ? 'negative' : p >= 0.8 ? 'warning' : 'primary'
}
function colorTextoUso(sub) {
  const p = porcentajeUso(sub)
  return p >= 1 ? 'text-negative' : p >= 0.8 ? 'text-warning' : 'text-white'
}
function colorEstado(s) {
  return (
    { active: 'positive', cancelled: 'negative', expired: 'grey-6', pending: 'warning' }[s] ||
    'grey-6'
  )
}
function iconoEstado(s) {
  return (
    {
      active: 'check_circle',
      cancelled: 'cancel',
      expired: 'schedule',
      pending: 'hourglass_empty',
    }[s] || 'help'
  )
}
function labelEstado(s) {
  return (
    { active: 'Activa', cancelled: 'Cancelada', expired: 'Expirada', pending: 'Pendiente' }[s] || s
  )
}
function colorPlan(sub) {
  return parseFloat(sub?.plan_id?.price ?? sub?.price ?? 0) === 0 ? 'teal' : 'primary'
}
function formatearFecha(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
function formatearNumero(n) {
  return Number(n).toLocaleString('es-CO')
}

// ─── SDK Snippets: cargar endpoints ──────────────────────────────────────
async function cargarEndpointsParaSnippets(sub) {
  const subId = sub.id
  // Guard: !== undefined para no recargar aunque el resultado sea []
  if (endpointsPorSub[subId] !== undefined) return

  const apiId = sub.api_id?.id ?? sub.api_id
  try {
    const doc = await apisStore.consultarApiDocumentation(apiId)
    // El back retorna: { api_id, title, documentation: [...endpoints] }
    endpointsPorSub[subId] = doc?.documentation ?? []
  } catch {
    endpointsPorSub[subId] = []
  }
}

// ─── API Key: visibilidad ─────────────────────────────────────────────────
function toggleVisible(subId) {
  keyVisible[subId] = !keyVisible[subId]
}

function maskKey(key) {
  if (!key) return '••••••••••••••••••••••••••••••'
  const visible = key.replace('sk_live_', '')
  return 'sk_live_' + visible.slice(0, 4) + '••••••••••••••••••••' + visible.slice(-4)
}

// ─── API Key: copiar ──────────────────────────────────────────────────────
function copiarKey(sub) {
  if (!sub.api_key) return
  navigator.clipboard.writeText(sub.api_key)
  $q.notify({
    type: 'positive',
    message: 'API Key copiada al portapapeles',
    icon: 'content_copy',
    timeout: 2000,
  })
}

function copiarEjemplo(sub) {
  if (!sub.api_key) return
  const cmd = `curl -H "X-Api-Key: ${sub.api_key}" "${baseGatewayUrl}/gateway/${slugApi(sub)}/TU_RUTA"`
  navigator.clipboard.writeText(cmd)
  $q.notify({
    type: 'positive',
    message: 'Comando copiado al portapapeles',
    icon: 'content_copy',
    timeout: 2000,
  })
}

// ─── API Key: regenerar ───────────────────────────────────────────────────
function confirmarRegenerar(sub) {
  subARegenerar.value = sub
  dialogRegenerar.value = true
}

async function ejecutarRegenerar() {
  const sub = subARegenerar.value
  if (!sub) return
  regenerando[sub.id] = true
  try {
    const response = await axiosInstance.post('/suscripciones/regenerar-api-key', {
      subscriptionId: sub.id,
    })
    const ejec = response.data?.ejecucion
    if (ejec?.respuesta?.estado === 'OK') {
      sub.api_key = ejec.data.api_key
      keyVisible[sub.id] = true
      dialogRegenerar.value = false
      $q.notify({
        type: 'positive',
        message: 'Nueva API Key generada. ¡Cópiala y úsala en tus integraciones!',
        icon: 'key',
        timeout: 5000,
        actions: [{ label: 'Copiar', color: 'white', handler: () => copiarKey(sub) }],
      })
    } else {
      throw new Error(ejec?.respuesta?.mensaje || 'Error al regenerar')
    }
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.message || 'Error al regenerar la API Key',
      icon: 'error',
    })
  } finally {
    regenerando[sub.id] = false
  }
}

// ─── Cancelar suscripción ─────────────────────────────────────────────────
function confirmarCancelar(sub) {
  subAcancelar.value = sub
  dialogCancelar.value = true
}

async function ejecutarCancelar() {
  if (!subAcancelar.value) return
  cancelando.value = true
  try {
    await pagosStore.cancelarSuscripcion(subAcancelar.value.id)
    $q.notify({ type: 'positive', message: 'Suscripción cancelada.', icon: 'check_circle' })
    dialogCancelar.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || 'Error al cancelar', icon: 'error' })
  } finally {
    cancelando.value = false
  }
}

// ─── Postman ──────────────────────────────────────────────────────────────
async function descargarPostman(sub) {
  try {
    await generarYDescargar(sub)
    $q.notify({
      type: 'positive',
      message: `Colección descargada: "CoreAPI — ${nombreApi(sub)}.postman_collection.json"`,
      icon: 'download',
      caption: 'Impórtala en Postman: File → Import',
      timeout: 5000,
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Error al generar la colección de Postman',
      icon: 'error',
    })
  }
}

// ─── Navegación ───────────────────────────────────────────────────────────
function irAlTester(sub) {
  const id = sub?.api_id?.id ?? sub?.api_id
  if (!id) return
  router.push(`/main/detalle-api/${window.btoa(String(id))}`)
}
function irAlDetalle(sub) {
  irAlTester(sub)
}
function irAlPricing(sub) {
  irAlTester(sub)
}
</script>

<style lang="scss" scoped>
/* ── Card principal ── */
.suscripcion-card {
  background: linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  transition: all 0.3s ease;
  /* Crítico para responsive: evita que el contenido interno
     (keys, código) empuje el ancho de la card fuera del grid */
  min-width: 0;
  overflow: hidden;

  &:hover {
    border-color: rgba(0, 168, 168, 0.3);
    box-shadow: 0 8px 32px rgba(0, 168, 168, 0.1);
    transform: translateY(-2px);
  }
}

.estado-chip {
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  padding: 4px 10px;
  height: auto;
  flex-shrink: 0;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 60px 20px;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── API Key ── */
.apikey-box {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  /* Contener el contenido dentro de la card */
  min-width: 0;
  overflow: hidden;
}

.apikey-value-row {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  padding: 6px 10px;
  overflow-x: auto;
  max-width: 100%;
}

.apikey-value {
  font-family: 'Consolas', 'Roboto Mono', monospace;
  font-size: 11px;
  color: #02c39a;
  letter-spacing: 0.5px;
  white-space: nowrap;
  display: block;
  max-width: 100%;
}

.apikey-masked {
  color: rgba(2, 195, 154, 0.6);
  letter-spacing: 2px;
}

.ejemplo-box {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  overflow: hidden;
}

.ejemplo-code {
  font-family: 'Consolas', 'Roboto Mono', monospace;
  font-size: 10px;
  color: #b0bec5;
  line-height: 1.8;
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}
</style>
