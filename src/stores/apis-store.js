import { defineStore } from 'pinia'
import { axiosInstance } from 'boot/axios'
import { ref } from 'vue'

const RUTA_APIS = '/catalogo/listarapis'
const RUTA_API_OVERVIEW = '/catalogo/obteneroverview'
const RUTA_API_DOCUMENTATION = '/catalogo/obtenerdocumentacion'
const RUTA_ACTUALIZAR_RATING = '/catalogo/rating'
const RUTA_ACTUALIZAR_FAVORITO = '/catalogo/favorite'
const RUTA_OBTENER_USER_INTERACTION = '/catalogo/obteneruserinteraction'
const RUTA_REGISTRAR_API_OVERVIEW = '/catalogo/registrarapioverview'

export const useApisStore = defineStore('storeApi', () => {
  const filter = ref({
    estado: '',
    asunto: '',
    fechaPeticionInicial: '',
    fechaPeticionFinal: '',
  })

  const paginationOriginal = ref({
    sortBy: 'title',
    descending: false,
    page: 1,
    rowsPerPage: 30,
    rowsNumber: 0,
    limite: 30,
  })

  const pagination = ref({
    sortBy: 'title',
    descending: false,
    page: 1,
    rowsPerPage: 30,
    rowsNumber: 0,
    limite: 30,
  })

  const records = ref({
    data: [],
  })

  async function cargarApis(original) {
    const params = {
      params: {
        filter: filter.value,
        pagination: original ? paginationOriginal.value : pagination.value,
      },
    }
    try {
      const p = new Promise(async function (resolve, reject) {
        try {
          await axiosInstance
            .get(RUTA_APIS, params)
            .then((response) => {
              if (response.data.ejecucion.respuesta.estado === 'OK') {
                records.value = response.data.ejecucion.data.records
                pagination.value = response.data.ejecucion.data.pagination
                resolve()
              } else {
                reject(new Error(response.data.ejecucion.respuesta.mensaje))
              }
            })
            .catch((error) => {
              reject(error)
            })
        } catch (error) {
          reject(error)
        }
      })
      return p
    } catch (error) {
      console.log('Error en el proceso:', error.message)
    }
  }

  async function consultarApiOverview(id) {
    const params = {
      apiId: id,
    }
    try {
      const response = await axiosInstance.get(RUTA_API_OVERVIEW, { params })
      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error en consultarApiOverview:', error)
      throw error
    }
  }

  async function consultarUserInteraction(id) {
    const params = {
      apiId: id,
    }
    try {
      const response = await axiosInstance.get(RUTA_OBTENER_USER_INTERACTION, { params })
      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error en consultarUserInteraction:', error)
      throw error
    }
  }

  async function consultarApiDocumentation(id) {
    const params = {
      apiId: id,
    }
    try {
      const response = await axiosInstance.get(RUTA_API_DOCUMENTATION, { params })
      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error en consultarApiDocumentation:', error)
      throw error
    }
  }

  async function actualizarRating(apiId, rating) {
    const params = {
      apiId: apiId,
      rating: rating,
    }
    try {
      const response = await axiosInstance.put(RUTA_ACTUALIZAR_RATING, params)
      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.log('Error en el proceso:', error.message)
    }
  }

  async function actualizarFavorito(apiId) {
    const params = {
      apiId: apiId,
    }
    try {
      const response = await axiosInstance.put(RUTA_ACTUALIZAR_FAVORITO, params)
      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.log('Error en el proceso:', error.message)
    }
  }

  async function registarApiOverview(datosApi, apiId = null) {
    const params = {
      apiId: apiId,
      datosApi: datosApi,
    }
    try {
      const response = await axiosInstance.post(RUTA_REGISTRAR_API_OVERVIEW, params)
      const ejec = response.data.ejecucion
      if (ejec.respuesta.estado === 'OK') {
        return ejec.data
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.log('Error en el proceso:', error.message)
    }
  }

  function resetStore() {
    filter.value = {
      estado: '',
      asunto: '',
      fechaPeticionInicial: '',
      fechaPeticionFinal: '',
    }
    paginationOriginal.value = {
      sortBy: 'title',
      descending: false,
      page: 1,
      rowsPerPage: 30,
      rowsNumber: 0,
      limite: 30,
    }
    pagination.value = {
      sortBy: 'title',
      descending: false,
      page: 1,
      rowsPerPage: 30,
      rowsNumber: 0,
      limite: 30,
    }
    records.value = {
      data: [],
    }
  }

  return {
    consultarApiDocumentation,
    consultarUserInteraction,
    consultarApiOverview,
    registarApiOverview,
    paginationOriginal,
    actualizarFavorito,
    actualizarRating,
    cargarApis,
    resetStore,
    pagination,
    records,
    filter,
  }
})
