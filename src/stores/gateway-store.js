// src/stores/gateway-store.js
import { defineStore } from 'pinia'
import { axiosInstance } from 'boot/axios'
import { ref } from 'vue'

const RUTA_REGISTRAR_CONEXION  = '/gateway/conexion'
const RUTA_VERIFICAR_CONEXION  = '/gateway/conexion/verificar'
const RUTA_OBTENER_METRICAS    = '/gateway/metricas'

export const useGatewayStore = defineStore('storeGateway', () => {
  const loading        = ref(false)
  const loadingTest    = ref(false)   // separado para el botón "Test connection"
  const loadingMetricas = ref(false)

  const metricas       = ref(null)
  const conexion       = ref(null)
  const resultadoTest  = ref(null)    // resultado del último "Test connection"

  // ==================== CONEXIÓN ====================

  // Registra (o actualiza) la configuración de conexión de una API.
  // Cifra las credenciales en el backend y ejecuta el health check.
  async function registrarConexion(apiId, datosConexion) {
    loading.value = true
    try {
      const response = await axiosInstance.post(RUTA_REGISTRAR_CONEXION, {
        apiId,
        baseUrl:              datosConexion.baseUrl,
        authType:             datosConexion.authType,
        credential:           datosConexion.credential || null,
        apiKeyHeaderName:     datosConexion.apiKeyHeaderName || 'X-Api-Key',
        healthCheckEndpoint:  datosConexion.healthCheckEndpoint || '/',
        healthCheckMethod:    datosConexion.healthCheckMethod || 'GET',
      })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        conexion.value = ejec.data
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al registrar conexión:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Prueba la conectividad sin guardar nada (botón "Test connection").
  // Si se pasa apiId también actualiza el estado en BD.
  async function verificarConexion(datosConexion, apiId = null) {
    loadingTest.value = true
    resultadoTest.value = null
    try {
      const payload = {
        baseUrl:             datosConexion.baseUrl,
        authType:            datosConexion.authType    || 'none',
        credential:          datosConexion.credential  || null,
        apiKeyHeaderName:    datosConexion.apiKeyHeaderName || 'X-Api-Key',
        healthCheckEndpoint: datosConexion.healthCheckEndpoint || '/',
        healthCheckMethod:   datosConexion.healthCheckMethod   || 'GET',
      }

      if (apiId) {
        payload.apiId = apiId
      }

      const response = await axiosInstance.post(RUTA_VERIFICAR_CONEXION, payload)

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        resultadoTest.value = ejec.data
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al verificar conexión:', error)
      throw error
    } finally {
      loadingTest.value = false
    }
  }

  // ==================== MÉTRICAS ====================

  // Carga las métricas de uso de una API para el panel del proveedor.
  // diasAtras: 7 | 30 | 90
  async function cargarMetricas(apiId, diasAtras = 7) {
    loadingMetricas.value = true
    try {
      const response = await axiosInstance.get(`${RUTA_OBTENER_METRICAS}/${apiId}`, {
        params: { diasAtras },
      })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        metricas.value = ejec.data
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al cargar métricas:', error)
      throw error
    } finally {
      loadingMetricas.value = false
    }
  }

  // ==================== UTILITIES ====================

  function resetStore() {
    metricas.value      = null
    conexion.value      = null
    resultadoTest.value = null
  }

  return {
    // State
    loading,
    loadingTest,
    loadingMetricas,
    metricas,
    conexion,
    resultadoTest,

    // Actions - Conexión
    registrarConexion,
    verificarConexion,

    // Actions - Métricas
    cargarMetricas,

    // Utilities
    resetStore,
  }
})
