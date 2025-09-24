import { defineStore } from 'pinia'
import { axiosInstance } from 'boot/axios'
import { useQuasar, Cookies } from 'quasar'
import { ref, computed } from 'vue'

const LOGIN_API_ROUTE = process.env.LOGIN_ROUTE
const LOGIN_GOOGLE_API_ROUTE = process.env.LOGIN_GOOGLE_ROUTE
const FETCH_API_ROUTE = process.env.FETCH_ROUTE
const REGISTER_API_ROUTE = process.env.REGISTER_ROUTE

export const useAuthStore = defineStore('storeAuth', () => {
  const $q = useQuasar()

  const user = ref(null)
  const roles = ref(null)
  const token = ref(null)

  const ejecucion = ref(null)
  const loginCallbacks = ref([])

  const loggedIn = computed(() => !!user.value)

  const ejecucionComputed = computed(() => ejecucion.value)

  function setHeader(tokenStr) {
    console.log('\n----------> setHeader')
    axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + tokenStr
    Cookies.set('token', tokenStr)
    token.value = tokenStr
  }

  function clearSession() {
    Cookies.remove('token')
    axiosInstance.defaults.headers.common.Authorization = ''
    token.value = null
    user.value = null
    roles.value = null
    ejecucion.value = null
  }

  function loginCallback(data = {}) {
    console.log('\n----------> loginCallback')
    for (const callback of loginCallbacks.value) {
      callback({ router: data.router })
    }
  }

  function hasRole(validRoles = []) {
    console.log('\n----------> hasRole')

    if (!roles.value) {
      return false
    }

    if (typeof validRoles === 'string') {
      validRoles = [validRoles]
    }

    let resultado = roles.value.some((role) => validRoles.includes(role))

    return resultado
  }

  async function login(email, password) {
    try {
      console.log('\n----------> login')

      const response = await axiosInstance.post(LOGIN_API_ROUTE, {
        email,
        password,
      })

      const ejec = response.data.ejecucion

      if (ejec.respuesta.estado === 'OK') {
        const data = ejec.data
        user.value = data.user
        roles.value = data.user.rol
        ejecucion.value = ejec

        setHeader(data.token)

        $q.notify({
          color: 'positive',
          message: 'Bienvenido!',
          icon: 'check',
          textColor: 'white',
        })
      } else {
        $q.notify({
          progress: true,
          message: ejec.respuesta.mensaje,
          icon: 'warning',
          color: 'white',
          textColor: 'negative',
        })
      }
    } catch (error) {
      $q.notify({
        progress: true,
        message: error.message || 'Error al iniciar sesión',
        icon: 'warning',
        color: 'white',
        textColor: 'negative',
      })
    }
  }

  async function googleLogin(credential) {
    try {
      console.log('\n----------> googleLogin')

      const response = await axiosInstance.post(LOGIN_GOOGLE_API_ROUTE, {
        idToken: credential,
      })

      const ejec = response.data.ejecucion

      if (ejec.respuesta.estado === 'OK') {
        const data = ejec.data
        user.value = data.user
        roles.value = data.user.rol
        ejecucion.value = ejec

        setHeader(data.token)

        $q.notify({
          color: 'positive',
          message: 'Bienvenido!',
          icon: 'check',
          textColor: 'white',
        })
      } else {
        $q.notify({
          progress: true,
          message: ejec.respuesta.mensaje,
          icon: 'warning',
          color: 'white',
          textColor: 'negative',
        })
      }
    } catch (error) {
      $q.notify({
        progress: true,
        message: error.message || 'Error al iniciar sesión con Google',
        icon: 'warning',
        color: 'white',
        textColor: 'negative',
      })
    }
  }

  async function fetch() {
    try {
      console.log('\n----------> fetch')
      const tokenStr = Cookies.get('token')
      if (!tokenStr) throw new Error('Token no encontrado')

      setHeader(tokenStr)

      const response = await axiosInstance.get(FETCH_API_ROUTE)
      const ejec = response.data.ejecucion

      if (ejec.respuesta.estado === 'OK') {
        const data = ejec.data
        user.value = data.user
        roles.value = data.user.rol

        ejecucion.value = ejec
        loginCallback()
      } else {
        throw new Error(ejec.respuesta.mensaje)
      }
    } catch (error) {
      console.error('Error en fetch:', error)
      clearSession()

      $q.notify({
        progress: true,
        message: error.message || 'Sesión expirada',
        icon: 'warning',
        color: 'white',
        textColor: 'negative',
      })
    }
  }

  function logout() {
    console.log('\n----------> logout')
    clearSession()
  }

  async function register(email, username, password) {
    try {
      console.log('\n----------> register')

      const response = await axiosInstance.post(REGISTER_API_ROUTE, {
        email,
        username,
        password,
      })

      const ejec = response.data.ejecucion

      if (ejec.respuesta.estado === 'OK') {
        const data = ejec.data
        user.value = data.user
        roles.value = data.user.rol
        ejecucion.value = ejec

        setHeader(data.token)

        $q.notify({
          color: 'positive',
          message: 'Registro exitoso, bienvenido!',
          icon: 'check',
          textColor: 'white',
        })
      } else {
        $q.notify({
          progress: true,
          message: ejec.respuesta.mensaje,
          icon: 'warning',
          color: 'white',
          textColor: 'negative',
        })
      }
    } catch (error) {
      $q.notify({
        progress: true,
        message: error.message || 'Error al registrarse',
        icon: 'warning',
        color: 'white',
        textColor: 'negative',
      })
    }
  }

  return {
    user,
    roles,
    token,
    ejecucion,
    ejecucionComputed,
    loggedIn,
    loginCallbacks,
    loginCallback,
    googleLogin,
    login,
    fetch,
    logout,
    hasRole,
    setHeader,
    register,
  }
})
