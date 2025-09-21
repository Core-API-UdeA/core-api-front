import { boot } from 'quasar/wrappers'
import { useAuthStore } from '../stores/auth-store'

export default boot(({ app, router }) => {
  const autenticacionStore = useAuthStore()

  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    const requiresAuth = to.matched.some((record) => record.meta.authRequired || record.meta.auth)
    const routeHasRoles = to.matched.find((record) => record.meta.auth)

    if (requiresAuth) {
      if (!authStore.loggedIn) {
        try {
          await authStore.fetch()
          if (!authStore.loggedIn) {
            return next('/login')
          }
        } catch (err) {
          return next('/login')
        }
      }

      if (routeHasRoles) {
        if (!authStore.hasRole(routeHasRoles.meta.auth)) {
          return next('/main')
        }
      }
    }

    next()
  })

  app.mounted = async () => {
    try {
      await autenticacionStore.fetch()
    } catch (err) {
      autenticacionStore.logout()
    }
  }

  const helper = {
    login: (data) => autenticacionStore.login(data),
    logout: () => autenticacionStore.logout(),
    loggedIn: autenticacionStore.loggedIn,
    hasRole: (roles) => autenticacionStore.hasRole(roles),
    setHeader: (data) => autenticacionStore.setHeader(data),
    fetch: () => autenticacionStore.fetch(),
  }

  app.config.globalProperties.$auth = helper

  autenticacionStore.loginCallback(() => console.log('Logged in'))
})
