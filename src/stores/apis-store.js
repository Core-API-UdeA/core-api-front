import { defineStore } from 'pinia'
import { axiosInstance } from 'boot/axios'
import { ref } from 'vue'

const RUTA_APIS = ''

export const useApisStore = defineStore('storeApi', () => {
  const filter = ref({
    estado: '',
    asunto: '',
    fechaPeticionInicial: '',
    fechaPeticionFinal: '',
  })

  const paginationOriginal = ref({
    sortBy: 'created_at',
    descending: false,
    page: 1,
    rowsPerPage: 30,
    rowsNumber: 0,
    limite: 30,
  })

  const pagination = ref({
    sortBy: 'created_at',
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

  return {
    paginationOriginal,
    cargarApis,
    pagination,
    records,
    filter,
  }
})
