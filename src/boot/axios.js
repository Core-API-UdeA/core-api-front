import { boot } from 'quasar/wrappers'
import axios from 'axios'
import qs from 'qs'

const axiosInstanceBaseURL = process.env.BASE_URL_API + process.env.PREFIX
console.log('🌍 ENV', process.env.BASE_URL_API)

const axiosInstance = axios.create({
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
  baseURL: axiosInstanceBaseURL,
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
})

export { axiosInstance }
