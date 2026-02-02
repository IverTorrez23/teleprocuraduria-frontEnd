<script setup>
import { ref } from 'vue'
import AppMenuItem from './AppMenuItem.vue'
import { TipoUsuario } from '@/constants/constants'
import { useAuthStore } from '../auth/stores/auth.store'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)

const countVencidasLeves = localStorage.getItem('cantidadVencidasLeves') ?? '0'
const countVencidasGraves = localStorage.getItem('cantidadVencidasGraves') ?? '0'
const countPrePresupuestadas = localStorage.getItem('cantidadPrePresupuestadas') ?? '0'

const modelProcurador = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Módulos',
    items: [
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: 'Enlistar Paracaidas', //Ordenar Por Pisos
            icon: 'pi pi-fw pi-sort-numeric-down',
            /*to: {
              path: '/causas',
              query: { orderby: 'piso' }
            }*/
           to: '/lista-paracaidas'
          },
          {
            label: 'Enlistar Urgencias', //Ordenar Por urgencias
            icon: 'pi pi-fw pi-clock',
            to:'/lista-urgencias'
            /*to: {
              path: '/causas',
              query: { orderby: 'urg' }
            }*/
          },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-exclamation-triangle',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-hourglass',
            to: '/causas-orden-vencidas-graves'
          },
          {
            label: 'Ejecutar Gestiones',
            icon: 'pi pi-fw pi-play-circle',
            /*to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }*/
           to:'/lista-ejecutar'
          }
        ]
      },
      {
        label: 'Capacitación',
        icon: 'pi pi-fw pi-graduation-cap',
        to: '/costo-judicial-venta'
      },
      {
        label: 'Videoteca',
        icon: 'pi pi-fw pi-video',
        to: '/videoteca-usuarios'
      },
      {
        label: 'Diccionario de Tramites',
        icon: 'pi pi-fw pi-file-import',
        to: '/diccionario-tramites'
      },
      {
        label: 'Biblioteca de normas',
        icon: 'pi pi-fw pi-file-import',
        to: '/biblioteca-normas'
      },
      {
        label: 'Pagos',
        icon: 'pi pi-fw pi-money-bill',
        to: '/mis-pagos'
      }
    ]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  }
])

const modelAbogIndependiente = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Módulos',
    items: [
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-exclamation-triangle',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-hourglass',
            to: '/causas-orden-vencidas-graves'
          },
          /*{
            label: 'Causas Inactivas',
            icon: 'pi pi-fw pi-stop-circle',
            to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }
          },*/
          {
            label: 'Causas Terminadas',
            icon: 'pi pi-fw pi-check-square',
            to: '/causas-terminadas'
          }
        ]
      },
      {
        label: 'Administración',
        icon: 'pi pi-fw pi-ticket',
        items: [
          { label: 'Adm. Causas', icon: 'pi pi-fw pi-ticket', to: '/admin-causas' },
          { label: 'Mis Billeteras', icon: 'pi pi-fw pi-wallet', to: '/billetera-transacciones' },
          { label: 'Mis Paquetes', icon: 'pi pi-fw pi-box', to: '/mis-paquetes' },
          { label: 'Compra de Paquetes', icon: 'pi pi-fw pi-cart-plus', to: '/lista-paquetes' }
        ]
      },
      {
        label: 'Diccionario de Tramites',
        icon: 'pi pi-fw pi-file-import',
        to: '/diccionario-tramites'
      },
      {
        label: 'Biblioteca de normas',
        icon: 'pi pi-fw pi-file-import',
        to: '/biblioteca-normas'
      },
      {
        label: 'Costos operativos',
        icon: 'pi pi-fw pi-money-bill',
        to: '/costos-operativos'
      },
      {
        label: 'Videoteca',
        icon: 'pi pi-fw pi-video',
        to: '/videoteca-usuarios'
      }
    ]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  }
])

const modelAbogLider = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Módulos',
    items: [
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-exclamation-triangle',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-hourglass',
            to: '/causas-orden-vencidas-graves'
          },
          /*{
            label: 'Causas Inactivas',
            icon: 'pi pi-fw pi-stop-circle',
            to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }
          },*/
          {
            label: 'Causas Terminadas',
            icon: 'pi pi-fw pi-check-square',
            to: '/causas-terminadas'
          }
        ]
      },
      {
        label: 'Administración',
        icon: 'pi pi-folder-open',
        items: [
          {
            label: 'Adm. Causas',
            icon: 'pi pi-cog',
            to: '/admin-causas'
          },
          { label: 'Mis Billeteras', icon: 'pi pi-fw pi-wallet', to: '/billetera-transacciones' },
          { label: 'Mis Paquetes', icon: 'pi pi-fw pi-box', to: '/mis-paquetes' },
          { label: 'Compra de Paquetes', icon: 'pi pi-fw pi-cart-plus', to: '/lista-paquetes' },
          { label: 'Crear Abogado Dependiente', icon: 'pi pi-user-plus', to: '/abogados/crear' }
        ]
      },

      {
        label: 'Diccionario de Tramites',
        icon: 'pi pi-fw pi-file-import',
        to: '/diccionario-tramites'
      },
      {
        label: 'Biblioteca de normas',
        icon: 'pi pi-fw pi-file-import',
        to: '/biblioteca-normas'
      },
      {
        label: 'Costos operativos',
        icon: 'pi pi-fw pi-money-bill',
        to: '/costos-operativos'
      },
      {
        label: 'Videoteca',
        icon: 'pi pi-fw pi-video',
        to: '/videoteca-usuarios'
      }
    ]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  }
])

const modelAbogDependiente = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Módulos',
    items: [
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-exclamation-triangle',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-hourglass',
            to: '/causas-orden-vencidas-graves'
          },
          /*{
            label: 'Causas Inactivas',
            icon: 'pi pi-fw pi-stop-circle',
            to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }
          },*/
          {
            label: 'Causas Terminadas',
            icon: 'pi pi-fw pi-check-square',
            to: '/causas-terminadas'
            
          }
        ]
      },
      {
        label: 'Administración',
        icon: 'pi pi-fw pi-ticket',
        items: [{ label: 'Adm. Causas', icon: 'pi pi-fw pi-ticket', to: '/admin-causas' }]
      },
      {
        label: 'Diccionario de Tramites',
        icon: 'pi pi-fw pi-file-import',
        to: '/diccionario-tramites'
      },
      {
        label: 'Biblioteca de normas',
        icon: 'pi pi-fw pi-file-import',
        to: '/biblioteca-normas'
      },
      {
        label: 'Costos operativos',
        icon: 'pi pi-fw pi-money-bill',
        to: '/costos-operativos'
      },
      {
        label: 'Videoteca',
        icon: 'pi pi-fw pi-video',
        to: '/videoteca-usuarios'
      }
    ]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  }
])

const modelTesorero = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Módulos',
    items: [
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-exclamation-triangle',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-hourglass',
            to: '/causas-orden-vencidas-graves'
          },
          {
            label: 'Enlistar Paracaidas', //Ordenar Por Pisos
            icon: 'pi pi-fw pi-sort-numeric-down',
            to: {
              path: '/causas',
              query: { orderby: 'piso' }
            }
          },
          {
            label: 'Enlistar Urgencias', //Ordenar Por urgencias
            icon: 'pi pi-fw pi-clock',
            to: {
              path: '/causas',
              query: { orderby: 'urg' }
            }
          },
         /* {
            label: 'Causas Inactivas',
            icon: 'pi pi-fw pi-stop-circle',
            to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }
          },*/
          {
            label: 'Causas Terminadas',
            icon: 'pi pi-fw pi-check-square',
            to: '/causas-terminadas'
          }
        ]
      },
      {
        label: 'Caja',
        icon: 'pi pi-fw pi-inbox',
        to: '/transacciones-contador'
      },
      {
        label: 'Diccionario de Tramites',
        icon: 'pi pi-fw pi-file-import',
        to: '/diccionario-tramites'
      },
      {
        label: 'Biblioteca de normas',
        icon: 'pi pi-fw pi-file-import',
        to: '/biblioteca-normas'
      },
      {
        label: 'Videoteca',
        icon: 'pi pi-fw pi-video',
        to: '/costo-judicial-venta'
      }
    ]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  }
])

const modelProcMaestro = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Módulos',
    items: [
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: 'Enlistar Paracaidas', //Ordenar Por Pisos
            icon: 'pi pi-fw pi-sort-numeric-down',
            /*to: {
              path: '/causas',
              query: { orderby: 'piso' }
            }*/
           to:'/lista-paracaidas'
          },
          {
            label: 'Enlistar Urgencias', //Ordenar Por urgencias
            icon: 'pi pi-fw pi-clock',
            /*to: {
              path: '/causas',
              query: { orderby: 'urg' }
            }*/
           to:'/lista-urgencias'
          },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-exclamation-triangle',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-hourglass',
            to: '/causas-orden-vencidas-graves'
          },
          /*{
            label: 'Causas Inactivas',
            icon: 'pi pi-fw pi-stop-circle',
            to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }
          },*/
          {
            label: 'Causas Terminadas',
            icon: 'pi pi-fw pi-check-square',
            /*to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }*/
           to:'causas-terminadas'
          },
          {
            label: 'Ejecutar Gestiones',
            icon: 'pi pi-fw pi-play-circle',
            /*to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }*/
           to:'/lista-ejecutar'
          }
        ]
      },
      {
        label: 'Actualizar',
        icon: 'pi pi-fw pi-pen-to-square',
        items: [
          { label: 'Tribunales', icon: 'pi pi-fw pi-building-columns', to: '/juzgados' }
        ]
      },
      {
        label: 'Videoteca',
        icon: 'pi pi-fw pi-video',
        to: '/costo-judicial-venta'
      },
      {
        label: 'Diccionario de Tramites',
        icon: 'pi pi-fw pi-file-import',
        to: '/diccionario-tramites'
      },
      {
        label: 'Biblioteca de normas',
        icon: 'pi pi-fw pi-file-import',
        to: '/biblioteca-normas'
      },
      {
        label: 'Pagos',
        icon: 'pi pi-fw pi-money-bill',
        to: '/costo-judicial-venta'
      }
    ]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  }
])

const modelAdmin = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Módulos',
    items: [
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-exclamation-triangle',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-hourglass',
            to: '/causas-orden-vencidas-graves'
          },
         // { label: 'Causas Inactivas', icon: 'pi pi-fw pi-stop-circle', to: '/mis-paquetes' },
          { label: 'Causas Terminadas', icon: 'pi pi-fw pi-check-square', to:'/causas-terminadas' },
          { label: 'Ejecutar Gestiones', icon: 'pi pi-fw pi-play-circle', to: '/lista-ejecutar' }
        ]
      },

      { label: 'Pago a Procuradores', icon: 'pi pi-fw pi-dollar', to: '/procurador-pago' },
      {
        label: 'Actualizar',
        icon: 'pi pi-fw pi-pen-to-square',
        items: [
          { label: 'Materias Legales', icon: 'pi pi-fw pi-receipt', to: '/materia' },
          { label: 'Tipos Legales', icon: 'pi pi-fw pi-ticket', to: '/tipo-legal' },
          { label: 'Tribunales', icon: 'pi pi-fw pi-building-columns', to: '/juzgados' },
          { label: 'Pisos', icon: 'pi pi-fw pi-building', to: '/pisos' },
          { label: 'Clase Tribunales', icon: 'pi pi-fw pi-tags', to: '/clase-tribunal' },
          { label: 'Localidades', icon: 'pi pi-fw pi-map', to: '/distritos' },
          { label: 'Categorias', icon: 'pi pi-fw pi-sitemap', to: '/categorias' }
        ]
      },
      {
        label: 'Informes Operativos',
        icon: 'pi pi-fw pi-address-book',
        items: [
          { label: 'Saldo Causas Activas', icon: 'pi pi-fw pi-chart-line', to: '/saldos-activos' },
         // { label: 'Saldo Causas Inactivas', icon: 'pi pi-fw pi-chart-bar', to: '/tipo-legal' },
          { label: 'Saldo Causas Terminadas', icon: 'pi pi-fw pi-chart-scatter', to: '/saldos-terminados' },
          { label: 'Saldo Por Causa', icon: 'pi pi-fw pi-calculator', to: '/pisos' }
        ]
      },
      { label: 'Usuarios', icon: 'pi pi-fw pi-users', to: '/billetera-transacciones' },
      { label: 'Avance Físico', icon: 'pi pi-fw pi-file-check', to: '/plantillas' },
      {
        label: 'Especiales',
        icon: 'pi pi-fw pi-crown',
        items: [
          { label: 'Exportar Base de Datos', icon: 'pi pi-fw pi-database', to: '/materia' },
          {
            label: 'Exportar Personalizado',
            icon: 'pi pi-fw pi-cloud-download',
            to: '/tipo-legal'
          },
          {
            label: 'Costo Judicial Venta',
            icon: 'pi pi-fw pi-money-bill',
            to: '/costo-judicial-venta'
          },
          { label: 'Notificaciones', icon: 'pi pi-fw pi-bell', to: '/notificaciones' },
          { label: 'Modificar Imagen Index', icon: 'pi pi-fw pi-image', to: '/config-index' },
          { label: 'Matriz Cotizaciones', icon: 'pi pi-fw pi-table', to: '/matriz' }
        ]
      },
      {
        label: 'Administración',
        icon: 'pi pi-fw pi-ticket',
        items: [
          { label: 'Paquetes', icon: 'pi pi-fw pi-box', to: '/paquetes' },
          { label: 'Operaciones Externas', icon: 'pi pi-fw pi-directions-alt', to: '/materia' },
          {
            label: 'Operaciones Internas (A,B,C,D y E)',
            icon: 'pi pi-fw pi-directions',
            to: '/transacciones-admin'
          },
          {
            label: 'Retiros',
            icon: 'pi pi-fw pi-dollar',
            to: '/retiros'
          },
          {
            label: 'Devolucion Saldos',
            icon: 'pi pi-fw pi-dollar',
            to: '/devolucion-saldos'
          },
          {
            label: 'Deposito a Billetera',
            icon: 'pi pi-fw pi-dollar',
            to: '/deposito-billetera'
          },
          {
            label: 'Operaciones de Capacitación',
            icon: 'pi pi-fw pi-graduation-cap',
            to: '/tipo-legal'
          },
          { label: 'Textos Predictivos', icon: 'pi pi-fw pi-file-edit', to: '/tipo-legal' },
          {
            label: 'Todas Las Videotecas',
            icon: 'pi pi-fw pi-folder',
            items: [
              { label: 'Videoteca Pública', icon: 'pi pi-fw pi-video', to: '/vidioteca' },
              {
                label: 'Videoteca de los Procuradores',
                icon: 'pi pi-fw pi-video',
                to: '/videoteca-procurador'
              },
              {
                label: 'Videoteca de los Abogados',
                icon: 'pi pi-fw pi-video',
                to: '/videoteca-abogado'
              }
            ]
          },
          //TRAMITES
          {
            label: 'TRÁMITES',
            icon: 'pi pi-fw pi-folder',
            items: [
              { label: 'Categoría Trámites', icon: 'pi pi-fw pi-tag', to: '/categoria-tramites' },
              {
                label: 'Diccinario de Tramites',
                icon: 'pi pi-fw pi-file-import',
                to: '/documentos-tramites'
              }
            ]
          },
          //NORMAS
          {
            label: 'NORMAS',
            icon: 'pi pi-fw pi-folder',
            items: [
              { label: 'Categoría Normas', icon: 'pi pi-fw pi-tag', to: '/categoria-normas' },
              {
                label: 'Biblioteca de Normas',
                icon: 'pi pi-fw pi-file-import',
                to: '/documentos-normas'
              }
            ]
          },
          { label: 'Aranceles Profesionales', icon: 'pi pi-fw pi-euro', to: '/arancel-abogados' },
          { label: 'Terminos y Condiciones', icon: 'pi pi-fw pi-file-check', to: '/terminos-condiciones' }
        ]
      }
    ]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  }
])

const model = ref([
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin' }]
  },
  {
    label: 'Configuración',
    items: [{ label: 'Perfil', icon: 'pi pi-fw pi-user-edit', to: '/configuracion/perfil' }]
  },
  {
    label: 'Módulos',
    items: [
      { label: 'Mis Paquetes', icon: 'pi pi-fw pi-objects-column', to: '/mis-paquetes' },
      { label: 'Billetera', icon: 'pi pi-fw pi-wallet', to: '/billetera-transacciones' },
      { label: 'Materia', icon: 'pi pi-fw pi-id-card', to: '/materia' },
      { label: 'Vidioteca', icon: 'pi pi-fw pi-video', to: '/vidioteca' },
      { label: 'Matriz', icon: 'pi pi-fw pi-id-card', to: '/matriz' },
      { label: 'Config. Index', icon: 'pi pi-fw pi-cog', to: '/config-index' },
      { label: 'Paquetes', icon: 'pi pi-fw pi-box', to: '/paquetes' },
      { label: 'Tipo Legal', icon: 'pi pi-fw pi-file', to: '/tipo-legal' },

      { label: 'Categorias', icon: 'pi pi-fw pi-book', to: '/categorias' },
      { label: 'Pisos', icon: 'pi pi-fw pi-book', to: '/pisos' },
      { label: 'Distritos', icon: 'pi pi-fw pi-book', to: '/distritos' },
      { label: 'Juzgados', icon: 'pi pi-fw pi-book', to: '/juzgados' },
      { label: 'Plantillas', icon: 'pi pi-fw pi-book', to: '/plantillas' },
      { label: 'Clase Tribunal', icon: 'pi pi-fw pi-book', to: '/clase-tribunal' },
      {
        label: 'Causas',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'Causas Activas', icon: 'pi pi-fw pi-bolt', to: '/causas' },
          {
            label: `Vencidas Leves <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasLeves}</span>`,
            icon: 'pi pi-fw pi-tag',
            to: '/causas-orden-vencidas-leves'
          },
          {
            label: `Vencidas Graves <span style="background-color: #ee0a0a; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countVencidasGraves}</span>`,
            icon: 'pi pi-fw pi-tag',
            to: '/causas-orden-vencidas-graves'
          },
          {
            label: `Pre Presupuestadas <span style="background-color: #10b981; color: #fff; padding: 0.2em 0.6em; border-radius: 50%; font-size: 0.75rem;display: inline-block; text-align: center; margin-left: 0.5em; min-width: 1.5em;">${countPrePresupuestadas}</span>`,
            icon: 'pi pi-fw pi-dollar',
            to: '/causas-orden-pre-presupuestada'
          },
          {
            label: 'Ordenar Por Categoria',
            icon: 'pi pi-fw pi-tag',
            to: {
              path: '/causas',
              query: { orderby: 'cat' }
            }
          },
          {
            label: 'Ordenar Por Pisos',
            icon: 'pi pi-fw pi-tag',
            to: {
              path: '/causas',
              query: { orderby: 'piso' }
            }
          }
        ]
      },
      {
        label: 'Costo Judicial Venta',
        icon: 'pi pi-fw pi-money-bill',
        to: '/costo-judicial-venta'
      },
      {
        label: 'Documentos',
        icon: 'pi pi-fw pi-folder',
        items: [
          { label: 'Categoría Trámites', icon: 'pi pi-fw pi-book', to: '/categoria-tramites' },
          { label: 'Categoría Normas', icon: 'pi pi-fw pi-book', to: '/categoria-normas' },
          { label: 'Documentos Trámites', icon: 'pi pi-fw pi-book', to: '/documentos-tramites' },
          { label: 'Documentos Normas', icon: 'pi pi-fw pi-book', to: '/documentos-normas' }
        ]
      }
    ]
  }
])
</script>

<template>
  <!-- Menu para administrador -->
  <ul class="layout-menu" v-if="usuario.tipo === TipoUsuario.ADMINISTRADOR">
    <template v-for="(item, i) in modelAdmin" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
  <!-- Menu para abogado lider -->
  <ul class="layout-menu" v-if="usuario.tipo === TipoUsuario.ABOGADO_LIDER">
    <template v-for="(item, i) in modelAbogLider" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
  <!-- Menu para abogado lider -->
  <ul class="layout-menu" v-if="usuario.tipo === TipoUsuario.ABOGADO_INDEPENDIENTE">
    <template v-for="(item, i) in modelAbogIndependiente" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
  <!-- Menu para abogado dependiente -->
  <ul class="layout-menu" v-if="usuario.tipo === TipoUsuario.ABOGADO_DEPENDIENTE">
    <template v-for="(item, i) in modelAbogDependiente" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
  <!-- Menu para tesorero/contador -->
  <ul class="layout-menu" v-if="usuario.tipo === TipoUsuario.CONTADOR">
    <template v-for="(item, i) in modelTesorero" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
  <!-- Menu para procurador -->
  <ul class="layout-menu" v-if="usuario.tipo === TipoUsuario.PROCURADOR">
    <template v-for="(item, i) in modelProcurador" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
  <!-- Menu para procurador maestro -->
  <ul class="layout-menu" v-if="usuario.tipo === TipoUsuario.PROCURADOR_MAESTRO">
    <template v-for="(item, i) in modelProcMaestro" :key="item">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
