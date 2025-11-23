const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'detalle-api/:id',
        component: () => import('pages/gestion-apis/DetalleApi.vue'),
        props: true,
      },
      {
        path: '/payment/success',
        name: 'payment-success',
        component: () => import('pages/pagos/PaymentSuccessPage.vue'),
        meta: { authRequired: true },
      },
      {
        path: '/payment/cancel',
        name: 'payment-cancel',
        component: () => import('pages/pagos/PaymentCancelPage.vue'),
        meta: {
          authRequired: false,
          title: 'Pago Cancelado',
        },
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
        children: [
          { path: '', component: () => import('pages/ApisPage.vue'), meta: { authRequired: true } },
          {
            path: 'registro',
            component: () => import('pages/gestion-apis/RegistroApi.vue'),
            meta: { authRequired: true },
          },
        ],
      },
      {
        path: 'detalle-api/:id',
        component: () => import('pages/gestion-apis/DetalleApi.vue'),
        props: true,
      },
    ],
  },

  // footer routes
  {
    path: '/terminos',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/TerminosPage.vue') }],
  },

  {
    path: '/quienes-somos',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/QuienesSomosPage.vue') }],
  },

  {
    path: '/contacto',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ContactoPage.vue') }],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
