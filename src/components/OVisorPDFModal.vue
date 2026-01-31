<template>
  <Dialog 
     v-model:visible="localVisible" 
     :header="header" 
     modal
     :style="{ width: '100vw', height: '100vh', padding: 0, background:'red' }" 
     :contentStyle="{ height: '100%', padding: 0 }"  
     @hide="closeDialog"
     >
   <iframe 
     v-if="pdfUrl" 
     :src="pdfUrl" 
     style="width: 100%; height: 100%; border: none;"
     >
    </iframe> 
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  pdfUrl: string
  visible: boolean
  header?: string
}>()

const emit = defineEmits(['update:visible'])
const localVisible = ref(props.visible)
watch(
  () => props.visible,
  (newVal) => {
    localVisible.value = newVal
  }
)
const closeDialog = () => {
  emit('update:visible', false)
}
</script>

<style scoped>

</style>
