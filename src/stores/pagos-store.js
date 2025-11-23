// src/stores/pagos-store.js
import { defineStore } from 'pinia'
import { axiosInstance } from 'boot/axios'
import { ref, computed } from 'vue'

const RUTA_CREAR_CHECKOUT = '/pagos/crear-checkout'
const RUTA_VERIFICAR_PAGO = '/pagos/verificar-pago'
const RUTA_CONSULTAR_TRANSACCION = '/pagos/transaccion'
const RUTA_MIS_TRANSACCIONES = '/pagos/mis-transacciones'
const RUTA_MIS_SUSCRIPCIONES = '/suscripciones/mis-suscripciones'
const RUTA_CANCELAR_SUSCRIPCION = '/suscripciones/cancelar'
const RUTA_GESTIONAR_PLAN = '/catalogo/planes'
const RUTA_ELIMINAR_PLAN = '/catalogo/planes/eliminar'

export const usePagosStore = defineStore('storePagos', () => {
  const loading = ref(false)
  const suscripciones = ref([])
  const transacciones = ref([])
  const paginationTransacciones = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // ==================== PLANES ====================

  // Crear o actualizar plan
  async function gestionarPlan(apiId, planData, planId = null) {
    loading.value = true
    try {
      const payload = {
        apiId,
        planData,
      }

      // Si hay planId, es actualización
      if (planId) {
        payload.planId = planId
      }

      const response = await axiosInstance.post(RUTA_GESTIONAR_PLAN, payload)

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al gestionar plan:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Eliminar plan
  async function eliminarPlan(apiId, planId) {
    loading.value = true
    try {
      const response = await axiosInstance.delete(RUTA_ELIMINAR_PLAN, {
        data: { apiId, planId },
      })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al eliminar plan:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ==================== CHECKOUT Y PAGOS ====================

  // Crear checkout de pago
  async function crearCheckout(apiId, planId, paymentProvider = 'mercadopago') {
    loading.value = true
    try {
      const response = await axiosInstance.post(RUTA_CREAR_CHECKOUT, {
        apiId,
        planId,
        paymentProvider,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al crear checkout:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Verificar estado de pago (usado en PaymentSuccess.vue)
  async function verificarPago(transactionId, paymentParams = {}) {
    loading.value = true
    try {
      const response = await axiosInstance.post(RUTA_VERIFICAR_PAGO, {
        transaction_id: transactionId,
        payment_id: paymentParams.payment_id,
        collection_id: paymentParams.collection_id,
        status: paymentParams.status,
        merchant_order_id: paymentParams.merchant_order_id,
      })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        const data = ejec.data || ejec.respuesta.data

        // Si el pago fue exitoso, recargar suscripciones
        if (data.success && data.subscription_id) {
          await cargarMisSuscripciones()
        }

        return {
          success: data.success,
          api_key: data.api_key,
          subscription_id: data.subscription_id,
          plan_name: data.plan_name,
          api_name: data.api_name,
          amount: data.amount,
          status: data.status,
          subscription_status: data.subscription_status,
          start_date: data.start_date,
          end_date: data.end_date,
          message: data.message,
        }
      } else {
        // Manejar estados especiales (pending, failed, etc)
        const mensaje = ejec.respuesta.mensaje
        const data = ejec.data || ejec.respuesta.data || {}

        return {
          success: false,
          status: data.status,
          message: mensaje,
          ...data,
        }
      }
    } catch (error) {
      console.error('Error al verificar pago:', error)

      // Si el error tiene respuesta del servidor
      if (error.response?.data?.ejecucion) {
        const ejec = error.response.data.ejecucion
        const data = ejec.data || ejec.respuesta.data || {}

        return {
          success: false,
          status: data.status,
          message: ejec.respuesta.mensaje,
          ...data,
        }
      }

      throw error
    } finally {
      loading.value = false
    }
  }

  // ==================== TRANSACCIONES ====================

  // Consultar una transacción específica
  async function consultarTransaccion(transactionId) {
    loading.value = true
    try {
      const response = await axiosInstance.get(`${RUTA_CONSULTAR_TRANSACCION}/${transactionId}`)

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al consultar transacción:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Listar mis transacciones
  async function cargarMisTransacciones(page = 1, limit = 10, filters = {}) {
    loading.value = true
    try {
      const params = {
        page,
        limit,
        ...filters,
      }

      const response = await axiosInstance.get(RUTA_MIS_TRANSACCIONES, { params })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        // Manejar tanto si viene con pagination como si viene directo
        if (ejec.data.transactions) {
          transacciones.value = ejec.data.transactions
          paginationTransacciones.value = ejec.data.pagination || {
            page: 1,
            limit: 10,
            total: ejec.data.transactions.length,
            totalPages: 1,
          }
        } else {
          // Si viene directo el array
          transacciones.value = ejec.data
          paginationTransacciones.value = {
            page: 1,
            limit: ejec.data.length,
            total: ejec.data.length,
            totalPages: 1,
          }
        }
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ==================== SUSCRIPCIONES ====================

  // Listar mis suscripciones
  async function cargarMisSuscripciones(status = null) {
    loading.value = true
    try {
      const params = status ? { status } : {}
      const response = await axiosInstance.get(RUTA_MIS_SUSCRIPCIONES, { params })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        suscripciones.value = ejec.data
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al cargar suscripciones:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Cancelar suscripción
  async function cancelarSuscripcion(subscriptionId, reason = '') {
    loading.value = true
    try {
      const response = await axiosInstance.put(`${RUTA_CANCELAR_SUSCRIPCION}/${subscriptionId}`, {
        reason,
      })

      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        // Actualizar lista de suscripciones
        await cargarMisSuscripciones()
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error al cancelar suscripción:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ==================== GETTERS ====================

  // Obtener transacciones por estado
  const transaccionesPorEstado = computed(() => (status) => {
    return transacciones.value.filter((t) => t.payment_status === status)
  })

  // Obtener transacciones completadas
  const transaccionesCompletadas = computed(() => {
    return transacciones.value.filter((t) => t.payment_status === 'completed')
  })

  // Obtener transacciones pendientes
  const transaccionesPendientes = computed(() => {
    return transacciones.value.filter((t) => ['pending', 'processing'].includes(t.payment_status))
  })

  // Obtener transacciones fallidas
  const transaccionesFallidas = computed(() => {
    return transacciones.value.filter((t) =>
      ['failed', 'cancelled', 'rejected'].includes(t.payment_status),
    )
  })

  // Obtener suscripciones activas
  const suscripcionesActivas = computed(() => {
    return suscripciones.value.filter((s) => s.status === 'active')
  })

  // Obtener suscripciones canceladas
  const suscripcionesCanceladas = computed(() => {
    return suscripciones.value.filter((s) => s.status === 'cancelled')
  })

  // Obtener suscripciones expiradas
  const suscripcionesExpiradas = computed(() => {
    return suscripciones.value.filter((s) => s.status === 'expired')
  })

  // Verificar si tiene suscripción activa a una API específica
  const tieneSuscripcionActiva = computed(() => (apiId) => {
    return suscripciones.value.some((s) => s.api_id === apiId && s.status === 'active')
  })

  // ==================== UTILITIES ====================

  // Reset store
  function resetStore() {
    suscripciones.value = []
    transacciones.value = []
    paginationTransacciones.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    }
  }

  return {
    // State
    loading,
    suscripciones,
    transacciones,
    paginationTransacciones,

    // Actions - Planes
    gestionarPlan,
    eliminarPlan,

    // Actions - Checkout y Pagos
    crearCheckout,
    verificarPago,

    // Actions - Transacciones
    consultarTransaccion,
    cargarMisTransacciones,

    // Actions - Suscripciones
    cargarMisSuscripciones,
    cancelarSuscripcion,

    // Utilities
    resetStore,

    // Getters
    transaccionesPorEstado,
    transaccionesCompletadas,
    transaccionesPendientes,
    transaccionesFallidas,
    suscripcionesActivas,
    suscripcionesCanceladas,
    suscripcionesExpiradas,
    tieneSuscripcionActiva,
  }
})
