/**
 * src/composables/usePostmanCollection.js
 *
 * Composable que genera y descarga una colección de Postman v2.1
 * para una suscripción activa de CoreAPI.
 *
 * USO:
 *   const { generarYDescargar, generando } = usePostmanCollection()
 *   await generarYDescargar(suscripcion)
 */

import { ref } from 'vue'
import { useApisStore } from 'stores/apis-store.js'

export function usePostmanCollection() {
  const apisStore  = useApisStore()
  const generando  = ref(false)

  // ─── Entry point público ────────────────────────────────────────────────
  async function generarYDescargar(suscripcion) {
    if (generando.value) return
    generando.value = true

    try {
      const apiId   = suscripcion?.api_id?.id   ?? suscripcion?.api_id
      const apiSlug = suscripcion?.api_id?.slug  ?? 'api'
      const apiName = suscripcion?.api_id?.title ?? 'API'
      const apiKey  = suscripcion?.api_key       ?? ''
      const planName = suscripcion?.plan_id?.name ?? suscripcion?.plan_name ?? 'Plan'

      // Base URL del gateway de CoreAPI
      const gatewayBase = window.location.origin.includes('localhost')
        ? 'http://localhost:3000'
        : 'https://core-api-back.onrender.com' + '/scapi'

      // Obtener documentación completa (endpoints + params + bodies + responses)
      let documentacion = []
      try {
        const doc = await apisStore.consultarApiDocumentation(apiId)
        documentacion = doc?.documentation ?? doc ?? []
      } catch (_) {
        // Si no hay documentación, generamos la colección igualmente (sin items)
      }

      // Construir la colección
      const coleccion = construirColeccion({
        apiName,
        apiSlug,
        apiKey,
        gatewayBase,
        planName,
        documentacion,
        suscripcion,
      })

      // Descargar el JSON
      const fileName = `CoreAPI - ${apiName}.postman_collection.json`
      descargarJson(coleccion, fileName)

      return coleccion

    } finally {
      generando.value = false
    }
  }

  return { generarYDescargar, generando }
}

// ─── Construcción de la colección ──────────────────────────────────────────

function construirColeccion({ apiName, apiSlug, apiKey, gatewayBase, planName, documentacion, suscripcion }) {
  const collectionId = crypto.randomUUID()

  // Agrupar endpoints por path para organizarlos en carpetas
  const gruposPorPath = agruparEndpoints(documentacion, apiSlug)

  return {
    info: {
      _postman_id: collectionId,
      name: `CoreAPI — ${apiName}`,
      description: [
        `Colección generada automáticamente por CoreAPI`,
        ``,
        `**API:** ${apiName}`,
        `**Plan:** ${planName}`,
        `**Gateway:** ${gatewayBase}/gateway/${apiSlug}`,
        ``,
        `## Cómo usar`,
        `1. Importa este archivo en Postman (File → Import)`,
        `2. La variable \`apiKey\` ya está configurada con tu key personal`,
        `3. Todas las requests se envían a través del gateway de CoreAPI`,
        ``,
        `## Variables de entorno`,
        `- \`{{baseUrl}}\` → URL base del gateway`,
        `- \`{{apiKey}}\` → Tu API Key personal (ya configurada)`,
        ``,
        `> ⚠️ No compartas esta colección: contiene tu API Key personal.`,
      ].join('\n'),
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },

    // Variables de colección (equivalen a variables de entorno)
    variable: [
      {
        key: 'baseUrl',
        value: `${gatewayBase}/gateway/${apiSlug}`,
        type: 'string',
        description: 'URL base del gateway de CoreAPI para esta API',
      },
      {
        key: 'apiKey',
        value: apiKey,
        type: 'string',
        description: '⚠️ Tu API Key personal. No la compartas.',
      },
    ],

    // Auth a nivel de colección (se hereda en todas las requests)
    auth: {
      type: 'apikey',
      apikey: [
        { key: 'key',   value: 'X-Api-Key',    type: 'string' },
        { key: 'value', value: '{{apiKey}}',    type: 'string' },
        { key: 'in',    value: 'header',        type: 'string' },
      ],
    },

    item: documentacion.length === 0
      ? [itemSinDocumentacion(apiSlug, gatewayBase)]
      : gruposPorPath,
  }
}

// ─── Agrupación y construcción de items ────────────────────────────────────

function agruparEndpoints(documentacion, apiSlug) {
  // Si hay pocos endpoints (<=5), no agrupamos en carpetas
  if (documentacion.length <= 5) {
    return documentacion.map(ep => construirItem(ep, apiSlug))
  }

  // Agrupar por primer segmento del path: /users/... → carpeta "users"
  const carpetas = {}

  documentacion.forEach(ep => {
    const segmentos = ep.path.replace(/^\//, '').split('/')
    const grupo = segmentos[0] || 'general'

    if (!carpetas[grupo]) {
      carpetas[grupo] = {
        name: `/${grupo}`,
        description: `Endpoints del recurso "${grupo}"`,
        item: [],
      }
    }
    carpetas[grupo].item.push(construirItem(ep, apiSlug))
  })

  return Object.values(carpetas)
}

function construirItem(ep, apiSlug) {
  const queryParams = (ep.parameters || [])
    .filter(p => p.location === 'query' || !p.location)
    .map(p => ({
      key:         p.name,
      value:       p.example || '',
      description: [p.description, p.required ? '(requerido)' : '(opcional)'].filter(Boolean).join(' — '),
      disabled:    !p.required,
    }))

  const headerParams = (ep.headers || ep.parameters?.filter(p => p.location === 'header') || [])
    .filter(h => h.name?.toLowerCase() !== 'x-api-key') // ya va en auth de la colección
    .map(h => ({
      key:         h.name,
      value:       h.example || '',
      description: h.description || '',
    }))

  // Body: tomar el primer ejemplo disponible
  const primerBody = ep.body?.[0] ?? ep.bodies?.[0] ?? null
  const tieneBody  = ['POST', 'PUT', 'PATCH'].includes(ep.method) && primerBody

  // Ejemplos de respuesta
  const responses = (ep.responses || []).map(r => ({
    name:            `${r.status_code || '200'} — ${r.description || 'Respuesta'}`,
    originalRequest: construirRequest(ep, queryParams, headerParams, tieneBody, primerBody),
    status:          codigoAStatus(r.status_code),
    code:            r.status_code || 200,
    _postman_previewlanguage: 'json',
    header: [{ key: 'Content-Type', value: 'application/json' }],
    body:   r.example ? JSON.stringify(r.example, null, 2) : '{}',
  }))

  return {
    name: `${ep.method} ${ep.path}`,
    request: construirRequest(ep, queryParams, headerParams, tieneBody, primerBody),
    response: responses,
    ...(ep.description && { description: ep.description }),
  }
}

function construirRequest(ep, queryParams, headerParams, tieneBody, primerBody) {
  const req = {
    method: ep.method,
    header: headerParams,
    url: {
      raw:   `{{baseUrl}}${ep.path}${queryParams.length ? '?' + queryParams.map(p => `${p.key}=${p.value}`).join('&') : ''}`,
      host:  ['{{baseUrl}}'],
      path:  ep.path.replace(/^\//, '').split('/'),
      query: queryParams,
    },
    description: ep.description || '',
  }

  if (tieneBody && primerBody) {
    const ejemplo = primerBody.example ?? primerBody.ejemplo ?? {}
    req.body = {
      mode: 'raw',
      raw:  JSON.stringify(ejemplo, null, 2),
      options: { raw: { language: 'json' } },
    }
    req.header = [
      ...req.header,
      { key: 'Content-Type', value: 'application/json' },
    ]
  }

  return req
}

// Item genérico cuando no hay documentación registrada
function itemSinDocumentacion(apiSlug, gatewayBase) {
  return {
    name: '📖 Sin documentación registrada',
    description: [
      'Esta API aún no tiene documentación de endpoints registrada en CoreAPI.',
      '',
      'Para usar la API, consulta su documentación directamente con el proveedor',
      'y construye tus requests usando la URL base y tu API Key configuradas.',
      '',
      `Base URL del gateway: ${gatewayBase}/gateway/${apiSlug}`,
    ].join('\n'),
    request: {
      method: 'GET',
      header: [],
      url: {
        raw:  `{{baseUrl}}/TU_RUTA_AQUI`,
        host: ['{{baseUrl}}'],
        path: ['TU_RUTA_AQUI'],
      },
    },
    response: [],
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function codigoAStatus(code) {
  const map = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable Entity',
    429: 'Too Many Requests', 500: 'Internal Server Error', 502: 'Bad Gateway',
  }
  return map[code] || 'Response'
}

function descargarJson(obj, fileName) {
  const json = JSON.stringify(obj, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
