const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'detalle-api/:id',
        name: '/detalle-api',
        component: () => import('pages/gestion-apis/DetalleApi.vue'),
        props: true,
      },
    ],
  },

  {
    path: '/login/:isRegister?',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/auth/LoginPage.vue') }],
  },

  {
    path: '/confirmation',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/auth/ConfirmationPage.vue') }],
  },

  {
    path: '/confirmation/:emailConfirmationToken',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('pages/auth/EmailConfirmationToken.vue'), props: true },
    ],
  },

  {
    path: '/auth/github/callback',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/auth/github/Callback.vue') }],
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
      {
        path: 'catalogo',
        component: () => import('pages/CatalogoPage.vue'),
        meta: { authRequired: true },
      },
      {
        path: 'apis',
        component: () => import('pages/ApisPage.vue'),
        meta: { authRequired: true },
      },
      {
        path: 'detalle-api/:id',
        name: '/detalle-api',
        component: () => import('pages/gestion-apis/DetalleApi.vue'),
        props: true,
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
