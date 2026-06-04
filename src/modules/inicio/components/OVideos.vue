<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import videoService from '@/modules/admin/Vidioteca/services/video.service'
import type { IVideo } from '@/modules/admin/Vidioteca/types/video.types'

const toast = useToast()

const videos = ref<IVideo[]>([])

const loadVideos = async () => {
  const response = await videoService.listarVideos()
  if (response) {
    videos.value = response
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch Videos',
      life: 3000
    })
  }
}

onMounted(() => {
  loadVideos()
})

const showDialog = ref(false)
const descripcionSeleccionada = ref('')

// Función para cortar texto
const truncate = (text: string, length = 40) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Abrir modal
const abrirDescripcion = (descripcion: string) => {
  descripcionSeleccionada.value = descripcion
  showDialog.value = true
}
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5>Videos</h5>
      <div class="grid">
        <div v-for="video in videos" :key="video.id" class="col-12 sm:col-12 md:col-6 lg:col-4 p-2">
          <div class="shadow-2 p-3 h-full flex flex-column surface-card" style="border-radius: 6px">
            <div class="text-900 font-medium text-base">{{ video.titulo }}</div>
            <div class="text-600 text-sm mb-1">
              {{ truncate(video.descripcion) }}

              <span
                v-if="video.descripcion?.length > 40"
                class="text-primary cursor-pointer ml-1"
                @click="abrirDescripcion(video.descripcion)"
              >
                Leer más
              </span>
            </div>
            
            <div class="flex align-items-center justify-content-center">
              <iframe
                :src="video.link"
                frameborder="0"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                "
                allowfullscreen
                width="100%"
                height="200px"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="showDialog" header="Descripción" :style="{ width: '400px' }" modal>
    <p class="m-0">
      {{ descripcionSeleccionada }}
    </p>
  </Dialog>
</template>

<style scoped></style>
