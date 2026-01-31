// src/router/routes/abogadoLiderRoutes.ts

export const abogadoLiderRoutes = [
  //   {
  //     path: '/administracion/documentos-tramites',
  //     name: 'GestionDocumentosTramites',
  //     component: () =>
  //       import(
  //         '@/modules/abogadoLider/Administracion/DocumentosTramites/views/VDocumentosTramites.vue'
  //       ),
  //     meta: { authRequired: true, role: 'abogadoLider', tituloPagina: 'Gestión de Documentos' }
  //   },

  {
    path: '/abogados/crear',
    name: 'CrearAbogadoDependiente',
    component: () => import('@/modules/general/Usuarios/views/VAbogadoDependiente.vue'),
    meta: { requiresAuth: true, role: 'abogadoLider', tituloPagina: 'Crear Abogado Dependiente' }
  }
  //   {
  //     path: '/billeteras',
  //     name: 'MisBilleteras',
  //     component: () => import('@/modules/abogadoLider/Billeteras/views/VBilleteras.vue'),
  //     meta: { authRequired: true, role: 'abogadoLider', tituloPagina: 'Mis Billeteras' }
  //   },
  //   {
  //     path: '/paquetes-compra',
  //     name: 'CompraPaquetes',
  //     component: () => import('@/modules/abogadoLider/PaquetesCompra/views/VCompraPaquetes.vue'),
  //     meta: { authRequired: true, role: 'abogadoLider', tituloPagina: 'Compra de Paquetes' }
  //   }
]
