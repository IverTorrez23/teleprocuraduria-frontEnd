<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { baseUrlResource } from '@/config/constants'
import tablaConfigService from '../../TablaConfig/services/tablaConfig.service'
import type { ITablaConfig } from '../../TablaConfig/types/tablaConfig.types'

const toast = useToast()
const documentoDialog = ref(false)

const pdfUrl = ref('')
const tablaConfigSelected = ref<ITablaConfig>()
const loadingButtonSave = ref(false)
const datosTablaConfig = ref<ITablaConfig>({
  id: 0,
  nombre: '',
  archivo_url: ''
} as ITablaConfig)
let selectedFile: any = null
const submitted = ref(false)

const loadDatosTablaConfig = async () => {
  const response = await tablaConfigService.mostrarDatos()
  if (response) {
    tablaConfigSelected.value = response
    pdfUrl.value = `${baseUrlResource}/${tablaConfigSelected.value.archivo_url}`
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener datos',
      life: 3000
    })
  }
}

onMounted(() => {
  loadDatosTablaConfig()
})

const hideDialog = () => {
  documentoDialog.value = false
  submitted.value = false
}

const onFileSelect = (event: any) => {
  selectedFile = event.files[0]
}

const saveDocumento = async () => {
  loadingButtonSave.value = true
  submitted.value = true
  const formData = new FormData()
  if (selectedFile) {
    formData.append('archivo_url', selectedFile)
  }
  formData.append('nombre', datosTablaConfig.value.nombre.toString())
  try {
    if (datosTablaConfig.value.id) {
      formData.append('id', datosTablaConfig.value.id.toString())
      await tablaConfigService.updateArancelAbogado(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Updated',
        life: 3000
      })
    }
    selectedFile = null
    hideDialog()
    loadDatosTablaConfig()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save Documento',
      life: 3000
    })
  } finally {
    submitted.value = false
    loadingButtonSave.value = false
  }
}

const editDatosConfig = (tbconf: ITablaConfig) => {
  datosTablaConfig.value = { ...tbconf }
  documentoDialog.value = true
}
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />
        <Toolbar class="mb-4">
          <template #start>
            <div class="my-2">
              <Button
                label="Actualizar Aranceles"
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="tablaConfigSelected && editDatosConfig(tablaConfigSelected)"
              />
            </div>
          </template>
        </Toolbar>
        <Tag :value="tablaConfigSelected?.nombre" severity="success" />
        <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="500px"></iframe>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="documentoDialog"
          :style="{ width: '450px' }"
          header="Actualizar aranceles de abogados"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="nombre">Nombre</label>
            <InputText
              id="nombre"
              v-model.trim="datosTablaConfig.nombre"
              required="true"
              autofocus
              :invalid="submitted && !datosTablaConfig.nombre"
            />
            <small class="p-error" v-if="submitted && !datosTablaConfig.nombre"
              >Nombre es requerido.</small
            >
          </div>

          <div class="field">
            <label for="foto_url">Archivo</label>
            <Toast />
            <FileUpload
              id="archivo_url"
              v-model.trim="datosTablaConfig.archivo_url"
              mode="advanced"
              name="archivo_url"
              url="/api/upload"
              chooseLabel="Cargar"
              accept="application/pdf"
              :multiple="false"
              :invalid="submitted && !datosTablaConfig?.archivo_url"
              @select="onFileSelect($event)"
            >
              <template #empty>
                <span>Arrastre y suelte el archivo aquí para cargarlo.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !datosTablaConfig?.archivo_url"
              >Archivo es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveDocumento"
              :disabled="loadingButtonSave"
              :loading="loadingButtonSave"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
