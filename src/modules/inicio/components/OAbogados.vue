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
  <div class="grid">
     <Toast />
    <!-- <div class="col-12 lg:col-4">
      <div class="card">
        <h5>Lista de PDF</h5>
        <OPDFList :pdfs="pdfs" @selectPdf="handleSelectPdf" />
      </div>
    </div> -->

    <div class="col-12">
      <div class="card">
        <!-- <OPDFViewer :pdfSrc="pdfUrl" /> -->
        <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="500px"></iframe>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
