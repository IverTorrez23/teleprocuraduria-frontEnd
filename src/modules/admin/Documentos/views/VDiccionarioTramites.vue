<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useScreenSize } from '@/common/utils/useScreenSize'
import { baseUrlResource } from '@/config/constants'
import type { ITreeNodeLista } from '@/modules/admin/DocumentosCategorias/types/treeNode.types'
import documentoCategoriaService from '@/modules/admin/DocumentosCategorias/services/documentoCategoria.service'
import documentoService from '@/modules/admin/Documentos/services/documento.service'

const toast = useToast()

const menuCollapsed = ref(false)
const { isMobile } = useScreenSize()
const selectedPdf = ref('')

const onDocumentSelect = (event: any) => {
  if (event.data.type === 'PDF') {
    selectedPdf.value = `${baseUrlResource}/${event.data.pdfUrl}`
    if (isMobile.value) {
      menuCollapsed.value = true // Oculta el menú si es móvil
    }
  }
}

const treeNodesList = ref<ITreeNodeLista[]>([])
const loadCategoriasTramitesYDocumentos = async () => {
  const response = await documentoCategoriaService.listarSoloCategoriasTramites()

  if (response) {
    const categorias = await Promise.all(
      response.map(async (categoria) => {
        const subcategorias = await documentoCategoriaService.listarSubCategorias(categoria.id)
        const documentos = await documentoService.listadoDocTramtesDeCategoria(categoria.id) // Obtener documentos de la categoría
        // Si "documentos" es undefined, usar un array vacío
        const documentosNodos = documentos
          ? documentos.map((doc) => ({
              key: `doc-${doc.id}`,
              label: doc.nombre,
              data: {
                name: doc.nombre,
                type: 'PDF',
                pdfUrl: doc.archivo_url
              },
              leaf: true // Es una hoja, no tiene más hijos
            }))
          : [] // Si "documentos" es undefined, asignar un array vacío

        return {
          key: categoria.id.toString(),
          label: categoria.nombre,
          data: {
            name: categoria.nombre,
            size: '',
            type: 'Categoría'
          },
          children: [
            // Subcategorías
            ...(subcategorias
              ? await Promise.all(
                  subcategorias.map(async (sub) => {
                    const subSubcategorias2 = await documentoCategoriaService.listarSubCategorias(
                      sub.id
                    )
                    const documentosSubcategoria =
                      await documentoService.listadoDocTramtesDeCategoria(sub.id) // Obtener documentos de la subcategoría
                    const documentosSubNodos = documentosSubcategoria
                      ? documentosSubcategoria.map((doc) => ({
                          key: `doc-${doc.id}`,
                          label: doc.nombre,
                          data: {
                            name: doc.nombre,
                            type: 'PDF',
                            pdfUrl: doc.archivo_url
                          },
                          leaf: true // Es una hoja, no tiene más hijos
                        }))
                      : [] // Si "documentos" es undefined, asignar un array vacío

                    return {
                      key: sub.id.toString(),
                      label: sub.nombre,
                      data: {
                        name: sub.nombre,
                        size: '',
                        type: 'Subcategoría'
                      },
                      children: [
                        // SubSubcategorías
                        ...(subSubcategorias2
                          ? await Promise.all(
                              subSubcategorias2.map(async (sub2) => {
                                const subSubcategorias3 =
                                  await documentoCategoriaService.listarSubCategorias(sub2.id)
                                const documentosSubSubcategoria =
                                  await documentoService.listadoDocTramtesDeCategoria(sub2.id)
                                const documentosSubSubNodos = documentosSubSubcategoria
                                  ? documentosSubSubcategoria.map((doc) => ({
                                      key: `doc-${doc.id}`,
                                      label: doc.nombre,
                                      data: {
                                        name: doc.nombre,
                                        type: 'PDF',
                                        pdfUrl: doc.archivo_url
                                      },
                                      leaf: true // Es una hoja, no tiene más hijos
                                    }))
                                  : [] // Si "documentos" es undefined, asignar un array vacío

                                return {
                                  key: sub2.id.toString(),
                                  label: sub2.nombre,
                                  data: {
                                    name: sub2.nombre,
                                    size: '',
                                    type: 'SubSubcategoría'
                                  },
                                  children: [
                                    // Añadir documentos de subsubcategoría
                                    ...documentosSubSubNodos,
                                    ...(subSubcategorias3
                                      ? await Promise.all(
                                          subSubcategorias3.map(async (sub3) => {
                                            const documentosSubSubSubcategoria =
                                              await documentoService.listadoDocTramtesDeCategoria(
                                                sub3.id
                                              )
                                            const documentosSubSubSub3Nodos =
                                              documentosSubSubSubcategoria
                                                ? documentosSubSubSubcategoria.map((doc) => ({
                                                    key: `doc-${doc.id}`,
                                                    label: doc.nombre,
                                                    data: {
                                                      name: doc.nombre,
                                                      type: 'PDF',
                                                      pdfUrl: doc.archivo_url
                                                    },
                                                    leaf: true // Es una hoja, no tiene más hijos
                                                  }))
                                                : [] // Si "documentos" es undefined, asignar un array vacío

                                            return {
                                              key: sub3.id.toString(),
                                              label: sub3.nombre,
                                              data: {
                                                name: sub3.nombre,
                                                size: '',
                                                type: 'SubSubSubcategoría'
                                              },
                                              children: [
                                                // Añadir documentos de subsubsubcategoría
                                                ...documentosSubSubSub3Nodos
                                              ]
                                            }
                                          })
                                        )
                                      : [])
                                  ]
                                }
                              })
                            )
                          : []),
                        // Añadir documentos de la subcategoría
                        ...documentosSubNodos
                      ]
                    }
                  })
                )
              : []),
            // Añadir documentos de la categoría principal
            ...documentosNodos // Documentos mapeados
          ]
        } as ITreeNodeLista
      })
    )

    // Asignar las categorías y documentos al treeNodesList
    treeNodesList.value = categorias
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch tramites',
      life: 3000
    })
  }
}

onMounted(() => {
  loadCategoriasTramitesYDocumentos()
})
const colContraida = ref(false)
</script>
<template>
  <div class="grid">
    <!-- Columna izquierda -->
<div :class="['col-12', colContraida ? 'lg:col-0 hidden' : 'lg:col-4']">
  <div class="card">
    <Button
      icon="pi pi-angle-double-left"
      class="mb-2"
      @click="colContraida = true"
      v-if="!colContraida"
    />
    <h5>Lista de PDF</h5>
    <TreeTable :value="treeNodesList" selection-mode="single" @node-select="onDocumentSelect">
      <Column field="name" header="Trámites" expander>
        <template #body="slotProps">
          <span
            :class="slotProps.node.data.type === 'PDF' ? 'pi pi-file-pdf' : 'pi pi-folder'"
          ></span>
          {{ slotProps.node.data.name }}
        </template>
      </Column>
    </TreeTable>
  </div>
</div>

    <!-- Columna derecha -->
<div :class="['col-12', colContraida ? 'lg:col-12' : 'lg:col-8']">
  <div class="card">
    <Button
      icon="pi pi-angle-double-right"
      class="mb-2"
      @click="colContraida = false"
      v-if="colContraida"
    />
    <div v-if="selectedPdf" class="pdf-viewer-container">
      <iframe :src="selectedPdf" frameborder="0" class="pdf-viewer"></iframe>
    </div>
    <p v-else>Seleccione un documento para visualizarlo</p>
  </div>
</div>


  </div>
</template>
<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100vh; /* Ajusta la altura según tus necesidades */
}
</style>
