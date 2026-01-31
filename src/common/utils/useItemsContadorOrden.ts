import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ICantidadEtapasOrden } from '@/modules/general/Ordenes/types/cantidadEtapasOrden.types'
import ordenService from '@/modules/general/Ordenes/services/orden.service'

const useItemsContadorOrden = () => {
  const router = useRouter()
  const itemsContadorOrden = ref<any[]>([])
  const cantidadEtapasOrden = ref<ICantidadEtapasOrden>()

  const loadCantidadEtapasOrden = async () => {
    const response = await ordenService.obtenerCantidadEtapasOrden()
    if (response) {
      cantidadEtapasOrden.value = response
      itemsContadorOrden.value = [
        {
          label: `Giradas`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenGiradas' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_giradas || 0
        },
        {
          label: 'Pre-presupuestadas',
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenPrePresupuestada' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_pre_presupuestadas || 0
        },
        {
          label: `Presupuestadas`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenPresupuestadas' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_presupuestadas || 0
        },
        {
          label: `Info/Doc entregados`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenInfoDocEntregado' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_aceptadas || 0
        },
        {
          label: `Dinero entregado`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenDineroEntregado' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_dinero_entregado || 0
        },
        {
          label: `Listas a realizar`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenListaRealizar' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_lista_realizar || 0
        },
        {
          label: `Descargadas`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenDescargadas' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_descargadas || 0
        },
        {
          label: `Pronuncio abogado`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenPronuncioAbogado' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_pronuncio_abogado || 0
        },
        {
          label: `Cuentas conciliadas`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenCuentasConciliadas' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_cuentas_conciliadas || 0
        },
        {
          label: `Vencidas Leves`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenVencidasLeves' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_vencidas_leves || 0
        },
        // ... demás elementos
        {
          label: `Vencidas Graves`,
          icon: 'pi pi-fw pi-print',
          command: () => {
            router.push({ name: 'CausasOrdenVencidasGraves' })
          },
          cantidad: cantidadEtapasOrden.value?.cantidad_vencidas_graves || 0
        }
      ]
    } else {
      console.log('Fallo al obtener cantidades')
    }
  }

  return {
    itemsContadorOrden,
    loadCantidadEtapasOrden
  }
}

export default useItemsContadorOrden
