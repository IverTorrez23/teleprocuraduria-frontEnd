<script setup lang="ts">
import OPDFViewer from '@/common/visorPdf/OPDFViewer.vue'
import OPDFList from '@/common/visorPdf/OPDFList.vue'
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { ITablaConfig } from '@/modules/admin/TablaConfig/types/tablaConfig.types'
import tablaConfigService from '@/modules/admin/TablaConfig/services/tablaConfig.service'
import { baseUrlResource } from '@/config/constants'

const toast = useToast()
const pdfs = ref([
  { id: 1, title: 'honorarios', src: '/src/assets/pdf/honorarios.pdf' }

  // Agrega más PDFs según necesites
])
const pdfUrl = ref('')
const selectedPdf = ref(pdfs.value[0]?.src)
const tablaConfigSelected = ref<ITablaConfig>()
const handleSelectPdf = (src:any) => {
  selectedPdf.value = src
}
const loadArancelesAbogado = async () => {
  const result = await tablaConfigService.obtenerArancelesAbog()

  if (result) {
    tablaConfigSelected.value = result
    pdfUrl.value = `${baseUrlResource}/${tablaConfigSelected.value.archivo_url}`
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: result || 'No se pudieron obtener las billeteras generales.',
      life: 3000
    })
  }
}
onMounted(() => {
 loadArancelesAbogado()
})
</script>

<template>
  <div class="w-full p-0 m-0">
    <Toast />
    <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-frame"></iframe>
  </div>
</template>

<style scoped>
.pdf-frame {
  width: 100%;
  height: calc(100vh - 140px);
  border: none;
  border-radius: 8px;
}
body, .layout-content {
  padding: 0 !important;
  margin: 0 !important;
}
</style>
