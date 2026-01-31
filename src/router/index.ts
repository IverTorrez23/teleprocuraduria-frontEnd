import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/modules/admin/AppLayout.vue'
import { publicRoutes } from './publicRoutes'
import { abogadoLiderRoutes } from './abogadoLiderRoutes'
import { useAuthStore } from '@/modules/auth/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,

    // rutas privadas
    {
      path: '/admin',
      name: 'Admin',
      component: AppLayout,
      meta: {
        authRequired: true
      },
      children: [
        {
          path: '/admin',
          name: 'dashboard',
          component: () => import('@/modules/admin/Dashboard/views/VDashboard.vue'),
          meta: { tituloPagina: 'Dashboard' }
        },
        {
          path: '/configuracion/perfil',

          children: [
            {
              path: '/configuracion/perfil',
              component: () =>
                import('@/modules/admin/Configuracion/Perfil/views/VPerfilUsuario.vue'),
              meta: { requiresAuth: true }
            }
            //OTRAS CONFIGURACIONES AQUI
          ]
        },
        {
          path: '/mis-paquetes',
          name: 'MisPaquetes',
          component: () => import('@/modules/general/PaqueteCausa/views/VPaqueteCausa.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/materia',
          name: 'Materia',
          component: () => import('@/modules/admin/Materia/views/VMateria.vue'),
          meta: { tituloPagina: 'MATERIAS' }
        },
        {
          path: '/matriz',
          name: 'Matriz',
          component: () => import('@/modules/admin/MatrizCotizacion/views/VMatrizCotizacion.vue'),
          meta: { tituloPagina: 'MATRIZ' }
        },
        {
          path: '/config-index',
          name: 'Config Index',
          component: () => import('@/modules/admin/TablaConfig/views/VTablaConfig.vue'),
          meta: { tituloPagina: 'Configuraciones' }
        },
        {
          path: '/paquetes',
          name: 'Paquetes',
          component: () => import('@/modules/admin/Paquetes/views/VPaquetes.vue'),
          meta: { tituloPagina: 'Paquetes' }
        },
        {
          path: '/tipo-legal',
          name: 'Tipo Legal',
          component: () => import('@/modules/admin/TipoLegal/views/VTipoLegal.vue'),
          meta: { tituloPagina: 'TIPO LEGAL' }
        },
        {
          path: '/categorias',
          name: 'Categorias',
          component: () => import('@/modules/admin/Categorias/views/VCategorias.vue'),
          meta: { tituloPagina: 'CATEGORIAS' }
        },
        {
          path: '/pisos',
          name: 'Pisos',
          component: () => import('@/modules/admin/Piso/views/VPiso.vue'),
          meta: { tituloPagina: 'PISOS' }
        },
        {
          path: '/distritos',
          name: 'Distritos',
          component: () => import('@/modules/admin/Distritos/views/VDistrito.vue'),
          meta: { tituloPagina: 'DISTRITO' }
        },
        {
          path: '/juzgados',
          name: 'Juzgados',
          component: () => import('@/modules/admin/Juzgados/views/VJuzgados.vue'),
          meta: { tituloPagina: 'JUZGADOS' }
        },
        {
          path: '/plantillas',
          name: 'Plantillas',
          component: () => import('@/modules/admin/Plantilla/views/VPlantilla.vue'),
          meta: { tituloPagina: 'PLANTILLAS' }
        },
        {
          path: '/clase-tribunal',
          name: 'Clase Tribunal',
          component: () => import('@/modules/admin/ClaseTribunal/views/VClaseTribunal.vue'),
          meta: { tituloPagina: 'CLASE TRIBUNAL' }
        },
        {
          path: '/causas',
          name: 'Causas',
          component: () => import('@/modules/general/Causas/views/VCausas.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/causas/ficha/:id',
          name: 'Ficha',
          component: () => import('@/modules/general/Causas/views/VFicha.vue'),
          props: true
        },
        {
          path: '/causas/ficha/tribunal/:id/expedientedigital',
          name: 'ExpedienteDigital',
          component: () =>
            import('@/modules/general/CuerpoExpedientes/views/VCuerpoExpedientes.vue')
          //props: true
        },
        {
          path: '/categoria-tramites',
          name: 'Categoría Trámites',
          component: () =>
            import('@/modules/admin/DocumentosCategorias/views/VDocumentosCategoriaTramites.vue'),
          meta: { tituloPagina: 'CATEGORIA TRAMITES' }
        },
        {
          path: '/categoria-normas',
          name: 'Categoría Normas',
          component: () =>
            import('@/modules/admin/DocumentosCategorias/views/VDocumentosCategoriaNormas.vue'),
          meta: { tituloPagina: 'CATEGORIA NORMAS' }
        },
        {
          path: '/documentos-tramites',
          name: 'Documentos Tramites',
          component: () => import('@/modules/admin/Documentos/views/VDocumentosTramites.vue'),
          meta: { tituloPagina: 'DOCUMENTOS TRAMITES' }
        },
        {
          path: '/documentos-normas',
          name: 'Documentos Normas',
          component: () => import('@/modules/admin/Documentos/views/VDocumentosNormas.vue'),
          meta: { tituloPagina: 'DOCUMENTOS NORMAS' }
        },
        {
          path: '/plantillas/:idPlantilla/Posta',
          name: 'Posta',
          component: () => import('@/modules/admin/Posta/views/VPosta.vue'),
          props: true
        },
        {
          path: '/causas/ficha/lista-ordenes/:idCausa',
          name: 'Lista Ordenes',
          component: () => import('@/modules/general/Ordenes/views/VOrden.vue')
          //props: true
        },
        {
          path: '/causas/ficha/lista-ordenes/crear-orden/:idCausa',
          name: 'Crear Orden',
          component: () => import('@/modules/general/Ordenes/GirarOrden/views/VCrearOrden.vue')
          //props: true
        },

        {
          path: '/causas/ficha/lista-ordenes/:idCausa/detalle-orden/:idOrden',
          name: 'Detalle Orden',
          component: () => import('@/modules/general/Ordenes/DetalleOrden/views/VDetalleOrden.vue')
          //props: true
        },
        {
          path: '/vidioteca',
          name: 'Videos',
          component: () => import('@/modules/admin/Vidioteca/views/VVideo.vue'),
          meta: { tituloPagina: 'Videos' }
        },
        {
          path: '/causas/orden/:idOrden/presupuestar',
          name: 'Presupuestar',
          component: () => import('@/modules/general/Presupuesto/views/VPresupuesto.vue')
        },
        {
          path: '/causas/entregar-presupuesto',
          name: 'EntregarPresupuesto',
          component: () => import('@/modules/general/Presupuesto/views/VEntregarPresupuesto.vue')
        },
        {
          path: '/causas/devolver-presupuesto',
          name: 'DevolverPresupuesto',
          component: () => import('@/modules/general/Presupuesto/views/VDevolverPresupuesto.vue')
        },
        {
          path: '/causas/orden/:idOrden/descargar',
          name: 'Descargar',
          component: () => import('@/modules/general/Descarga/views/VDescarga.vue')
        },
        {
          path: '/costo-judicial-venta',
          name: 'CostoJudicialVenta',
          component: () => import('@/modules/admin/FinalCostos/views/VListadoFinalCosto.vue')
        },
        {
          path: '/billetera-transacciones',
          name: 'BilleteraTransacciones',
          component: () => import('@/modules/general/Billetera/views/VBilletera.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/causas-terminadas',
          name: 'CausasTerminadas',
          component: () => import('@/modules/general/Causas/views/VCausasTerminadas.vue')
        },
        {
          path: '/causas-orden-giradas',
          name: 'CausasOrdenGiradas',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesGiradas.vue')
        },
        {
          path: '/causas-orden-pre-presupuestada',
          name: 'CausasOrdenPrePresupuestada',
          component: () =>
            import(
              '@/modules/general/Causas/views/seguimientos/VCausasOrdenesPrePresupuestadas.vue'
            )
        },
        {
          path: '/causas-orden-presupuestada',
          name: 'CausasOrdenPresupuestadas',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesPresupuestadas.vue')
        },
        {
          path: '/causas-orden-infodoc-entregados',
          name: 'CausasOrdenInfoDocEntregado',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesAceptadas.vue')
        },
        {
          path: '/causas-orden-dinero-entregado',
          name: 'CausasOrdenDineroEntregado',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesDineroEntregado.vue')
        },
        {
          path: '/causas-orden-lista-relizar',
          name: 'CausasOrdenListaRealizar',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesListaRealizar.vue')
        },
        {
          path: '/causas-orden-descargadas',
          name: 'CausasOrdenDescargadas',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesDescargadas.vue')
        },
        {
          path: '/causas-orden-pronuncio-abogado',
          name: 'CausasOrdenPronuncioAbogado',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesPronuncioAbogado.vue')
        },
        {
          path: '/causas-orden-cuentas-conciliadas',
          name: 'CausasOrdenCuentasConciliadas',
          component: () =>
            import(
              '@/modules/general/Causas/views/seguimientos/VCausasOrdenesCuentasConciliadas.vue'
            )
        },
        {
          path: '/causas-orden-vencidas-leves',
          name: 'CausasOrdenVencidasLeves',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesVencidasLeves.vue')
        },
        {
          path: '/causas-orden-vencidas-graves',
          name: 'CausasOrdenVencidasGraves',
          component: () =>
            import('@/modules/general/Causas/views/seguimientos/VCausasOrdenesVencidasGraves.vue')
        },
        {
          path: '/causa/:idCausa/ordenes-giradas',
          name: 'OrdenesGiradas',
          component: () => import('@/modules/general/Ordenes/views/seguimiento/VOrdenesGiradas.vue')
        },
        {
          path: '/causa/:idCausa/ordenes-pre-presupuestadas',
          name: 'OrdenesPrePresupuestadas',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesPrePresupuestadas.vue')
        },
        {
          path: '/causa/:idCausa/ordenes-presupuestadas',
          name: 'OrdenesPresupuestadas',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesPresupuestadas.vue')
        },
        {
          path: '/causa/:idCausa/ordenes-infodoc-entregados',
          name: 'OrdenesInfoDocEntregados',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesAceptadas.vue')
        },
        {
          path: '/causa/:idCausa/ordenes-dinero-entregado',
          name: 'OrdenesDineroEntregado',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesDineroEntregado.vue')
        },
        {
          path: '/causa/:idCausa/listas-realizar',
          name: 'OrdenesListaRealizar',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesListaRealizar.vue')
        },
        {
          path: '/causa/:idCausa/descargadas',
          name: 'OrdenesDescargadas',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesDescargadas.vue')
        },
        {
          path: '/causa/:idCausa/pronuncio-abogado',
          name: 'OrdenesPronuncioAbogado',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesPronuncioAbogado.vue')
        },
        {
          path: '/causa/:idCausa/cuentas-conciliadas',
          name: 'OrdenesCuentasConciliadas',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesCuentasConciliadas.vue')
        },
        {
          path: '/causa/:idCausa/vencidas-leves',
          name: 'OrdenesVencidasLeves',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesVencidasLeves.vue')
        },
        {
          path: '/causa/:idCausa/vencidas-graves',
          name: 'OrdenesVencidasGraves',
          component: () =>
            import('@/modules/general/Ordenes/views/seguimiento/VOrdenesVencidasGraves.vue')
        },
        {
          path: '/transacciones-causa/:idCausa',
          name: 'TransaccionesDeCausa',
          component: () =>
            import('@/modules/general/TransaccionesCausas/views/VTransaccionesDeCausa.vue')
        },
        //Listado de causas de ordenes de lider
        {
          path: '/causas-orden-giradas-lider',
          name: 'CausasOrdenGiradasLider',
          component: () =>
            import('@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesGiradasLider.vue')
        },
        {
          path: '/causas-orden-pre-presupuestada-lider',
          name: 'CausasOrdenPrePresupuestadaLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesPrePresupuestadasLider.vue'
            )
        },
        {
          path: '/causas-orden-presupuestada-lider',
          name: 'CausasOrdenPresupuestadasLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesPresupuestadasLider.vue'
            )
        },
        {
          path: '/causas-orden-infodoc-entregados-lider',
          name: 'CausasOrdenInfoDocEntregadoLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesAceptadasLider.vue'
            )
        },
        {
          path: '/causas-orden-dinero-entregado-lider',
          name: 'CausasOrdenDineroEntregadoLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesDineroEntregadoLider.vue'
            )
        },
        {
          path: '/causas-orden-lista-relizar-lider',
          name: 'CausasOrdenListaRealizarLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesListaRealizarLider.vue'
            )
        },
        {
          path: '/causas-orden-descargadas-lider',
          name: 'CausasOrdenDescargadasLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesDescargadasLider.vue'
            )
        },
        {
          path: '/causas-orden-pronuncio-abogado-lider',
          name: 'CausasOrdenPronuncioAbogadoLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesPronuncioAbogadoLider.vue'
            )
        },
        {
          path: '/causas-orden-cuentas-conciliadas-lider',
          name: 'CausasOrdenCuentasConciliadasLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesCuentasConciliadasLider.vue'
            )
        },
        {
          path: '/causas-orden-vencidas-leves-lider',
          name: 'CausasOrdenVencidasLevesLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesVencidasLevesLider.vue'
            )
        },
        {
          path: '/causas-orden-vencidas-graves-lider',
          name: 'CausasOrdenVencidasGravesLider',
          component: () =>
            import(
              '@/modules/general/Causas/views/SeguimientoLider/VCausasOrdenesVencidasGravesLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/ordenes-giradas-lider',
          name: 'OrdenesGiradasLider',
          component: () =>
            import('@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesGiradasLider.vue')
        },
        {
          path: '/causa/:idCausa/ordenes-pre-presupuestadas-lider',
          name: 'OrdenesPrePresupuestadasLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesPrePresupuestadasLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/ordenes-presupuestadas-lider',
          name: 'OrdenesPresupuestadasLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesPresupuestadasLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/ordenes-infodoc-entregados-lider',
          name: 'OrdenesInfoDocEntregadosLider',
          component: () =>
            import('@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesAceptadasLider.vue')
        },
        {
          path: '/causa/:idCausa/ordenes-dinero-entregado-lider',
          name: 'OrdenesDineroEntregadoLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesDineroEntregadoLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/listas-realizar-lider',
          name: 'OrdenesListaRealizarLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesListaRealizarLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/descargadas-lider',
          name: 'OrdenesDescargadasLider',
          component: () =>
            import('@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesDescargadasLider.vue')
        },
        {
          path: '/causa/:idCausa/pronuncio-abogado-lider',
          name: 'OrdenesPronuncioAbogadoLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesPronuncioAbogadoLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/cuentas-conciliadas-lider',
          name: 'OrdenesCuentasConciliadasLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesCuentasConciliadasLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/vencidas-leves-lider',
          name: 'OrdenesVencidasLevesLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesVencidasLevesLider.vue'
            )
        },
        {
          path: '/causa/:idCausa/vencidas-graves-lider',
          name: 'OrdenesVencidasGravesLider',
          component: () =>
            import(
              '@/modules/general/Ordenes/views/SeguimientoLider/VOrdenesVencidasGravesLider.vue'
            )
        },
        {
          path: '/lista-paquetes',
          name: 'ListaPaquetes',
          component: () => import('@/modules/general/CompraPaquete/views/VListaPaquetes.vue')
        },
        {
          path: '/admin-causas',
          name: 'AdminCausas',
          component: () => import('@/modules/general/Causas/views/VAdministrarCausas.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/videoteca-procurador',
          name: 'VideoProcurador',
          component: () => import('@/modules/admin/Vidioteca/views/VVideoProcuradores.vue')
        },
        {
          path: '/videoteca-abogado',
          name: 'VideoAbogado',
          component: () => import('@/modules/admin/Vidioteca/views/VVideoAbogados.vue')
        },
        {
          path: '/videoteca-usuarios',
          name: 'VideoUsuarios',
          component: () => import('@/modules/admin/Vidioteca/views/VVideotecaUsuarios.vue')
        },
        {
          path: '/transacciones-admin',
          name: 'TransaccionesAdmin',
          component: () => import('@/modules/admin/TransaccionesAdmin/views/VTransaccionesAdmin.vue')
        },
        {
          path: '/transacciones-contador',
          name: 'TransaccionesContador',
          component: () => import('@/modules/general/TransaccionesContador/views/VTransaccionesContador.vue')
        },
        {
          path: '/procurador-pago',
          name: 'ProcuradorPago',
          component: () => import('@/modules/admin/ProcuradorPago/views/VProcuradorPago.vue')
        },
        {
          path: '/resumen-pagos',
          name: 'ResumenPagos',
          component: () => import('@/modules/admin/ProcuradorPago/views/VResumenPagos.vue')
        },
        {
          path: '/mis-pagos',
          name: 'MisPagos',
          component: () => import('@/modules/admin/ProcuradorPago/views/VMisPagos.vue')
        },
        {
          path: '/diccionario-tramites',
          name: 'DiccionarioTramites',
          component: () => import('@/modules/admin/Documentos/views/VDiccionarioTramites.vue')
        },
        {
          path: '/biblioteca-normas',
          name: 'BibliotecaNormas',
          component: () => import('@/modules/admin/Documentos/views/VBibliotecaNormas.vue')
        },
        {
          path: '/retiros',
          name: 'Retiros',
          component: () => import('@/modules/admin/Retiros/views/VRetiros.vue')
        },
        {
          path: '/devolucion-saldos',
          name: 'DevolucionSaldos',
          component: () => import('@/modules/admin/DevolucionSaldos/views/VDevolucionSaldo.vue')
        },
        {
          path: '/arancel-abogados',
          name: 'ArancelesAbogAdmin',
          component: () => import('@/modules/admin/Documentos/views/VArancelesAbogadoAdmin.vue')
        },
        {
          path: '/lista-paracaidas',
          name: 'ListaParacaidas',
          component: () => import('@/modules/general/GestionOrden/views/VOrdenListadoPorPiso.vue')
        },
        {
          path: '/lista-urgencias',
          name: 'ListaUrgencias',
          component: () => import('@/modules/general/GestionOrden/views/VOrdenListadoPorUrgencias.vue')
        },
        {
          path: '/lista-ejecutar',
          name: 'ListaEjecutar',
          component: () => import('@/modules/general/GestionOrden/views/VOrdenParaEjecutar.vue')
        },
        {
          path: '/tipo-posta',
          name: 'TipoPosta',
          component: () => import('@/modules/admin/TipoPostas/views/VTipoPostas.vue')
        },
        {
          path: '/historigrama/:idCausa',
          name: 'Historigrama',
          component: () => import('@/modules/general/CausaPostas/views/VCausaPosta.vue')
        },
        {
          path: '/notificaciones',
          name: 'Notificaciones',
          component: () => import('@/modules/admin/Notificaciones/views/VNotificacion.vue')
        },
        {
          path: '/costos-operativos',
          name: 'CostosOperativos',
          component: () => import('@/modules/general/Causas/views/VCostosOperativos.vue')
        },
        {
          path: '/detalle-costos-operativos/:id',
          name: 'DetalleCostosOperativos',
          component: () => import('@/modules/general/Causas/views/VDetalleCostosOperativos.vue'),
          props: true
        },
        {
          path: '/saldos-activos',
          name: 'SaldosActivos',
          component: () => import('@/modules/general/Causas/views/VSaldosActivosCausa.vue'),
          props: true
        },
        {
          path: '/saldos-terminados',
          name: 'SaldosTerminados',
          component: () => import('@/modules/general/Causas/views/VSaldosTerminadosCausa.vue'),
          props: true
        },
        {
          path: '/terminos-condiciones',
          name: 'TerminosCondiciones',
          component: () => import('@/modules/admin/TablaConfig/views/VAcuerdosUsuarios.vue')
        },
        {
          path: '/detalle-costos-operativos/:idCausa/detalle-orden/:idOrden',
          name: 'OrdenCliente',
          component: () => import('@/modules/general/Ordenes/DetalleOrden/views/VOrdenCliente.vue'),
          props: true
        },
        ...abogadoLiderRoutes,
        {
          path: '/:pathMatch(.*)*',
          redirect: '/'
        }
      ]
    }
  ]
})

router.onError((error, to) => {
  if (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed')
  ) {
    ;(window as Window).location = to.fullPath
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    authStore.routePreviewLogin = to.fullPath
    return next({ path: '/' })
  }

  next()
})
export default router
