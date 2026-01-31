<!-- src/components/OVisorImg.vue -->
<template>
    <Dialog v-model:visible="localVisible" :header="header" modal @hide="closeDialog">
      <img :src="imageUrl" alt="Imagen" class="img-fluid" v-if="imageUrl" />
    </Dialog> 
  </template>
  
  <script lang="ts" setup>
  import { ref, watch, defineProps, defineEmits } from 'vue'
  
  const props = defineProps<{
    imageUrl: string
    visible: boolean
    header?: string
  }>()
  
  const emit = defineEmits(['update:visible'])
  const localVisible = ref(props.visible)
  watch(() => props.visible, (newVal) => {
  localVisible.value = newVal
})
  const closeDialog = () => {
    emit('update:visible', false)
  }
  </script>
  
  <style scoped>
  .img-fluid {
    max-width: 100%;
    height: auto;
  }
  </style>
  