export const publicRoutes = [
  {
    path: '/',
    name: 'inicio',
    component: () => import('@/modules/inicio/views/VInicio.vue'),
    children: [
      {
        path: '/',
        name: 'inicio',
        component: () => import('@/modules/inicio/components/OInicio.vue')
      },
      {
        path: '/billetera',
        name: 'billetera',
        component: () => import('@/modules/inicio/components/OBilletera.vue'),
        meta: {
          authRequired: true, // Esta ruta requiere autenticación
          role: 'admin' // Esta ruta requiere el rol 'admin'
        }
      },
      {
        path: '/tramites',
        name: 'tramites',
        component: () => import('@/modules/inicio/components/OTramites.vue')
      },
      {
        path: '/abogados',
        name: 'abogados',
        component: () => import('@/modules/inicio/components/OAbogados.vue')
      },
      {
        path: '/normas',
        name: 'normas',
        component: () => import('@/modules/inicio/components/ONormas.vue')
      },
      {
        path: '/videos',
        name: 'videos',
        component: () => import('@/modules/inicio/components/OVideos.vue')
      },
      {
        path: '/contactanos',
        name: 'contactanos',
        component: () => import('@/modules/inicio/components/OContacto.vue')
      },
      {
        path: '/paquete/:id/compra',
        name: 'CompraPaquete',
        component: () => import('@/modules/general/CompraPaquete/views/VCompraPaquete.vue')
      }
    ]
  }
]
