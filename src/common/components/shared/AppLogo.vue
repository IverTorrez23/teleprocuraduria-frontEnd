<script setup lang="ts">
import { computed } from 'vue'
import { useLayout } from '@/layout/composables/layout'

const { layoutConfig } = useLayout()

const logoUrl = computed(() => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  const file = layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'
  return `${baseUrl}layout/images/${file}.svg`
})

defineProps<{
  width?: string
  height?: string
  class?: string
  alt?: string
}>()
</script>

<template>
  <img :src="logoUrl" :alt="alt || 'Logo'" :width="width" :height="height" :class="class" />
</template>
