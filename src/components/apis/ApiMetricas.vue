<template>
  <div class="metricas-container">

    <!-- Header -->
    <div class="row justify-between items-center q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <q-icon name="show_chart" color="primary" size="sm" />
        <span class="text-white text-weight-medium" style="font-size: 1.1vmax">
          Métricas de uso
        </span>
        <q-badge color="primary" class="q-ml-sm">
          Últimos {{ diasAtras }} días
        </q-badge>
      </div>

      <!-- Selector de período -->
      <q-btn-toggle
        v-model="diasAtras"
        toggle-color="primary"
        :color="$q.dark.isActive ? 'dark' : 'grey-2'"
        :text-color="$q.dark.isActive ? 'grey-5' : 'grey-8'"
        no-caps
        dense
        size="sm"
        :options="[
          { label: '7D',  value: 7 },
          { label: '30D', value: 30 },
          { label: '90D', value: 90 },
        ]"
        @update:model-value="recargarMetricas"
      />
    </div>

    <!-- Skeleton de carga -->
    <div v-if="cargando" class="row q-col-gutter-md q-mb-lg">
      <div v-for="n in 4" :key="n" class="col-md-3 col-sm-6 col-xs-12">
        <div class="kpi-card skeleton-card">
          <div class="skeleton-item" style="width: 120px; height: 14px; margin-bottom: 12px"></div>
          <div class="skeleton-item" style="width: 80px; height: 32px; margin-bottom: 8px"></div>
          <div class="skeleton-item" style="width: 60px; height: 12px"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center q-pa-xl">
      <q-icon name="error_outline" size="48px" color="negative" />
      <p class="text-grey-5 q-mt-md">{{ error }}</p>
      <q-btn label="Reintentar" color="primary" no-caps outline @click="recargarMetricas" />
    </div>

    <!-- Contenido cargado -->
    <div v-else-if="metricas">

      <!-- KPI Cards -->
      <div class="row q-col-gutter-md q-mb-lg">

        <div class="col-md-3 col-sm-6 col-xs-12">
          <div class="kpi-card">
            <div class="kpi-header">
              <q-icon name="bar_chart" color="primary" size="xs" />
              <span class="kpi-label">Total consumo</span>
            </div>
            <div class="kpi-value">{{ formatNumero(metricas.kpis.totalConsumo) }}</div>
            <div class="kpi-trend" :class="metricas.kpis.tendencias.consumo >= 0 ? 'trend-up' : 'trend-down'">
              <q-icon :name="metricas.kpis.tendencias.consumo >= 0 ? 'arrow_upward' : 'arrow_downward'" size="xs" />
              {{ Math.abs(metricas.kpis.tendencias.consumo) }}%
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 col-xs-12">
          <div class="kpi-card">
            <div class="kpi-header">
              <q-icon name="people" color="cyan-4" size="xs" />
              <span class="kpi-label">Usuarios consultando</span>
            </div>
            <div class="kpi-value">{{ formatNumero(metricas.kpis.usuariosUnicos) }}</div>
            <div class="kpi-trend" :class="metricas.kpis.tendencias.usuarios >= 0 ? 'trend-up' : 'trend-down'">
              <q-icon :name="metricas.kpis.tendencias.usuarios >= 0 ? 'arrow_upward' : 'arrow_downward'" size="xs" />
              {{ Math.abs(metricas.kpis.tendencias.usuarios) }}%
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 col-xs-12">
          <div class="kpi-card kpi-card--error">
            <div class="kpi-header">
              <q-icon name="error_outline" color="negative" size="xs" />
              <span class="kpi-label">Errores</span>
            </div>
            <div class="kpi-value">{{ formatNumero(metricas.kpis.errores) }}</div>
            <div class="kpi-trend trend-down">
              <q-icon name="arrow_upward" size="xs" />
              {{ metricas.kpis.tasaError }}%
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 col-xs-12">
          <div class="kpi-card kpi-card--warn">
            <div class="kpi-header">
              <q-icon name="timer" color="warning" size="xs" />
              <span class="kpi-label">Tiempo promedio</span>
            </div>
            <div class="kpi-value">{{ metricas.kpis.tiempoPromedio }} <span class="kpi-unit">ms</span></div>
            <div class="kpi-trend" :class="metricas.kpis.tendencias.tiempoPromedio <= 0 ? 'trend-up' : 'trend-down'">
              <q-icon :name="metricas.kpis.tendencias.tiempoPromedio <= 0 ? 'arrow_downward' : 'arrow_upward'" size="xs" />
              {{ Math.abs(metricas.kpis.tendencias.tiempoPromedio) }}%
            </div>
          </div>
        </div>

      </div>

      <!-- Gráficos principales -->
      <div class="row q-col-gutter-md q-mb-lg">

        <!-- Gráfico de requests por día -->
        <div class="col-md-8 col-xs-12">
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Requests por día</span>
              <span class="chart-subtitle text-grey-5">Últimos {{ diasAtras }} días</span>
            </div>
            <div class="chart-area" ref="chartRequestsRef"></div>
          </div>
        </div>

        <!-- Donut consumo por endpoint -->
        <div class="col-md-4 col-xs-12">
          <div class="chart-card">
            <div class="chart-header">
              <span class="chart-title">Consumo por endpoint</span>
            </div>
            <div class="donut-wrapper">
              <!-- Donut SVG manual -->
              <svg viewBox="0 0 120 120" class="donut-svg">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#1a1a1a" stroke-width="18"/>
                <circle
                  v-for="(seg, i) in donutSegmentos"
                  :key="i"
                  cx="60" cy="60" r="45"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="18"
                  :stroke-dasharray="`${seg.dash} ${283 - seg.dash}`"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="butt"
                />
                <text x="60" y="55" text-anchor="middle" class="donut-pct-text">
                  {{ donutSegmentos[0]?.pct || 0 }}%
                </text>
                <text x="60" y="70" text-anchor="middle" class="donut-label-text">
                  top endpoint
                </text>
              </svg>

              <!-- Leyenda -->
              <div class="donut-legend">
                <div
                  v-for="(seg, i) in donutSegmentos"
                  :key="i"
                  class="legend-item"
                >
                  <span class="legend-dot" :style="{ background: seg.color }"></span>
                  <span class="legend-label text-grey-4">{{ seg.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Endpoints más usados + Latencia + Regiones -->
      <div class="row q-col-gutter-md">

        <!-- Endpoints más usados -->
        <div class="col-md-6 col-xs-12">
          <div class="chart-card">
            <div class="chart-header">
              <q-icon name="http" color="primary" size="xs" class="q-mr-xs" />
              <span class="chart-title">Endpoints más usados</span>
            </div>

            <div class="endpoints-list">
              <div
                v-for="(ep, i) in metricas.endpointsMasUsados"
                :key="i"
                class="endpoint-row"
              >
                <div class="endpoint-info">
                  <q-badge
                    :color="colorMetodo(ep.method)"
                    class="method-badge"
                  >
                    {{ ep.method }}
                  </q-badge>
                  <span class="endpoint-path text-grey-3">{{ ep.path }}</span>
                </div>
                <div class="endpoint-bar-wrap">
                  <div
                    class="endpoint-bar"
                    :style="{ width: porcentajeRelativo(ep.total) + '%' }"
                  ></div>
                  <span class="endpoint-count text-grey-5">{{ formatNumero(ep.total) }}</span>
                </div>
              </div>

              <div v-if="!metricas.endpointsMasUsados.length" class="text-grey-6 text-caption q-pa-md">
                Sin datos de endpoints para este período.
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico latencia -->
        <div class="col-md-6 col-xs-12">
          <div class="chart-card">
            <div class="chart-header">
              <q-icon name="speed" color="warning" size="xs" class="q-mr-xs" />
              <span class="chart-title">Latencia promedio</span>
              <span class="chart-subtitle text-grey-5 q-ml-xs">ms por día</span>
            </div>
            <div class="chart-area" ref="chartLatenciaRef"></div>
          </div>
        </div>

        <!-- Consumo por región -->
        <div class="col-md-12 col-xs-12">
          <div class="chart-card">
            <div class="chart-header">
              <q-icon name="public" color="primary" size="xs" class="q-mr-xs" />
              <span class="chart-title">Consumo por región</span>
            </div>

            <div class="regiones-list">
              <div
                v-for="(region, i) in metricas.consumoPorRegion"
                :key="i"
                class="region-row"
              >
                <span class="region-name text-grey-3" style="min-width: 80px">
                  {{ region.region }}
                </span>
                <div class="region-bar-wrap">
                  <div
                    class="region-bar"
                    :style="{ width: porcentajeRelativoRegion(region.total) + '%' }"
                  ></div>
                </div>
                <span class="region-count text-grey-5">{{ formatNumero(region.total) }}</span>
              </div>

              <div v-if="!metricas.consumoPorRegion.length" class="text-grey-6 text-caption q-pa-md">
                Sin datos de región para este período.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Empty state -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="bar_chart" size="48px" color="grey-7" />
      <p class="text-grey-5 q-mt-md">Aún no hay datos de uso para esta API.</p>
      <p class="text-grey-7 text-caption">Las métricas aparecerán aquí cuando los consumidores empiecen a usar el gateway.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useGatewayStore } from 'stores/gateway-store.js'

const props = defineProps({
  apiId: {
    type: String,
    required: true,
  },
})

const $q             = useQuasar()
const gatewayStore   = useGatewayStore()

const diasAtras         = ref(7)
const cargando          = ref(false)
const error             = ref(null)
const metricas          = ref(null)
const chartRequestsRef  = ref(null)
const chartLatenciaRef  = ref(null)

// Colores para el donut y gráficos
const COLORES = ['#00a8a8', '#e88b23', '#7c4dff', '#e040fb', '#26c6da']

// ─── Lifecycle ────────────────────────────────────────────────────────────────


let observerRequests = null
let observerLatencia = null

onMounted(async () => {
  await recargarMetricas()
})

onUnmounted(() => {
  observerRequests?.disconnect()
  observerLatencia?.disconnect()
})


// ─── Métodos ──────────────────────────────────────────────────────────────────

async function recargarMetricas() {
  cargando.value = true
  error.value    = null

  try {
    metricas.value = await gatewayStore.cargarMetricas(props.apiId, diasAtras.value)
    await nextTick()
    // Primer intento inmediato
    dibujarGraficos()
    // Segundo intento tras 150ms — cuando Quasar termina de calcular columnas
    setTimeout(dibujarGraficos, 150)
    // ResizeObserver por si el panel cambia de tamaño después
    configurarObservers()
  } catch (err) {
    error.value = err.message || 'Error al cargar las métricas.'
    $q.notify({ type: 'negative', message: error.value, icon: 'error', position: 'top' })
  } finally {
    cargando.value = false
  }
}

function configurarObservers() {
  observerRequests?.disconnect()
  observerLatencia?.disconnect()

  if (chartRequestsRef.value) {
    observerRequests = new ResizeObserver(() => {
      if (!metricas.value) return
      dibujarLineChart(
        chartRequestsRef.value,
        metricas.value.graficos.requestsPorDia,
        'total',
        '#00a8a8',
      )
    })
    observerRequests.observe(chartRequestsRef.value)
  }

  if (chartLatenciaRef.value) {
    observerLatencia = new ResizeObserver(() => {
      if (!metricas.value) return
      dibujarLineChart(
        chartLatenciaRef.value,
        metricas.value.graficos.latenciaPorDia,
        'latenciaPromedio',
        '#e88b23',
      )
    })
    observerLatencia.observe(chartLatenciaRef.value)
  }
}

function dibujarGraficos() {
  if (!metricas.value) return
  dibujarLineChart(
    chartRequestsRef.value,
    metricas.value.graficos.requestsPorDia,
    'total',
    '#00a8a8',
  )
  dibujarLineChart(
    chartLatenciaRef.value,
    metricas.value.graficos.latenciaPorDia,
    'latenciaPromedio',
    '#e88b23',
  )
}

/**
 * Dibuja un gráfico de línea simple con SVG puro.
 * No necesita ninguna librería externa.
 */
function dibujarLineChart(container, datos, campoY, color) {
  if (!container || !datos || datos.length === 0) return

  const W  = container.clientWidth  || 400
  const H  = 140
  const PL = 40   // padding left (para labels del eje Y)
  const PR = 12
  const PT = 12
  const PB = 28   // padding bottom (para labels del eje X)

  const valores  = datos.map(d => d[campoY])
  const maxVal   = Math.max(...valores, 1)
  const minVal   = 0
  const rangoX   = W - PL - PR
  const rangoY   = H - PT - PB

  const step = datos.length > 1 ? datos.length - 1 : 1
  const xPos = (i) => PL + (i / step) * rangoX
  const yPos = (v) => PT + rangoY - ((v - minVal) / (maxVal - minVal || 1)) * rangoY

  // Puntos de la línea
  const puntos = datos.map((d, i) => `${xPos(i)},${yPos(d[campoY])}`).join(' ')

  // Área rellena
  const areaPath = [
    `M ${xPos(0)} ${yPos(datos[0][campoY])}`,
    ...datos.map((d, i) => `L ${xPos(i)} ${yPos(d[campoY])}`),
    `L ${xPos(datos.length - 1)} ${H - PB}`,
    `L ${xPos(0)} ${H - PB}`,
    'Z',
  ].join(' ')

  // Labels eje X (mostrar solo primero, medio y último)
  const labelsX = []
  const indicesX = [0, Math.floor((datos.length - 1) / 2), datos.length - 1]
  indicesX.forEach(i => {
    if (datos[i]) {
      labelsX.push(`
        <text x="${xPos(i)}" y="${H - 6}" text-anchor="middle"
              font-size="9" fill="#666">
          ${datos[i].fecha?.slice(5) || ''}
        </text>
      `)
    }
  })

  // Labels eje Y (0, max)
  const labelsY = [
    `<text x="${PL - 6}" y="${yPos(maxVal) + 4}" text-anchor="end" font-size="9" fill="#666">
      ${formatNumero(maxVal)}
    </text>`,
    `<text x="${PL - 6}" y="${yPos(0) + 4}" text-anchor="end" font-size="9" fill="#555">0</text>`,
  ]

  // Línea de cuadrícula horizontal
  const gridLines = [0.25, 0.5, 0.75].map(f => {
    const yG = PT + rangoY * (1 - f)
    return `<line x1="${PL}" y1="${yG}" x2="${W - PR}" y2="${yG}"
                  stroke="#222" stroke-width="1" stroke-dasharray="3 3"/>`
  }).join('')

  container.innerHTML = `
    <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad_${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${color}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
        </linearGradient>
      </defs>

      ${gridLines}

      <path d="${areaPath}" fill="url(#grad_${color.replace('#','')})" />

      <polyline
        points="${puntos}"
        fill="none"
        stroke="${color}"
        stroke-width="1.8"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      ${datos.map((d, i) => `
        <circle cx="${xPos(i)}" cy="${yPos(d[campoY])}" r="2.5"
                fill="${color}" opacity="0.8"/>
      `).join('')}

      ${labelsY.join('')}
      ${labelsX.join('')}
    </svg>
  `
}

// ─── Computed ─────────────────────────────────────────────────────────────────

const donutSegmentos = computed(() => {
  if (!metricas.value?.consumoPorEndpoint?.length) return []
  const total   = metricas.value.kpis.totalConsumo || 1
  const circunf = 283 // 2π × r = 2 × 3.14159 × 45 ≈ 283
  let offset    = -71 // empezar desde las 12h (−90° → −71 en unidades de dashoffset)

  return metricas.value.consumoPorEndpoint.map((ep, i) => {
    const pct  = ep.porcentaje
    const dash = (pct / 100) * circunf
    const seg  = { color: COLORES[i % COLORES.length], dash, offset, pct, label: ep.endpoint }
    offset    -= dash
    return seg
  })
})

const maxEndpoint = computed(() => {
  if (!metricas.value?.endpointsMasUsados?.length) return 1
  return Math.max(...metricas.value.endpointsMasUsados.map(e => e.total), 1)
})

const maxRegion = computed(() => {
  if (!metricas.value?.consumoPorRegion?.length) return 1
  return Math.max(...metricas.value.consumoPorRegion.map(r => r.total), 1)
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumero(n) {
  if (n === undefined || n === null) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function porcentajeRelativo(total) {
  return Math.round((total / maxEndpoint.value) * 100)
}

function porcentajeRelativoRegion(total) {
  return Math.round((total / maxRegion.value) * 100)
}

function colorMetodo(method) {
  const colores = {
    GET:    'positive',
    POST:   'primary',
    PUT:    'warning',
    PATCH:  'orange',
    DELETE: 'negative',
  }
  return colores[method] || 'grey'
}
</script>

<style lang="scss" scoped>
.metricas-container {
  padding: 16px 0;
  animation: fadeIn 0.4s ease-out;
}

// ─── KPI Cards ───────────────────────────────────────────────────────────────

.kpi-card {
  background: var(--coreapi-card-bg);
  border: 1px solid rgba(0, 168, 168, 0.15);
  border-radius: 12px;
  padding: 18px 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 168, 168, 0.35);
    box-shadow: 0 4px 20px rgba(0, 168, 168, 0.08);
    transform: translateY(-2px);
  }

  &--error {
    border-color: rgba(244, 67, 54, 0.2);
    &:hover { border-color: rgba(244, 67, 54, 0.4); }
  }

  &--warn {
    border-color: rgba(255, 152, 0, 0.2);
    &:hover { border-color: rgba(255, 152, 0, 0.4); }
  }
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.kpi-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.kpi-value {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 6px;
}

.kpi-unit {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 400;
}

.kpi-trend {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;

  &.trend-up   { color: #4caf50; }
  &.trend-down { color: #f44336; }
}

// ─── Chart Cards ─────────────────────────────────────────────────────────────

.chart-card {
  background: var(--coreapi-card-bg);
  border: 1px solid rgba(0, 168, 168, 0.12);
  border-radius: 12px;
  padding: 18px 20px;
  height: 100%;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: rgba(0, 168, 168, 0.25);
  }
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
}

.chart-subtitle {
  font-size: 11px;
  margin-left: 4px;
}

.chart-area {
  width: 100%;
  min-height: 140px;
}

// ─── Donut ────────────────────────────────────────────────────────────────────

.donut-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.donut-svg {
  width: 140px;
  height: 140px;
}

.donut-pct-text {
  fill: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.donut-label-text {
  fill: #666;
  font-size: 7px;
}

.donut-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

// ─── Endpoints más usados ─────────────────────────────────────────────────────

.endpoints-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.endpoint-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.endpoint-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-badge {
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  padding: 2px 6px;
  min-width: 44px;
  text-align: center;
}

.endpoint-path {
  font-size: 12px;
  font-family: 'Monaco', 'Courier New', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.endpoint-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 6px;
}

.endpoint-bar {
  height: 6px;
  background: linear-gradient(90deg, #00a8a8, #00d4d4);
  border-radius: 3px;
  transition: width 0.6s ease;
  min-width: 4px;
}

.endpoint-count {
  font-size: 11px;
  white-space: nowrap;
}

// ─── Regiones ────────────────────────────────────────────────────────────────

.regiones-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.region-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.region-name {
  font-size: 12px;
  font-weight: 500;
}

.region-bar-wrap {
  flex: 1;
  height: 6px;
  background: var(--region-bar-bg);
  border-radius: 3px;
  overflow: hidden;
}

.region-bar {
  height: 100%;
  background: linear-gradient(90deg, #00a8a8, #26c6da);
  border-radius: 3px;
  transition: width 0.6s ease;
  min-width: 4px;
}

.region-count {
  font-size: 11px;
  min-width: 36px;
  text-align: right;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

.skeleton-card {
  min-height: 110px;
  pointer-events: none;
}

.skeleton-item {
  background: linear-gradient(90deg, var(--skeleton-from) 25%, var(--skeleton-to) 50%, var(--skeleton-from) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .kpi-value { font-size: 22px; }
  .donut-svg { width: 110px; height: 110px; }
}
</style>
