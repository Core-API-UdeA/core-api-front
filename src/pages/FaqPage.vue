<template>
  <q-page class="faq-page">

    <!-- Fondo decorativo -->
    <div class="bg-decoration">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <div class="faq-container">

      <!-- ─── Hero ─────────────────────────────────────────────────────── -->
      <div class="hero-section text-center q-mb-xl">
        <div class="hero-badge">
          <q-icon name="help_outline" size="xs" class="q-mr-xs" />
          PREGUNTAS FRECUENTES
        </div>
        <h1 class="hero-title">¿Tienes dudas?</h1>
        <p class="hero-subtitle">
          Encuentra respuestas sobre seguridad, consumo, pagos y más.
          Si no ves lo que buscas, escríbenos por el formulario de contacto.
        </p>

        <!-- Buscador -->
        <div class="search-wrap">
          <q-icon name="search" size="sm" class="search-icon" />
          <input
            v-model="busqueda"
            type="text"
            placeholder="Busca una pregunta..."
            class="search-input"
          />
          <q-btn
            v-if="busqueda"
            flat round dense
            icon="close"
            size="sm"
            color="grey-5"
            class="search-clear"
            @click="busqueda = ''"
          />
        </div>
      </div>

      <!-- ─── Filtros por categoría ────────────────────────────────────── -->
      <div class="categorias-row">
        <button
          v-for="cat in categorias"
          :key="cat.id"
          class="categoria-btn"
          :class="{ activa: categoriaActiva === cat.id }"
          @click="categoriaActiva = cat.id"
        >
          <q-icon :name="cat.icon" size="xs" class="q-mr-xs" />
          {{ cat.label }}
          <span class="categoria-count">{{ contarPorCategoria(cat.id) }}</span>
        </button>
      </div>

      <!-- ─── Sin resultados ──────────────────────────────────────────── -->
      <div v-if="preguntasFiltradas.length === 0" class="empty-state">
        <q-icon name="search_off" size="48px" color="grey-6" />
        <div class="empty-title">No encontramos nada</div>
        <div class="empty-text">
          Intenta con otras palabras o
          <a @click="busqueda = ''; categoriaActiva = 'todas'" class="empty-link">
            ver todas las preguntas
          </a>
        </div>
      </div>

      <!-- ─── Lista de FAQs ───────────────────────────────────────────── -->
      <div v-else class="faqs-list">
        <div
          v-for="(faq, i) in preguntasFiltradas"
          :key="faq.id"
          class="faq-item"
          :class="{ abierta: expandidas[faq.id] }"
        >
          <button class="faq-question" @click="toggle(faq.id)">
            <div class="question-content">
              <span class="question-number">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="question-text" v-html="resaltar(faq.pregunta)"></span>
            </div>
            <q-icon
              name="expand_more"
              size="sm"
              class="question-chevron"
              :class="{ rotated: expandidas[faq.id] }"
            />
          </button>

          <transition name="faq-collapse">
            <div v-if="expandidas[faq.id]" class="faq-answer-wrap">
              <div class="faq-answer">
                <div
                  v-for="(parrafo, j) in faq.respuesta"
                  :key="j"
                  class="faq-paragraph"
                  v-html="parrafo"
                ></div>

                <div v-if="faq.tags?.length" class="faq-tags">
                  <span v-for="tag in faq.tags" :key="tag" class="faq-tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- ─── CTA final ───────────────────────────────────────────────── -->
      <div class="cta-card">
        <div class="cta-icon">
          <q-icon name="forum" color="primary" size="md" />
        </div>
        <div class="cta-content">
          <div class="cta-title">¿No encontraste tu respuesta?</div>
          <div class="cta-text">
            Escríbenos directamente y nuestro equipo te responderá pronto.
          </div>
        </div>
        <q-btn
          unelevated rounded no-caps
          icon-right="arrow_forward"
          label="Contactar"
          class="cta-btn"
          to="/contacto"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const categorias = [
  { id: 'todas',     label: 'Todas',           icon: 'apps' },
  { id: 'seguridad', label: 'Seguridad',        icon: 'shield' },
  { id: 'consumo',   label: 'Consumo de APIs',  icon: 'bolt' },
  { id: 'planes',    label: 'Planes y pagos',   icon: 'payments' },
  { id: 'cuenta',    label: 'Cuenta',           icon: 'person' },
  { id: 'proveedor', label: 'Para proveedores', icon: 'cloud_upload' },
]

const categoriaActiva = ref('todas')
const busqueda        = ref('')
const expandidas      = reactive({})

const preguntas = [
  // ── SEGURIDAD ──
  {
    id: 'seg-credentials',
    categoria: 'seguridad',
    pregunta: '¿Cómo protegen las credenciales de los proveedores?',
    respuesta: [
      'Las credenciales que cada proveedor configura para que CoreAPI pueda conectarse a su API se almacenan <strong>cifradas con AES-256-GCM</strong>, un esquema de cifrado autenticado.',
      'Se descifran exclusivamente en el servidor y solo en el momento exacto del reenvío de la solicitud. Nunca viajan al navegador del consumidor, ni se exponen en logs ni en el código fuente.',
    ],
    tags: ['AES-256-GCM', 'Cifrado en reposo'],
  },
  {
    id: 'seg-apikey',
    categoria: 'seguridad',
    pregunta: '¿Qué pasa si mi API Key se filtra?',
    respuesta: [
      'Puedes <strong>regenerar tu API Key</strong> en cualquier momento desde "Mis suscripciones". La key anterior queda invalidada de inmediato y cualquier integración que la use dejará de funcionar.',
      'Por seguridad, mostramos la key enmascarada por defecto y solo la revelamos cuando haces clic en el botón del ojo. Se recomienda no compartirla y rotarla periódicamente.',
    ],
    tags: ['API Key', 'Rotación'],
  },
  {
    id: 'seg-headers',
    categoria: 'seguridad',
    pregunta: '¿La API Key del consumidor llega al proveedor?',
    respuesta: [
      '<strong>No.</strong> La <code>X-Api-Key</code> que tú usas autentica al consumidor <strong>frente a CoreAPI</strong>, no frente al proveedor. El gateway la elimina explícitamente de las cabeceras antes de reenviar la solicitud.',
      'Esto evita que un proveedor malicioso pueda registrar las keys de sus consumidores y usarlas para suplantar identidad en la plataforma.',
    ],
    tags: ['Aislamiento', 'X-Api-Key'],
  },
  {
    id: 'seg-spam',
    categoria: 'seguridad',
    pregunta: '¿Cómo evitan el spam en el formulario de contacto?',
    respuesta: [
      'Aplicamos defensa por capas <strong>sin necesidad de CAPTCHA</strong>: un campo trampa (<em>honeypot</em>) que solo bots llenan, un tiempo mínimo de 2 segundos para completar el formulario, un límite de 3 envíos por IP por hora, un cooldown de 60 segundos entre envíos del mismo navegador, y detección de patrones obvios (múltiples URLs, palabras clave de spam).',
      'Los envíos que detectamos como spam reciben una respuesta de éxito falso para no dar pistas a los bots sobre qué los detectó.',
    ],
    tags: ['Anti-spam', 'Honeypot', 'Rate limit'],
  },

  // ── CONSUMO ──
  {
    id: 'cons-fallo',
    categoria: 'consumo',
    pregunta: '¿Qué pasa si la API del proveedor falla o está caída?',
    respuesta: [
      'CoreAPI reenvía la solicitud al proveedor y te devuelve la respuesta tal cual la recibe, incluyendo el código de estado HTTP. Si el proveedor responde 500, tú ves 500.',
      'Cada fallo queda registrado en el panel de métricas del proveedor con su latencia y código, de modo que puede detectar problemas en su servicio. Si una API supera un umbral de errores, el proveedor recibe la señal a través de su dashboard.',
      'Tu cuota de consumo <strong>no se ve afectada por errores del proveedor</strong>: solo se descuentan las solicitudes válidas.',
    ],
    tags: ['Resiliencia', 'Métricas'],
  },
  {
    id: 'cons-cuota',
    categoria: 'consumo',
    pregunta: '¿Qué pasa si alcanzo el límite de mi plan?',
    respuesta: [
      'El gateway rechaza nuevas solicitudes con un código <code>429 Too Many Requests</code> hasta que renueve el contador. Verás esto reflejado en tu dashboard con un banner de advertencia desde el 80% de uso.',
      'Puedes <strong>hacer upgrade a un plan superior</strong> en cualquier momento desde la página de la API. El cambio se aplica de inmediato sin necesidad de regenerar tu API Key.',
    ],
    tags: ['Cuotas', 'Rate limit', 'Upgrade'],
  },
  {
    id: 'cons-como',
    categoria: 'consumo',
    pregunta: '¿Cómo consumo una API después de suscribirme?',
    respuesta: [
      'Tienes tres formas de hacerlo, todas listas para copiar y pegar:',
      '<strong>1. Colección de Postman</strong>: descarga el JSON desde "Mis suscripciones", lo importas en Postman y todas las requests vienen con tu API Key y URL base ya configuradas.',
      '<strong>2. SDK Snippets</strong>: en cada suscripción puedes ver fragmentos de código en cURL, JavaScript y Python listos para tu proyecto.',
      '<strong>3. Directamente con la URL del gateway</strong>: <code>POST /gateway/{slug-de-la-api}/{ruta}</code> con la cabecera <code>X-Api-Key: tu_key</code>.',
    ],
    tags: ['Postman', 'SDK', 'Gateway'],
  },
  {
    id: 'cons-latencia',
    categoria: 'consumo',
    pregunta: '¿Agrega latencia el pasar por CoreAPI?',
    respuesta: [
      'El gateway añade una sobrecarga típica de <strong>30-80 ms</strong> sobre la latencia natural del proveedor. Esta sobrecarga corresponde a la validación de la suscripción, el descifrado de credenciales y el registro asíncrono de la métrica.',
      'El registro de la métrica se ejecuta de forma asíncrona para que un fallo en su escritura nunca bloquee tu respuesta.',
    ],
    tags: ['Latencia', 'Performance'],
  },

  // ── PLANES Y PAGOS ──
  {
    id: 'pag-mp',
    categoria: 'planes',
    pregunta: '¿Cómo funcionan los pagos?',
    respuesta: [
      'Los pagos se procesan a través de <strong>MercadoPago</strong>, la pasarela oficial de pagos en Latinoamérica. CoreAPI no almacena información de tarjetas; todo el proceso de checkout ocurre en el entorno seguro de MercadoPago.',
      'Cuando tu pago es confirmado por MercadoPago, recibimos una notificación (webhook) firmada criptográficamente que activa tu suscripción automáticamente. Por construcción, una suscripción solo alcanza el estado activo tras una transacción completada.',
    ],
    tags: ['MercadoPago', 'Webhooks'],
  },
  {
    id: 'pag-free',
    categoria: 'planes',
    pregunta: '¿Hay planes gratuitos?',
    respuesta: [
      'Sí. Muchas APIs publicadas en el marketplace ofrecen un <strong>plan Free</strong> con cuota mensual limitada, ideal para desarrollo, pruebas y proyectos pequeños.',
      'Al suscribirte a un plan gratuito recibes una API Key igual que en planes pagos, sin necesidad de configurar tarjeta de crédito.',
    ],
    tags: ['Free', 'Planes'],
  },
  {
    id: 'pag-cancel',
    categoria: 'planes',
    pregunta: '¿Puedo cancelar mi suscripción?',
    respuesta: [
      'Sí, en cualquier momento desde "Mis suscripciones" → menú "⋮" → "Cancelar suscripción". Al cancelar, pierdes el acceso al gateway de esa API y tu API Key queda invalidada.',
      'Si cancelas un plan pago dentro del ciclo de facturación vigente, conservas el acceso hasta que termine el periodo ya pagado.',
    ],
    tags: ['Cancelación'],
  },

  // ── CUENTA ──
  {
    id: 'cnt-registro',
    categoria: 'cuenta',
    pregunta: '¿Cómo me registro en CoreAPI?',
    respuesta: [
      'Puedes registrarte de <strong>cuatro formas</strong>: con correo y contraseña tradicionales, o mediante autenticación OAuth2 con Google, GitHub o Microsoft.',
      'Al registrarte con correo, recibirás un email de confirmación que debes validar antes de poder publicar APIs o suscribirte.',
    ],
    tags: ['OAuth2', 'Registro'],
  },
  {
    id: 'cnt-doble',
    categoria: 'cuenta',
    pregunta: '¿Puedo ser proveedor y consumidor al mismo tiempo?',
    respuesta: [
      'Sí. Una misma cuenta puede publicar sus propias APIs (rol proveedor) y suscribirse a APIs de otros (rol consumidor) sin restricciones.',
      'El panel del proveedor y el panel del consumidor son secciones independientes de la plataforma a las que puedes acceder según lo necesites.',
    ],
    tags: ['Roles'],
  },

  // ── PROVEEDOR ──
  {
    id: 'prov-publicar',
    categoria: 'proveedor',
    pregunta: '¿Cómo publico mi API en CoreAPI?',
    respuesta: [
      'Desde "Mis APIs" → "Crear nueva API" llenas un formulario con la información de tu servicio (título, tipo, descripción), defines los planes de suscripción y configuras la conexión privada al servicio destino.',
      'Para ahorrar tiempo, puedes <strong>generar el README y la documentación de endpoints con IA</strong>: a partir de una descripción de tu API, el sistema produce automáticamente parámetros, ejemplos y respuestas que luego puedes ajustar.',
    ],
    tags: ['Publicación', 'IA'],
  },
  {
    id: 'prov-mis-keys',
    categoria: 'proveedor',
    pregunta: '¿Dónde quedan las credenciales que configuro para mi API?',
    respuesta: [
      'Las credenciales que ingresas en la sección de Conexión (API key del proveedor, token Bearer, OAuth2, etc.) se <strong>cifran con AES-256-GCM antes de guardarse</strong>. Solo el gateway puede descifrarlas en tiempo de ejecución para inyectarlas en las solicitudes salientes.',
      'Ningún consumidor, administrador ni desarrollador con acceso al backend puede ver tus credenciales en texto plano.',
    ],
    tags: ['Cifrado', 'Conexión'],
  },
  {
    id: 'prov-metricas',
    categoria: 'proveedor',
    pregunta: '¿Qué métricas veo de mi API?',
    respuesta: [
      'En el panel de métricas ves <strong>volumen de solicitudes, tasa de error y latencia promedio</strong>, con filtros temporales de 7, 30 y 90 días.',
      'Cada solicitud queda registrada individualmente con su consumidor, endpoint, código de estado, latencia e IP de origen. Esto te permite analizar tendencias, detectar problemas y tomar decisiones sobre la evolución de tu API.',
    ],
    tags: ['Analytics', 'Observabilidad'],
  },
]

function contarPorCategoria(catId) {
  if (catId === 'todas') return preguntas.length
  return preguntas.filter(p => p.categoria === catId).length
}

const preguntasFiltradas = computed(() => {
  let lista = preguntas

  if (categoriaActiva.value !== 'todas') {
    lista = lista.filter(p => p.categoria === categoriaActiva.value)
  }

  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase().trim()
    lista = lista.filter(p => {
      const enPregunta  = p.pregunta.toLowerCase().includes(q)
      const enRespuesta = p.respuesta.some(r => r.toLowerCase().includes(q))
      const enTags      = p.tags?.some(t => t.toLowerCase().includes(q))
      return enPregunta || enRespuesta || enTags
    })
  }

  return lista
})

function toggle(id) {
  expandidas[id] = !expandidas[id]
}

function resaltar(texto) {
  if (!busqueda.value.trim()) return texto
  const q = busqueda.value.trim()
  const escapeReg = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapeReg})`, 'gi')
  return texto.replace(regex, '<mark class="search-highlight">$1</mark>')
}
</script>

<style lang="scss" scoped>
/* ════════════════════════════════════════════════════════════════════════
 * PALETA CoreAPI (extraída de la app real)
 *   bg-base:    #000000  (negro puro)
 *   bg-card:    #1a1a1a  (gris muy oscuro)
 *   bg-card-2:  #141414
 *   border:     rgba(255,255,255, 0.08)
 *   primary:    #26A69A  (teal Material)
 *   accent:     #00BFA5  (teal saturado)
 * ════════════════════════════════════════════════════════════════════════ */

.faq-page {
  min-height: 100vh;
  background: #000000;
  position: relative;
  overflow-x: hidden;
  padding: 60px 24px;
}

/* ── Fondo ── */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  opacity: 0.18;
}

.orb-1 {
  width: 500px; height: 500px;
  background: #26A69A;
  top: -200px; left: -100px;
}

.orb-2 {
  width: 400px; height: 400px;
  background: #00BFA5;
  bottom: -150px; right: -100px;
}

.faq-container {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

/* ── Hero ── */
.hero-section { margin-bottom: 32px; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(38, 166, 154, 0.12);
  border: 1px solid rgba(38, 166, 154, 0.35);
  color: #26A69A;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.hero-title {
  color: #ffffff;
  font-size: 48px;
  font-weight: 700;
  font-family: 'Trebuchet MS', sans-serif;
  margin: 0 0 12px;
  letter-spacing: -1px;
  line-height: 1.1;
}

.hero-subtitle {
  color: #94a3b8;
  font-size: 16px;
  max-width: 560px;
  margin: 0 auto 28px;
  line-height: 1.6;
}

/* ── Buscador ── */
.search-wrap {
  position: relative;
  max-width: 520px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px 48px 14px 44px;
  color: #ffffff;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.search-input::placeholder { color: #64748b; }

.search-input:focus {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(38, 166, 154, 0.55);
  box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.12);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

/* ── Categorías ── */
.categorias-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
}

.categoria-btn {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.categoria-btn:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

.categoria-btn.activa {
  background: rgba(38, 166, 154, 0.18);
  border-color: rgba(38, 166, 154, 0.55);
  color: #26A69A;
}

.categoria-count {
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 10px;
  margin-left: 8px;
}

.categoria-btn.activa .categoria-count {
  background: rgba(38, 166, 154, 0.25);
  color: #26A69A;
}

/* ── Lista de FAQs ── */
.faqs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 48px;
}

.faq-item {
  background: linear-gradient(145deg, #1a1a1a 0%, #141414 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.faq-item.abierta {
  border-color: rgba(38, 166, 154, 0.35);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: none;
  border: none;
  color: #ffffff;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  padding: 18px 22px;
  transition: background 0.15s ease;
}

.faq-question:hover {
  background: rgba(255, 255, 255, 0.02);
}

.question-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.question-number {
  color: #26A69A;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
}

.question-chevron {
  color: #64748b;
  transition: transform 0.25s ease, color 0.2s ease;
  flex-shrink: 0;
}

.question-chevron.rotated {
  transform: rotate(180deg);
  color: #26A69A;
}

/* ── Respuesta ── */
.faq-answer-wrap {
  overflow: hidden;
}

.faq-answer {
  padding: 0 22px 20px 56px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.75;
}

.faq-paragraph {
  margin-bottom: 12px;
}

.faq-paragraph:last-of-type {
  margin-bottom: 0;
}

:deep(.faq-paragraph code) {
  background: rgba(38, 166, 154, 0.15);
  color: #5eead4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

:deep(.faq-paragraph strong) {
  color: #ffffff;
  font-weight: 600;
}

:deep(.faq-paragraph em) {
  color: #94a3b8;
  font-style: italic;
}

.faq-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.faq-tag {
  background: rgba(38, 166, 154, 0.1);
  color: #5eead4;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 10px;
  border: 1px solid rgba(38, 166, 154, 0.25);
}

/* ── Collapse ── */
.faq-collapse-enter-active,
.faq-collapse-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  max-height: 600px;
}

.faq-collapse-enter-from,
.faq-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Search highlight ── */
:deep(.search-highlight) {
  background: rgba(38, 166, 154, 0.35);
  color: #5eead4;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 600;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 32px;
}

.empty-title {
  color: #cbd5e1;
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
  margin-bottom: 6px;
}

.empty-text {
  color: #64748b;
  font-size: 14px;
}

.empty-link {
  color: #26A69A;
  cursor: pointer;
  text-decoration: underline;
}

.empty-link:hover { color: #00BFA5; }

/* ── CTA ── */
.cta-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, rgba(38, 166, 154, 0.1) 0%, rgba(0, 191, 165, 0.05) 100%);
  border: 1px solid rgba(38, 166, 154, 0.25);
  border-radius: 16px;
  padding: 24px 28px;
}

.cta-icon {
  width: 56px;
  height: 56px;
  background: rgba(38, 166, 154, 0.18);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cta-content {
  flex: 1;
  min-width: 0;
}

.cta-title {
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 4px;
}

.cta-text {
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}

.cta-btn {
  background: linear-gradient(135deg, #26A69A 0%, #00BFA5 100%);
  color: #ffffff;
  font-weight: 600;
  padding: 10px 22px;
  box-shadow: 0 6px 20px rgba(38, 166, 154, 0.35);
}

/* ── Responsive ── */
@media (max-width: 700px) {
  .hero-title { font-size: 36px; }
  .faq-answer { padding-left: 22px; }
  .question-content { gap: 10px; }
  .question-number { font-size: 12px; }
  .question-text { font-size: 14px; }

  .cta-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
