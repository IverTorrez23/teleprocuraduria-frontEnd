<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useToast } from 'primevue/usetoast'
import tablaConfigService from '../services/tablaConfig.service'
import type { ITablaConfig } from '../types/tablaConfig.types'
import { baseUrlResource } from '@/config/constants'
import { useLayout } from '@/layout/composables/layout'
import { TableSize } from '@/constants/constants'

const { layoutConfig } = useLayout()
const toast = useToast()
const tablaConfigDialog = ref(false)
const tablaConfigSelected = ref<ITablaConfig>()
const datosTablaConfig = ref<ITablaConfig>({
  id: 0,
  caja_contador: 0,
  deuda_extarna: 0,
  caja_admin: 0,
  ganancia_procesal_procuraduria: 0,
  titulo_index: '',
  texto_index: '',
  imagen_index: '',
  imagen_logo: '',
  nombre: '',
  archivo_url: '',
  estado: '',
  es_eliminado: 0,
  created_at: '',
  updated_at: ''
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const submitted = ref(false)
const imgIndex = ref('')
const imgLogo = ref('')

const logoUrl = computed(() => {
  return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`
})

const loadDatosTablaConfig = async () => {
  const response = await tablaConfigService.mostrarDatos()
  if (response) {
    tablaConfigSelected.value = response
    if (tablaConfigSelected.value.imagen_index) {
      imgIndex.value = `${baseUrlResource}/${tablaConfigSelected.value.imagen_index}`
    } else {
      imgIndex.value = '/demo/images/blocks/hero/hero-1.png'
    }

    if (tablaConfigSelected.value.imagen_logo) {
      imgLogo.value = `${baseUrlResource}/${tablaConfigSelected.value.imagen_logo}`
    } else {
      imgLogo.value = logoUrl.value
    }
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
watch(
  () => filters.value.global.value,
  () => {
    loadDatosTablaConfig()
  }
)

const hideDialog = () => {
  tablaConfigDialog.value = false
  submitted.value = false
}

const editDatosConfig = (tbconf: ITablaConfig) => {
  datosTablaConfig.value = { ...tbconf }
  tablaConfigDialog.value = true
}

let selectedFileIndex: any = null
const onFileSelectIndex = (event: any) => {
  selectedFileIndex = event.files[0]
}

let selectedFileLogo: any = null
const onFileSelectLogo = (event: any) => {
  selectedFileLogo = event.files[0]
}
const saveDatosTablaConfig = async () => {
  submitted.value = true
  if (!datosTablaConfig.value?.titulo_index || !datosTablaConfig.value?.texto_index) return
  const formData = new FormData()
  if (selectedFileIndex) {
    formData.append('imagen_index', selectedFileIndex)
  }
  if (selectedFileLogo) {
    formData.append('imagen_logo', selectedFileLogo)
  }
  formData.append('titulo_index', datosTablaConfig.value.titulo_index.toString())
  formData.append('texto_index', datosTablaConfig.value.texto_index.toString())
  try {
    if (datosTablaConfig.value.id) {
      formData.append('id', datosTablaConfig.value.id.toString())
      await tablaConfigService.updateTablaConfig(formData)

      toast.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Datos Updated',
        life: 3000
      })
    }
    selectedFileIndex = null
    selectedFileLogo = null
    hideDialog()
    loadDatosTablaConfig()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 })
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
                label="Actualizar"
                icon="pi pi-pencil"
                class="p-button-success mr-2"
                @click="tablaConfigSelected && editDatosConfig(tablaConfigSelected)"
              />
            </div>
          </template>
        </Toolbar>

        <h4>Datos</h4>
        <DataTable
          ref="dt2"
          dataKey="id"
          :value="[tablaConfigSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="titulo_index" header="Titulo Index">
            <template #body="">
              <span class="p-column-title">Titulo Index</span>
              <span>{{ tablaConfigSelected?.titulo_index }}</span>
            </template></Column
          >
        </DataTable>

        <DataTable
          ref="dt2"
          dataKey="id"
          :value="[tablaConfigSelected]"
          resizableColumns
          columnResizeMode="fit"
          showGridlines
          :size="TableSize.small"
          tableStyle="min-width: 50rem"
        >
          <Column field="texto_index" header="Texto Index">
            <template #body="">
              <span class="p-column-title">Texto Index</span>
              <span>{{ tablaConfigSelected?.texto_index }}</span>
            </template></Column
          >
        </DataTable>
        <br />
        <div class="contenedores-imagenes">
          <div class="contenedor">
            <span class="imagen-texto">Imagen Index</span>
            <img :src="imgIndex" alt="Imagen 1" class="imagen" />
          </div>
          <div class="contenedor">
            <span class="imagen-texto">Imagen Logo</span>
            <img :src="imgLogo" alt="Imagen 2" class="imagen" />
          </div>
        </div>

        <!-- create and edit modal -->
        <Dialog
          v-model:visible="tablaConfigDialog"
          :style="{ width: '550px' }"
          header="Datos Index"
          :modal="true"
          class="p-fluid"
        >
          <div class="field">
            <label for="titulo">Titulo Index</label>
            <InputText
              id="titulo_index"
              v-model.trim="datosTablaConfig.titulo_index"
              required="true"
              autofocus
              :invalid="submitted && !datosTablaConfig.titulo_index"
            />
            <small class="p-error" v-if="submitted && !datosTablaConfig.titulo_index"
              >Titulo es requerido.</small
            >
          </div>

          <div class="field">
            <label for="texto">Texto Index</label>
            <InputText
              id="texto_index"
              v-model.trim="datosTablaConfig.texto_index"
              required="true"
              autofocus
              :invalid="submitted && !datosTablaConfig.texto_index"
            />
            <small class="p-error" v-if="submitted && !datosTablaConfig.texto_index"
              >Texto index es requerido.</small
            >
          </div>

          <div class="field">
            <label for="imagen_index">Imagen Index</label>
            <Toast />
            <FileUpload
              id="imagen_index"
              v-model.trim="datosTablaConfig.imagen_index"
              mode="advanced"
              name="imagen_index"
              chooseLabel="Cargar"
              accept="image/*"
              :multiple="false"
              :invalid="submitted && !datosTablaConfig?.imagen_index"
              @select="onFileSelectIndex($event)"
            >
              <template #empty>
                <span>Arrastre y suelte archivos aquí para cargarlos.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !datosTablaConfig?.imagen_index"
              >Imagen index es requerido.</small
            >
          </div>

          <div class="field">
            <label for="imagen_logo">Imagen Logo</label>
            <Toast />
            <FileUpload
              id="imagen_logo"
              v-model.trim="datosTablaConfig.imagen_logo"
              mode="advanced"
              name="imagen_logo"
              chooseLabel="Cargar"
              accept="image/*"
              :multiple="false"
              :invalid="submitted && !datosTablaConfig?.imagen_logo"
              @select="onFileSelectLogo($event)"
            >
              <template #empty>
                <span>Arrastre y suelte archivos aquí para cargarlos.</span>
              </template>
            </FileUpload>
            <small class="p-error" v-if="submitted && !datosTablaConfig?.imagen_logo"
              >Imagen Logo es requerido.</small
            >
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button
              label="Save"
              icon="pi pi-check"
              class="p-button-text"
              @click="saveDatosTablaConfig"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.contenedores-imagenes {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Asegura que los contenedores estén alineados al principio */
  flex-wrap: wrap;
  gap: 20px; /* Espacio entre los contenedores */
}

.contenedor {
  display: flex;
  flex-direction: column; /* Organiza el texto arriba y la imagen abajo */
  justify-content: flex-start;
  align-items: center;
  width: 48%; /* Ambos contenedores ocuparán el mismo ancho */
  height: 300px; /* Altura fija para el contenedor */
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden; /* Evitar que el contenido se desborde */
}

.imagen-texto {
  font-size: 1.2rem;
  margin-bottom: 10px; /* Espacio entre el texto y la imagen */
  align-self: flex-start; /* Alinea el texto al principio del contenedor */
}

.imagen {
  max-width: 100%;
  max-height: 100%; /* Asegura que la imagen no exceda la altura del contenedor */
  height: auto;
  object-fit: contain; /* Ajusta la imagen dentro del contenedor sin perder proporción */
}

@media (max-width: 768px) {
  .contenedores-imagenes {
    flex-direction: column;
  }

  .contenedor {
    width: 100%; /* Los contenedores ocuparán el 100% del ancho en pantallas pequeñas */
  }
}
</style>
