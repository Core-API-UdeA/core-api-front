// src/stores/pagos-store.js
import { defineStore } from 'pinia'
import { axiosInstance } from 'boot/axios'
import { ref } from 'vue'

const RUTA_CREAR_CHECKOUT = '/pagos/crear-checkout'
const RUTA_CONSULTAR_TRANSACCION = '/pagos/transaccion'
const RUTA_MIS_TRANSACCIONES = '/pagos/mis-transacciones'
const RUTA_MIS_SUSCRIPCIONES = '/suscripciones/mis-suscripciones'
const RUTA_CANCELAR_SUSCRIPCION = '/suscripciones/cancelar'

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
        transacciones.value = ejec.data.transactions
        paginationTransacciones.value = ejec.data.pagination
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

    // Actions
    crearCheckout,
    consultarTransaccion,
    cargarMisTransacciones,
    cargarMisSuscripciones,
    cancelarSuscripcion,
    resetStore,
  }
})
