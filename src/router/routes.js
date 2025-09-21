const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  {
    path: '/login/:isRegister?',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/auth/LoginPage.vue') }],
  },

  {
    path: '/main',
    component: () => import('layouts/HomeLayout.vue'),
    meta: { authRequired: true },
    children: [
      {
        path: '',
        component: () => import('pages/HomePage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
