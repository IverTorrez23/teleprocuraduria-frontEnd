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
</script>

<template>
  <div class="col-12">
    <div class="card">
      <h5>Videos</h5>
      <div class="grid">
        <div v-for="video in videos" :key="video.id" class="col-12 sm:col-12 md:col-6 lg:col-4 p-2">
          <div class="shadow-2 p-3 h-full flex flex-column surface-card" style="border-radius: 6px">
            <div class="text-900 font-medium text-xl mb-2">{{ video.titulo }}</div>
            <div class="text-600">{{ video.descripcion }}</div>
            <hr class="my-3 mx-0 border-top-1 border-none surface-border" />
            <div class="flex align-items-center justify-content-center">
              <iframe
                :src="video.link"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
</template>
<style scoped></style>
