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
  url_acuerdo_lider: '',
  url_acuerdo_indep: '',
  url_acuerdo_proc: ''
} as ITablaConfig)
let selectedFileLider: any = null
let selectedFileIndep: any = null
let selectedFileProc: any = null
const submitted = ref(false)

const loadDatosTablaConfig = async () => {
  const response = await tablaConfigService.mostrarDatos()
  if (response) {
    tablaConfigSelected.value = response
    //pdfUrl.value = `${baseUrlResource}/${tablaConfigSelected.value.url_acuerdo_lider}`
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

const onFileSelectLider = (event: any) => {
  selectedFileLider = event.files[0]
}
const onFileSelectIndep = (event: any) => {
  selectedFileIndep = event.files[0]
}
const onFileSelectProcurador = (event: any) => {
  selectedFileProc = event.files[0]
}

const saveAcuerdosUsuarios = async () => {
  loadingButtonSave.value = true
  submitted.value = true
  const formData = new FormData()
  if (selectedFileLider) {
    formData.append('url_acuerdo_lider', selectedFileLider)
  }
  if (selectedFileIndep) {
    formData.append('url_acuerdo_indep', selectedFileIndep)
  }
  if (selectedFileProc) {
    formData.append('url_acuerdo_proc', selectedFileProc)
  }

  try {
    if (datosTablaConfig.value.id) {
      formData.append('id', datosTablaConfig.value.id.toString())
      await tablaConfigService.updateAcuerdosUsuarios(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Documento Updated',
        life: 3000
      })
    }
    selectedFileLider = null
    selectedFileIndep = null
    selectedFileProc = null
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

const activeButton = ref<string>('') // guarda cuál botón está activo
const seleccionar = (valor: string) => {
  activeButton.value = valor
  if (!tablaConfigSelected.value) return
  switch (valor) {
    case 'op1': pdfUrl.value = `${baseUrlResource}/${tablaConfigSelected.value.url_acuerdo_lider}`
        
        break;
    case 'op2': pdfUrl.value = `${baseUrlResource}/${tablaConfigSelected.value?.url_acuerdo_indep}`
        
        break;
    case 'op3': pdfUrl.value = `${baseUrlResource}/${tablaConfigSelected.value?.url_acuerdo_proc}`
        
        break;
    default:
        break;
  }
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
        <Button
          label="Terminos Lider"
          :severity="activeButton === 'op1' ? 'success' : 'secondary'"
          rounded
          @click="seleccionar('op1')"
        /><Button
          label="Terminos Independiente"
          :severity="activeButton === 'op2' ? 'success' : 'secondary'"
          rounded
          @click="seleccionar('op2')"
        /><Button
          label="Terminos Procurador"
          :severity="activeButton === 'op3' ? 'success' : 'secondary'"
          rounded
          @click="seleccionar('op3')"
        />
        <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="500px"></iframe>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="documentoDialog"
          :style="{ width: '450px' }"
          header="Actualizar Terminos y Condiciones"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="foto_url">Terminos y Condiciones Abog. Lider</label>
            <Toast />
            <FileUpload
              id="url_acuerdo_lider"
              v-model.trim="datosTablaConfig.url_acuerdo_lider"
              mode="advanced"
              name="url_acuerdo_lider"
              url="/api/upload"
              chooseLabel="Cargar"
              accept="application/pdf"
              :multiple="false"
              :invalid="submitted && !datosTablaConfig?.url_acuerdo_lider"
              @select="onFileSelectLider($event)"
            >
              <template #empty>
                <span>Arrastre y suelte el archivo aquí para cargarlo.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !datosTablaConfig?.url_acuerdo_lider"
              >Archivo es requerido.</small
            >
          </div>

          <div class="field">
            <label for="url_acuerdo_indep">Terminos y Condiciones Abog. Independiente</label>
            <Toast />
            <FileUpload
              id="url_acuerdo_indep"
              v-model.trim="datosTablaConfig.url_acuerdo_indep"
              mode="advanced"
              name="url_acuerdo_indep"
              url="/api/upload"
              chooseLabel="Cargar"
              accept="application/pdf"
              :multiple="false"
              :invalid="submitted && !datosTablaConfig?.url_acuerdo_indep"
              @select="onFileSelectIndep($event)"
            >
              <template #empty>
                <span>Arrastre y suelte el archivo aquí para cargarlo.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !datosTablaConfig?.url_acuerdo_indep"
              >Archivo es requerido.</small
            >
          </div>

          <div class="field">
            <label for="url_acuerdo_proc">Terminos y Condiciones Procurador</label>
            <Toast />
            <FileUpload
              id="url_acuerdo_proc"
              v-model.trim="datosTablaConfig.url_acuerdo_proc"
              mode="advanced"
              name="url_acuerdo_proc"
              url="/api/upload"
              chooseLabel="Cargar"
              accept="application/pdf"
              :multiple="false"
              :invalid="submitted && !datosTablaConfig?.url_acuerdo_proc"
              @select="onFileSelectProcurador($event)"
            >
              <template #empty>
                <span>Arrastre y suelte el archivo aquí para cargarlo.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !datosTablaConfig?.url_acuerdo_proc"
              >Archivo es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveAcuerdosUsuarios"
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
