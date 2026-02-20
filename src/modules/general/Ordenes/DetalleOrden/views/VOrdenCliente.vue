<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import detalleOrdenService from '../services/detalleOrden.service'
import type { IOrden, IOrdenCodigo } from '../../types/orden.types'
import { onMounted, ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DynamicBreadcrumb from '@/common/components/Breadcrumb/DynamicBreadcrumb.vue'
import { formatCausaCodigo } from '@/common/utils/formatCausaCodigo'
import { TableSize, TinymceApiKey, TinymceConfig, TipoUsuario } from '@/constants/constants'
import { formatearFechaHora } from '@/common/utils/formatearFechaHora'
import { plazoSegunCondicion } from '@/common/utils/formatPlazoOrden'
import type { IMenuItem } from '@/common/utils/types/menuItem.types'
import type { IConfirmacion } from '@/modules/general/Confirmacion/types/confirmacion.types'
import confirmacionService from '@/modules/general/Confirmacion/services/confirmacion.service'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { storeToRefs } from 'pinia'
import type { IGestionAlternativa } from '@/modules/general/GestionAlternativa/types/gestionAlternativa.types'
import tribunalService from '@/modules/general/Tribunal/services/tribunal.service'
import type { ITribunal } from '@/modules/general/Tribunal/types/tribunal.types'
import cuerpoExpedienteService from '@/modules/general/CuerpoExpedientes/services/cuerpo-expediente.service'
import type { ICuerpoExpediente } from '@/modules/general/CuerpoExpedientes/types/cuerpo-expediente.types'
import gestionAlternativaService from '@/modules/general/GestionAlternativa/services/gestionAlternativa.service'
import { baseUrlResource } from '@/config/constants'
import usuarioService from '@/modules/general/Usuarios/services/usuario.service'
import type { IUsuario } from '@/modules/general/Usuarios/types/usuario.types'
import { openWhatsApp } from '@/common/utils/openWhatsApp'
import type { IRegistroLlamada } from '@/modules/general/RegistroLlamadas/types/registroLlamada.types'
import registroLlamadaService from '@/modules/general/RegistroLlamadas/services/registroLlamada.service'

const router = useRouter()
const authStore = useAuthStore()
const { usuario } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()
const route = useRoute()
const idOrden = Number(route.params.idOrden)
const idCausa = Number(route.params.idCausa)

const detalleOrden = ref<IOrden>()
const submitted = ref(false)
const deletOrdenDialog = ref(false)
const pronunciaAbogadoDialog = ref(false)
const rechazadescarga = ref(false)
const visibleCampoPropina = ref(false)
const verMotivoRechazoDialog = ref(false)
const loadingButtonSave = ref(false)
const loadingButtonAnular = ref(false)
const orden = ref<IOrden>({
  id: 0,
  sugerencia_presupuesto: ''
} as IOrden)

const confirmacion = ref<IConfirmacion>({
  id: 0,
  confir_abogado: 0,
  justificacion_rechazo: '',
  monto_propina: 0
} as IConfirmacion)

const tribunales = ref<ITribunal[]>([])
const abogadoCausa = ref<IUsuario>()
const expedientesDigitales = ref<ICuerpoExpediente[]>([])
const gestionesAlternativas = ref<IGestionAlternativa[]>([])
const registrosLlamadas = ref<IRegistroLlamada[]>([])

const solicitudGestionAlternativa = ref<IGestionAlternativa>({
  id: 0,
  solicitud_gestion: '',
  tribunal_id: 0,
  cuerpo_expediente_id: 0,
  detalle_gestion: '',
  orden_id: 0
} as IGestionAlternativa)
const registroLlamada = ref<IRegistroLlamada>({
  id: 0,
  numero_telefono: '',
  gestion_id: 0
} as IRegistroLlamada)
const loadDetallOrden = async () => {
  const response = await detalleOrdenService.listarDetalleOrden(idOrden)

  if (response.status === 'success' && response.data) {
    const orden: IOrdenCodigo = {
      ...response.data,
      codigoCausa: formatCausaCodigo(response.data)
    }
    detalleOrden.value = {
      ...orden,
      codigoCausa: orden.codigoCausa
    }  as unknown as IOrden
    if (detalleOrden.value && detalleOrden.value.descarga?.confirmacion) {
      confirmacion.value.id = detalleOrden.value.descarga?.confirmacion.id
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: response.message || 'No se pudo obtener detalle de la orden.',
      life: 3000
    })
  }

  loadAbogadoCausaByIdUsuario(detalleOrden.value!.causa!.abogado_id!)
  actualizarItems()
  loadTribunalesPorCausa(detalleOrden.value!.causa_id!)
  loadGestionAlternatvasDeOrden(detalleOrden.value!.id)

  if (route.query.modal === 'gestion' && route.query.id) {
    const id = parseInt(route.query.id as string, 10)
    if (!isNaN(id)) {
      await loadGestionAlternativaById(id)
      solicitudGestionALternativaDialog.value = true
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Error en el link',
        detail: 'ID inválido en el parámetro de la ruta',
        life: 3000
      })
    }
  }
}

const loadGestionAlternativaById = async (id: number) => {
  try {
    const response = await gestionAlternativaService.obtenerUnoById(id)
    if (response) {
      solicitudGestionAlternativa.value = response
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 4000
    })
  }
}
const loadTribunalesPorCausa = async (id: number) => {
  try {
    const response = await tribunalService.listarTribunalPorCausaId(id)

    if (response) {
      tribunales.value = [
        ...response.map((tribunal: ITribunal) => ({
          ...tribunal,
          nombreTribunal: `${tribunal.clase_tribunal?.nombre || ''}`
        })),
        {
          id: 0,
          expediente: '',
          codnurejianuj: '',
          link_carpeta: '',
          clasetribunal_id: 0,
          causa_id: 0,
          juzgado_id: 0,
          tribunal_dominante: 0,
          estado: '',
          es_eliminado: 0,
          created_at: '',
          updated_at: '',
          clase_tribunal: null,
          juzgado: null,
          cuerpo_expedientes: null,
          nombreTribunal: 'Exteriores'
        }
      ]
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 4000
    })
  }
}

const expedientesDeTribunal = async (idTribunal: number) => {
  const response = await cuerpoExpedienteService.listarExpedientesDigitalesDeTribunal(idTribunal)
  if (response) {
    expedientesDigitales.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch expedientes',
      life: 3000
    })
  }
}

const loadRegistroLlamadasDeGestion = async (idGestion: number) => {
  const response = await registroLlamadaService.listarRegistroLlamadasPorGestion(idGestion)
  if (response) {
    registrosLlamadas.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch registro de llamadas',
      life: 3000
    })
  }
}

const loadGestionAlternatvasDeOrden = async (id: number) => {
  try {
    const response = await gestionAlternativaService.listarGestionPorOrden(id)

    if (response) {
      gestionesAlternativas.value = [
        ...response.map((gestion: IGestionAlternativa) => ({
          ...gestion
          //nombreTribunal: `${tribunal.clase_tribunal?.nombre || ''}`
        }))
      ]
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 4000
    })
  }
}

onMounted(() => {
  loadDetallOrden()
})
watch(pronunciaAbogadoDialog, (isVisible) => {
  if (isVisible) {
    confirmacion.value.confir_abogado = null
    confirmacion.value.justificacion_rechazo = ''
    rechazadescarga.value = false
    visibleCampoPropina.value = false
  }
})

const home = { label: 'Causas', route: { name: 'Causas' } }
const breadcrumbItems = [
  {
    label: `Ficha ${idCausa}`,
    route: { name: 'Ficha', params: { id: route.params.idCausa } }
  },
  {
    label: 'Lista Ordenes',
    route: { name: 'Lista Ordenes', params: { idCausa: route.params.idCausa } }
  },
  {
    label: 'Detalle de la Orden '
  }
]

const sugerirPresupuestoDialog = ref(false)
const solicitudGestionALternativaDialog = ref(false)
const gestionAlternativa = ref(false)
const aceptarOrdenDialog = ref(false)
const items = ref<IMenuItem[]>([])

const actualizarItems = () => {
  items.value = [
    {
      label: 'Imprimir orden',
      icon: 'pi pi-fw pi-print',
      command: () => {
        console.log('impresion de orden')
      }
    }
  ]
  //Botones que usara el procurador
  if (!detalleOrden?.value?.presupuesto && usuario.value?.tipo === TipoUsuario.PROCURADOR) {
    items.value.push({
      label: 'Sugerir Presupuesto',
      icon: 'pi pi-fw pi-money-bill',
      command: () => {
        sugerirPresupuestoDialog.value = true
        if (detalleOrden.value) {
          orden.value.id = detalleOrden.value.id
          orden.value.sugerencia_presupuesto = detalleOrden.value.sugerencia_presupuesto
        }
      }
    })
  }
  if (
    !detalleOrden?.value?.fecha_recepcion &&
    detalleOrden?.value?.presupuesto &&
    detalleOrden?.value?.procurador_id === usuario.value?.id
  ) {
    items.value.push({
      label: 'Aceptar',
      icon: 'pi pi-fw pi-verified',
      command: () => {
        aceptarOrdenDialog.value = true
      }
    })
  }
  if (
    detalleOrden?.value?.presupuesto?.fecha_entrega &&
    detalleOrden.value.fecha_recepcion &&
    !detalleOrden?.value?.descarga &&
    detalleOrden?.value?.procurador_id === usuario.value?.id
  ) {
    items.value.push({
      label: 'Descargar',
      icon: 'pi pi-fw pi-arrow-right-arrow-left',
      command: () => {
        if (detalleOrden.value) {
          router.push('/causas/orden/' + detalleOrden.value.id + '/descargar')
        }
      }
    })
  }
  if (
    detalleOrden?.value?.presupuesto?.fecha_entrega &&
    detalleOrden.value.fecha_recepcion &&
    !detalleOrden?.value?.descarga &&
    detalleOrden?.value?.procurador_id === usuario.value?.id
  ) {
    items.value.push({
      label: 'Gestión Alternativa',
      icon: 'pi pi-fw pi-inbox',
      command: () => {
        solicitudGestionALternativaDialog.value = true
        solicitudGestionAlternativa.value = {} as IGestionAlternativa
      }
    })
  }
  //Boton presupuestar, solo lo vera el contador
  if (
    !detalleOrden?.value?.presupuesto?.fecha_entrega &&
    usuario.value?.tipo === TipoUsuario.CONTADOR
  ) {
    items.value.push({
      label: 'Presupuestar',
      icon: 'pi pi-fw pi-money-bill',
      command: () => {
        if (detalleOrden.value) {
          router.push('/causas/orden/' + detalleOrden.value.id + '/presupuestar')
        }
      }
    })
  }
  //Obciones para abogados
  if (detalleOrden.value && isAbogadoDeCausa(detalleOrden.value).value === true) {
    items.value.push(
      {
        label: 'Modificar',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          console.log('modificar')
          router.push({
            path: `/causas/ficha/lista-ordenes/crear-orden/${idCausa}`,
            query: { idorden: idOrden }
          })
        }
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-fw pi-trash',
        command: () => {
          deletOrdenDialog.value = true
        }
      }
    )

    if (
      detalleOrden.value.descarga &&
      !detalleOrden.value.descarga.confirmacion?.fecha_confir_abogado
    ) {
      items.value.push({
        label: 'Calificación',
        icon: 'pi pi-fw pi-list-check',
        command: () => {
          pronunciaAbogadoDialog.value = true
        }
      })
    }
  }
}

const isAbogadoDeCausa = (orden: IOrden) => {
  return computed(() => {
    return (
      ((usuario.value?.tipo === TipoUsuario.ABOGADO_LIDER ||
        usuario.value?.tipo === TipoUsuario.ABOGADO_INDEPENDIENTE) &&
        orden.causa.usuario_id === usuario.value.id) ||
      (usuario.value?.tipo === TipoUsuario.ABOGADO_DEPENDIENTE &&
        orden.causa.abogado_id === usuario.value.id &&
        orden.girada_por === TipoUsuario.ABOGADO_DEPENDIENTE)
    )
  })
}
const isProcuradorDeOrden = (orden: IOrden) => {
  return computed(() => {
    return (
      usuario.value?.tipo === TipoUsuario.PROCURADOR && orden.procurador_id === usuario.value.id
    )
  })
}
const hideDialog = () => {
  sugerirPresupuestoDialog.value = false
  solicitudGestionALternativaDialog.value = false
  gestionAlternativa.value = false
  deletOrdenDialog.value = false
  aceptarOrdenDialog.value = false
  submitted.value = false
  if (route.query.modal === 'gestion' && route.query.id) {
    router.push(`/causas/ficha/lista-ordenes/${idCausa}/detalle-orden/${idOrden}`)
  }
}
const saveSugerenciaPresupuesto = async () => {
  submitted.value = true
  if (!orden.value?.sugerencia_presupuesto) return

  try {
    if (orden.value.id) {
      await detalleOrdenService.sugerirPresupuesto(orden.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Sugerencia registrada',
        life: 3000
      })
    }
    hideDialog()
    loadDetallOrden()
    submitted.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al guardar sugerencia',
      life: 3000
    })
  }
}
const deleteOrden = async () => {
  try {
    if (detalleOrden.value && detalleOrden.value.id) {
      await detalleOrdenService.deleteOrden(detalleOrden.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Orden Deleted',
        life: 3000
      })
      deletOrdenDialog.value = false
      setTimeout(() => {
        router.push({ name: 'Lista Ordenes', params: { idCausa } })
      }, 3000)
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al eliminar la Orden',
      life: 6000
    })
  }
}
const aceptarOrden = async () => {
  try {
    if (detalleOrden.value && detalleOrden.value.id) {
      await detalleOrdenService.aceptarOrden(detalleOrden.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Orden Aceptada',
        life: 3000
      })
      aceptarOrdenDialog.value = false
      loadDetallOrden()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al aceptar Orden',
      life: 3000
    })
  }
}

const validateForm = () => {
  const mensajeToast = ref('')
  if (confirmacion.value.confir_abogado === null) {
    mensajeToast.value = 'Seleccione un opcion para calificar la orden.'
    alertToastError(mensajeToast.value)
    return false
  }
  if (rechazadescarga.value && !confirmacion.value.justificacion_rechazo) {
    mensajeToast.value = 'Ingrese la razón del rechazo.'
    alertToastError(mensajeToast.value)
    return false
  }
  // Si todas las validaciones pasan
  return true
}
const alertToastError = (mensaje: string) => {
  toast.add({
    severity: 'error',
    summary: 'Validación',
    detail: mensaje,
    life: 4000
  })
}
const savePronuncioAbogado = async () => {
  submitted.value = true
  // Validar el formulario antes de guardar
  if (!validateForm()) {
    return
  }
  try {
    if (confirmacion.value.confir_abogado != null && confirmacion.value.id) {
      await confirmacionService.pronunciaAbogado(confirmacion.value)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Pronunciamiento registrado',
        life: 3000
      })
      pronunciaAbogadoDialog.value = false
      submitted.value = false
      loadDetallOrden()
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Fallo al pronunciar la Orden',
      life: 10000
    })
  }
}
const onSelectClaseTribunal = (id: number) => {
  const tribunalId = id
  if (tribunalId) {
    expedientesDeTribunal(tribunalId)
  } else {
    expedientesDigitales.value = []
  }
}
const saveGestionAlternativa = async () => {
  submitted.value = true
  if (!solicitudGestionAlternativa.value?.solicitud_gestion) return
  loadingButtonSave.value = true
  try {
    solicitudGestionAlternativa.value.orden_id = idOrden
    if (solicitudGestionAlternativa.value!.id) {
      await gestionAlternativaService.updateGestionAlternativa(solicitudGestionAlternativa.value!)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Registro exitoso',
        life: 3000
      })
    } else {
      await gestionAlternativaService.createGestionAlternativa(solicitudGestionAlternativa.value)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Solicitud de gestion alternativa registrada',
        life: 3000
      })
    }
    hideDialog()
    loadDetallOrden()
    submitted.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Hubo un error al hacer el registro.',
      life: 10000
    })
  } finally {
    submitted.value = false
    loadingButtonSave.value = false
  }
}

const deleteSolicitudGestion = async () => {
  submitted.value = true
  if (!solicitudGestionAlternativa.value?.id) return
  loadingButtonAnular.value = true
  try {
    if (solicitudGestionAlternativa.value!.id) {
      await gestionAlternativaService.deleteGestionAlternativa(solicitudGestionAlternativa.value!)
      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Anulado correctamente',
        life: 3000
      })
    }
    hideDialog()
    loadDetallOrden()
    submitted.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Hubo un error al anular el registro.',
      life: 10000
    })
  } finally {
    submitted.value = false
    loadingButtonAnular.value = false
  }
}

const linkExpediente = ref('')
const mostrarGestion = async (gestion: IGestionAlternativa) => {
  if (gestion.cuerpo_expediente?.link_cuerpo) {
    if (isExternalLink(gestion.cuerpo_expediente?.link_cuerpo)) {
      linkExpediente.value = gestion.cuerpo_expediente?.link_cuerpo
    } else {
      linkExpediente.value = `${baseUrlResource}/${gestion.cuerpo_expediente?.link_cuerpo}`
    }
  }
  obtenerCantidadGestionesPosteriores(gestion.id, gestion.orden_id)
  if (gestion.tribunal_id > 0) {
    expedientesDeTribunal(gestion.tribunal_id)
  }
  solicitudGestionAlternativa.value = gestion
  solicitudGestionALternativaDialog.value = true
}
const isExternalLink = (url: string): boolean => {
  const regex = /^(https?:\/\/)/
  return regex.test(url)
}
const generarLinkGestionAlternativa = () => {
  const idGestion = solicitudGestionAlternativa.value?.id
  const idCausa = route.params.idCausa
  const idOrden = route.params.idOrden
  const url = `${window.location.origin}/causas/ficha/lista-ordenes/${idCausa}/detalle-orden/${idOrden}?modal=gestion&id=${idGestion}`

  navigator.clipboard.writeText(url)
  toast.add({
    severity: 'info',
    summary: 'Link copiado',
    detail: 'Puedes compartir este enlace',
    life: 3000
  })
}
const NohayGestionesPosteriores = ref(false)
const obtenerCantidadGestionesPosteriores = async (gestionId: number, ordenId: number) => {
  try {
    const cantidad = await gestionAlternativaService.contarGestionesPosteriores(gestionId, ordenId)
    NohayGestionesPosteriores.value = cantidad === 0
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: String(error),
      life: 3000
    })
  }
}
const telefonoAbogado = ref('')
const loadAbogadoCausaByIdUsuario = async (id: number) => {
  try {
    const response = await usuarioService.obtenerUnUsuarioById(id)
    if (response) {
      abogadoCausa.value = response
      telefonoAbogado.value = abogadoCausa.value?.persona?.telefono ?? ''
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 4000
    })
  }
}
const contactarPorWhatsApp = () => {
  registroLlamada.value.gestion_id = solicitudGestionAlternativa.value?.id
  registroLlamada.value.numero_telefono = telefonoAbogado.value
  saveRegiatroLlamada()
  const mensaje = 'Hola!'
  openWhatsApp(telefonoAbogado.value, mensaje)
}
const saveRegiatroLlamada = async () => {
  // submitted.value = true
  if (!telefonoAbogado.value) return

  try {
    await registroLlamadaService.createRegistroLlamada(registroLlamada.value)
    toast.add({
      severity: 'success',
      summary: 'Successful',
      detail: 'Llamada registrada',
      life: 3000
    })
    //submitted.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error || 'Hubo un error al hacer el registro de llamada.',
      life: 10000
    })
  } finally {
    // submitted.value = false
    // loadingButtonSave.value = false
  }
}

const requireConfirmation = (event: any) => {
  loadRegistroLlamadasDeGestion(event)
  confirm.require({
    group: 'headless',
    message: 'Save your current process?',

    accept: () => {
      toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 })
    },
    reject: () => {}
  })
}
</script>

<template>
  <DynamicBreadcrumb :home="home" :items="breadcrumbItems" class="mb-2" />
  <!-- <Menubar :model="items" class="card flex p-1 mb-2" /> -->
  <Tag
    severity="info"
    :value="'Lugar de ejecución: ' + detalleOrden?.lugar_ejecucion"
    rounded
    class="mb-1"
  ></Tag>
  <div class="card p-1">
    <div class="col-12">
      <Toast />
      <h5>Detalle de la Orden</h5>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <Column field="codigoCausa" header="Código de Causa" style="min-width: 3rem" frozen />

        <Column field="id" header="Número de la Orden" style="min-width: 3rem"></Column>
        <Column field="prioridad" header="Bandera" style="min-width: 4rem"></Column>

        <Column field="cotizacion.condicion" header="Plazo en Horas" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.cotizacion?.condicion
                ? plazoSegunCondicion(detalleOrden?.cotizacion?.condicion)
                : ''
            }}
          </template>
        </Column>
        <Column field="descarga.ultima_foja" header="Ultima Foja" style="min-width: 4rem">
          <template #body="">
            {{ detalleOrden?.descarga?.ultima_foja }}
          </template>
        </Column>
        <Column
          field="procurador.name"
          header="Procurador"
          style="min-width: 6rem"
          frozen
          alignFrozen="left"
        >
          <template #body="">
            {{ detalleOrden?.procurador?.persona?.nombre }}
            {{ detalleOrden?.procurador?.persona?.apellido }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <div class="card p-3">
    <div class="col-12">
      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="FECHAS DE CARGA" :colspan="4" />
            <Column header="FECHAS PARA GESTION" :colspan="2" :rowspan="2" />
            <Column header="FECHAS PARA LA DESCARGA" :colspan="3" :rowspan="2" />

            <Column header="FECHA CIERRE OFICIAL" :rowspan="4" field="descarga.fecha_descarga" />
          </Row>

          <Row>
            <Column header="INFORMACION Y DOCUMENTACION" :colspan="2" />
            <Column header="DINERO" :colspan="2" />
          </Row>

          <Row>
            <Column header="FECHA 1" :colspan="1" />
            <Column header="FECHA 2" :colspan="1" />
            <Column header="FECHA 3" :colspan="1" />
            <Column header="FECHA 4" :colspan="1" />
            <Column header="FECHA 5" :colspan="2" />
            <Column header="FECHA 6" :colspan="1" />
            <Column header="FECHA 7" :colspan="1" />
            <Column header="FECHA 8" :colspan="1" />
          </Row>
          <Row>
            <Column header="GIRO DE ORDEN" field="fecha_giro" />
            <Column header="PRESUPUESTO" field="presupuesto.fecha_presupuesto" />
            <Column header="CARGA INFO Y DOC" field="fecha_recepcion" />
            <Column header="ENTREGA PRESUPUESTO" field="presupuesto.fecha_entrega" />
            <Column header="INICIO VIGENCIA" field="fecha_inicio" />
            <Column header="FIN VIGENCIA" field="fecha_fin" />
            <Column header="DESCARGA" field="descarga.fecha_descarga" />
            <Column header="PRONUNCIO ABOGADO" field="descarga.confirmacion.fecha_confir_abogado" />
            <Column
              header="PRONUNCIO CONTADOR"
              field="descarga.confirmacion.fecha_confir_contador"
            />
          </Row>
        </ColumnGroup>

        <Column field="fecha_giro" style="min-width: 4rem">
          <template #body="">
            {{ detalleOrden?.fecha_giro ? formatearFechaHora(detalleOrden?.fecha_giro) : '' }}
          </template>
        </Column>
        <Column field="presupuesto.fecha_presupuesto" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.presupuesto?.fecha_presupuesto
                ? formatearFechaHora(detalleOrden?.presupuesto?.fecha_presupuesto)
                : ''
            }}
          </template>
        </Column>
        <Column field="fecha_recepcion" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.fecha_recepcion ? formatearFechaHora(detalleOrden?.fecha_recepcion) : ''
            }}
          </template>
        </Column>
        <Column field="presupuesto.fecha_entrega" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.presupuesto?.fecha_entrega
                ? formatearFechaHora(detalleOrden?.presupuesto?.fecha_entrega)
                : ''
            }}
          </template>
        </Column>
        <Column field="fecha_inicio" style="min-width: 4rem">
          <template #body="">
            {{ detalleOrden?.fecha_inicio ? formatearFechaHora(detalleOrden?.fecha_inicio) : '' }}
          </template>
        </Column>
        <Column field="fecha_fin" style="min-width: 4rem">
          <template #body="">
            {{ detalleOrden?.fecha_fin ? formatearFechaHora(detalleOrden?.fecha_fin) : '' }}
          </template>
        </Column>
        <Column field="descarga.fecha_descarga" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.descarga?.fecha_descarga
                ? formatearFechaHora(detalleOrden?.descarga?.fecha_descarga)
                : ''
            }}
          </template>
        </Column>
        <Column field="descarga.confirmacion.fecha_confir_abogado" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.descarga?.confirmacion?.fecha_confir_abogado
                ? formatearFechaHora(detalleOrden?.descarga?.confirmacion?.fecha_confir_abogado)
                : ''
            }}
          </template>
        </Column>
        <Column field="descarga.confirmacion.fecha_confir_contador" style="min-width: 4rem">
          <template #body="">
            {{
              detalleOrden?.descarga?.confirmacion?.fecha_confir_contador
                ? formatearFechaHora(detalleOrden?.descarga?.confirmacion?.fecha_confir_contador)
                : ''
            }}
          </template>
        </Column>
        <Column field="fecha_cierre" style="min-width: 4rem">
          <template #body="">
            {{ detalleOrden?.fecha_cierre ? formatearFechaHora(detalleOrden?.fecha_cierre) : '' }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <div class="card p-3">
    <div class="col-12">
      <div class="flex align-items-center justify-content-left">
        <h5>Elementos de la Orden</h5>
        &nbsp;&nbsp;
        <Tag
          v-if="
            detalleOrden?.descarga?.confirmacion?.fecha_confir_abogado &&
            detalleOrden?.descarga?.confirmacion?.confir_abogado === 0
          "
          icon="pi pi-question-circle"
          severity="contrast"
          value="Rechazado"
          :style="{ cursor: 'pointer' }"
          @click="verMotivoRechazoDialog = true"
        ></Tag>
        &nbsp;&nbsp;

        <div class="my-2 ml-2" v-for="gestion in gestionesAlternativas" :key="gestion.id">
          <Tag
            icon="pi pi-file-edit"
            severity="contrast"
            value="Gestión"
            :style="{ cursor: 'pointer' }"
            @click="mostrarGestion(gestion)"
          ></Tag>
        </div>
      </div>
      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="INFORMACIÓN" :colspan="2" />
          </Row>
          <Row>
            <Column header="CARGA INFORMACIÓN" :colspan="1" field="entrega_informacion" />
            <Column
              header="DESCARGA INFORMACIÓN"
              :colspan="1"
              field="descarga.detalle_informacion"
            />
          </Row>
        </ColumnGroup>
        <Column field="entrega_informacion" style="width: 50%" alignFrozen="left">
          <template #body="">
            <span v-html="detalleOrden?.entrega_informacion"></span>
          </template>
        </Column>
        <Column field="descarga.detalle_informacion" style="width: 50%" alignFrozen="left">
          <template #body="">
            <span v-html="detalleOrden?.descarga?.detalle_informacion"></span>
          </template>
        </Column>
      </DataTable>

      <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="DOCUMENTACIÓN" :colspan="2" />
          </Row>
          <Row>
            <Column header="CARGA DOCUMENTACIÓN" :colspan="1" field="entrega_documentacion" />
            <Column
              header="DESCARGA DOCUMENTACIÓN"
              :colspan="1"
              field="descarga.detalle_documentacion"
            />
          </Row>
        </ColumnGroup>
        <Column field="entrega_documentacion" style="width: 50%" alignFrozen="left">
          <template #body="">
            <span v-html="detalleOrden?.entrega_documentacion"></span>
          </template>
        </Column>
        <Column field="descarga.detalle_documentacion" style="width: 50%" alignFrozen="left">
          <template #body="">
            <span v-html="detalleOrden?.descarga?.detalle_documentacion"></span>
          </template>
        </Column>
      </DataTable>

      <!-- <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="DINERO" :colspan="3" />
          </Row>
          <Row>
            <Column header="PRESUPUESTO" :colspan="1" field="presupuesto.monto" />
            <Column header="GASTO" :colspan="1" field="descarga.gastos" />
            <Column header="SALDO" :colspan="1" field="descarga.saldo" />
          </Row>
        </ColumnGroup>
        <Column field="presupuesto.monto" style="width: 50%; text-align: right">
          <template #body="">
            {{ detalleOrden?.presupuesto?.monto }}
          </template>
        </Column>
        <Column field="descarga.gastos" style="width: 25%; text-align: right">
          <template #body="">
            {{ detalleOrden?.descarga?.gastos }}
          </template>
        </Column>
        <Column field="descarga.saldo" style="width: 25%; text-align: right">
          <template #body="">
            {{ detalleOrden?.descarga?.saldo }}
          </template>
        </Column>
      </DataTable> -->

      <!-- <DataTable
        :value="[detalleOrden]"
        :scrollable="true"
        scrollHeight="400px"
        scrollDirection="both"
        class="mt-3"
        :size="TableSize.small"
        showGridlines
      >
        <ColumnGroup type="header">
          <Row>
            <Column
              header="DETALLE PRESUPUESTO (CARGA DE DINERO)"
              :colspan="1"
              field="presupuesto.detalle_presupuesto"
            />
            <Column
              header="DETALLE DEL DINERO GASTADO (DESCARGA DE DINERO)"
              :colspan="1"
              field="descarga.detalle_gasto"
            />
          </Row>
        </ColumnGroup>
        <Column field="presupuesto.detalle_presupuesto" style="width: 50%">
          <template #body="">
            <span v-html="detalleOrden?.presupuesto?.detalle_presupuesto"></span>
          </template>
        </Column>
        <Column field="descarga.detalle_informacion" style="width: 50%">
          <template #body="">
            <span v-html="detalleOrden?.descarga?.detalle_gasto"></span>
          </template>
        </Column>
      </DataTable> -->
    </div>
  </div>

  <!-- modal sugerir presupuesto-->
  <Dialog
    v-model:visible="sugerirPresupuestoDialog"
    :style="{ width: '550px' }"
    header="Sugerir Presupuesto"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <label for="sugerencia">Sugerencia</label>
      <Editor
        id="sugerencia_presupuesto"
        v-model="orden.sugerencia_presupuesto"
        :api-key="TinymceApiKey"
        :init="TinymceConfig"
        required="true"
        :invalid="submitted && !orden.sugerencia_presupuesto"
      />
      <small class="p-error" v-if="submitted && !orden.sugerencia_presupuesto"
        >Sugerencia es requerido.</small
      >
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        @click="saveSugerenciaPresupuesto"
      />
    </template>
  </Dialog>
  <!-- modal solicitud gestion alternativa-->
  <Dialog
    v-model:visible="solicitudGestionALternativaDialog"
    :style="{ width: '800px' }"
    header="Solicitud de Gestión Aternativa"
    :modal="true"
    class="p-fluid"
  >
    <div
      class="field"
      v-if="
        !solicitudGestionAlternativa.detalle_gestion && isProcuradorDeOrden(detalleOrden!).value
      "
    >
      <label for="solicitud_gestion"><b>DETALLE DE LA IMPOSIBILIDAD:</b></label>
      <Editor
        id="solicitud_gestion"
        v-model="solicitudGestionAlternativa.solicitud_gestion"
        :api-key="TinymceApiKey"
        :init="TinymceConfig"
        required="true"
        :invalid="submitted && !solicitudGestionAlternativa.solicitud_gestion"
      />
      <small class="p-error" v-if="submitted && !solicitudGestionAlternativa.solicitud_gestion"
        >Solicitud es requerido.</small
      >
    </div>
    <div class="field" v-else>
      <label for="solicitud_gestion"><b>DETALLE DE LA IMPOSIBILIDAD:</b></label>
      <span v-html="solicitudGestionAlternativa?.solicitud_gestion"></span>
    </div>

    <Divider />
    <div
      class="formgrid grid"
      v-if="
        !solicitudGestionAlternativa.detalle_gestion && isProcuradorDeOrden(detalleOrden!).value
      "
    >
      <div class="field col-12 md:col-6">
        <label for="tribunal_id"><b>Seleccionar Tribunal</b></label>
        <Dropdown
          id="tribunal_id"
          v-model.trim="solicitudGestionAlternativa.tribunal_id"
          :options="tribunales"
          optionLabel="nombreTribunal"
          optionValue="id"
          placeholder="Seleccione tribunal"
          @change="onSelectClaseTribunal(solicitudGestionAlternativa.tribunal_id)"
        />
      </div>

      <div class="field col-12 md:col-6">
        <label for="cuerpo_expediente_id"><b>Seleccionar expediente digital</b></label>
        <Dropdown
          id="cuerpo_expediente_id"
          v-model.trim="solicitudGestionAlternativa.cuerpo_expediente_id"
          :options="expedientesDigitales"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccione expediente"
        />
      </div>
    </div>

    <div class="field" v-else>
      <label for="solicitud_gestion"><b>EXPEDIENTE DIGITAL DE REFERENCIA:</b></label
      ><br />
      <span v-if="solicitudGestionAlternativa.tribunal_id == 0">{{ 'Exteriores' }}</span>
      <span v-else>{{ solicitudGestionAlternativa?.tribunal?.clase_tribunal?.nombre }}</span
      >&nbsp;&nbsp;
      <span>
        <a :href="linkExpediente" target="_blank">{{
          solicitudGestionAlternativa?.cuerpo_expediente?.nombre
        }}</a></span
      >
    </div>

    <div
      class="field"
      v-if="
        isAbogadoDeCausa(detalleOrden!).value &&
        !detalleOrden?.descarga &&
        NohayGestionesPosteriores
      "
    >
      <label for="detalle_gestion"><b>SUGERENCIA DE GESTIÓN ALTERNATIVA:</b></label>
      <Editor
        id="detalle_gestion"
        v-model="solicitudGestionAlternativa!.detalle_gestion"
        :api-key="TinymceApiKey"
        :init="TinymceConfig"
        required="true"
        :invalid="submitted && !solicitudGestionAlternativa!.detalle_gestion"
      />
      <small class="p-error" v-if="submitted && !solicitudGestionAlternativa!.detalle_gestion"
        >Detalle de gestión es requerido.</small
      >
    </div>
    <div class="field" v-else>
      <label for="detalle_gestion"><b>SUGERENCIA DE GESTIÓN ALTERNATIVA:</b></label>
      <span v-html="solicitudGestionAlternativa?.detalle_gestion"></span>
    </div>

    <template #footer>
      <Button
        v-if="isProcuradorDeOrden(detalleOrden!).value && solicitudGestionAlternativa.id"
        label="Anular solicitud"
        icon="pi pi-times-circle"
        class="p-button-text"
        severity="danger"
        :disabled="loadingButtonAnular"
        :loading="loadingButtonAnular"
        @click="deleteSolicitudGestion"
      />
      <Button
        v-if="isProcuradorDeOrden(detalleOrden!).value && solicitudGestionAlternativa.id"
        label="Generar link"
        icon="pi pi-link"
        class="p-button-text"
        @click="generarLinkGestionAlternativa"
      />
      <Button
        v-if="
          isProcuradorDeOrden(detalleOrden!).value &&
          telefonoAbogado &&
          solicitudGestionAlternativa.id
        "
        label="Reg. llamadas"
        icon="pi pi-whatsapp"
        class="p-button-text"
        @click="contactarPorWhatsApp"
      />

      <Button
        v-if="solicitudGestionAlternativa.id"
        label="Llamadas"
        severity="info"
        rounded
        outlined
        @click="requireConfirmation(solicitudGestionAlternativa.id)"
      />
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button
        v-if="
          (isProcuradorDeOrden(detalleOrden!).value &&
            !solicitudGestionAlternativa.detalle_gestion) ||
          (isAbogadoDeCausa(detalleOrden!).value &&
            !detalleOrden?.descarga &&
            NohayGestionesPosteriores)
        "
        label="Save"
        icon="pi pi-check"
        class="p-button-text"
        :disabled="loadingButtonSave"
        :loading="loadingButtonSave"
        @click="saveGestionAlternativa"
      />
    </template>
  </Dialog>
  <!-- dialog delete  -->
  <Dialog
    v-model:visible="deletOrdenDialog"
    :style="{ width: '450px' }"
    header="Confirm"
    :modal="true"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="detalleOrden"
        >¿Estás seguro de eliminar la orden #<b>{{ detalleOrden.id }}</b
        >?</span
      >
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="deletOrdenDialog = false"
      />
      <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteOrden" />
    </template>
  </Dialog>

  <!-- modal aceptar orden-->
  <Dialog
    v-model:visible="aceptarOrdenDialog"
    :style="{ width: '550px' }"
    header="Aceptar Orden"
    :modal="true"
    class="p-fluid"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="detalleOrden"
        >¿Desea aceptar la orden #<b>{{ detalleOrden.id }}</b
        >?</span
      >
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
      <Button label="Aceptar" icon="pi pi-check" class="p-button-text" @click="aceptarOrden" />
    </template>
  </Dialog>
  <!-- Pronunciamiento abogado -->
  <Dialog
    v-model:visible="pronunciaAbogadoDialog"
    :style="{ width: '550px' }"
    header="Confirm"
    :modal="true"
    class="p-fluid"
  >
    <div class="field">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="detalleOrden">Califique la descarga de la orden</span> <br /><br />
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center">
          <RadioButton
            v-model="confirmacion.confir_abogado"
            inputId="confir_abogado"
            name="confir_abogado"
            :value="1"
            @click="(rechazadescarga = false), (visibleCampoPropina = true)"
          />
          <label for="aceptardescarga" class="ml-2">Aceptar</label>
        </div>
        <div class="flex items-center">
          <RadioButton
            v-model="confirmacion.confir_abogado"
            inputId="confir_abogado"
            name="confir_abogado"
            :value="0"
            @click="(rechazadescarga = true), (visibleCampoPropina = false)"
          />
          <label for="rechazardescarga" class="ml-2">Rechazar</label>
        </div>
      </div>
      <br />

      <div class="field" v-if="!rechazadescarga && visibleCampoPropina">
        <label for="propina" class="ml-2">Desea dejar una propina al procurador?</label>
        <InputNumber
          id="propina"
          v-model="confirmacion.monto_propina"
          mode="currency"
          currency="BOB"
          locale="es-BO"
          :minFractionDigits="2"
          :maxFractionDigits="2"
        />
      </div>

      <div class="field" v-if="rechazadescarga">
        <label for="rechazardescarga" class="ml-2">Justificación de rechazo</label>
        <Textarea
          v-model="confirmacion.justificacion_rechazo"
          rows="5"
          cols="30"
          required="true"
          :invalid="submitted && !confirmacion.justificacion_rechazo"
        />
        <small
          class="p-error"
          v-if="submitted && rechazadescarga && !confirmacion.justificacion_rechazo"
          >Juztificación de reachazo es requerido.</small
        >
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-text"
        @click="pronunciaAbogadoDialog = false"
      />
      <Button
        label="Registrar"
        icon="pi pi-check"
        class="p-button-text"
        @click="savePronuncioAbogado"
      />
    </template>
  </Dialog>

  <!-- modal ver detalle de rechazo-->
  <Dialog
    v-model:visible="verMotivoRechazoDialog"
    :style="{ width: '550px' }"
    header="Motivo de rechazo"
    :modal="true"
    class="p-fluid"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span v-if="detalleOrden">{{
        detalleOrden.descarga?.confirmacion?.justificacion_rechazo
      }}</span>
    </div>
    <template #footer>
      <Button
        label="Ok"
        icon="pi pi-check"
        class="p-button-text"
        @click="verMotivoRechazoDialog = false"
      />
    </template>
  </Dialog>

  <ConfirmPopup group="headless">
    <template #container="{ rejectCallback }">
      <div class="border-round p-3" :style="{ backgroundColor: '#495057', color: '#fff' }">
        <h5 :style="{ color: '#fff' }">Historial de Llamadas</h5>
        <table class="p-datatable-table p-datatable-striped custom-table" style="width: 100%">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha de Llamada</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(registro, index) in registrosLlamadas" :key="registro.id">
              <td>{{ index + 1 }}</td>
              <td>{{ registro.fecha_llamada }}</td>
            </tr>
          </tbody>
        </table>
        <div class="flex align-items-center gap-2 mt-3">
          <Button
            :style="{ backgroundColor: '#fff' }"
            label="Ok"
            rounded
            outlined
            @click="rejectCallback"
            severity="secondary"
            size="small"
            text
          ></Button>
        </div>
      </div>
    </template>
  </ConfirmPopup>
</template>
<style scoped lang="scss">
::v-deep(.p-datatable-frozen-tbody) {
  font-weight: bold;
}

::v-deep(.p-datatable-scrollable .p-frozen-column) {
  font-weight: bold;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.field.full-width {
  grid-column: span 3;
}
.field {
  margin-bottom: 0.1rem; /* disminuir el espacio */
}
@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
  .field.full-width {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  .field.full-width {
    grid-column: span 1;
  }
}

.custom-table td,
.custom-table th {
  padding: 0.5rem 1rem;
}
</style>
