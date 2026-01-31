<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BilleteraService } from '../services/billetera.service'

const posts = ref<any[]>([])

const fetchPosts = async () => {
  try {
    posts.value = await BilleteraService.obtenerPosts()
  } catch (error) {
    console.error('Error fetching posts:', error)
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="surface-section px-4 py-8 md:px-6 lg:px-8 text-center">
    <div class="mb-3 font-bold text-2xl">
      <span class="text-900">BILLETERA </span>
    </div>
    <div class="text-700 text-sm mb-6">
      Ac turpis egestas maecenas pharetra convallis posuere morbi leo urna.
    </div>
    <div v-if="posts.length">
      <ul>
        <li v-for="post in posts" :key="post.id">
          <h3>{{ post.title }}</h3>
          <p>{{ post.body }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped></style>
