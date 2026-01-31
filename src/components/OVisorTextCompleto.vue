<template>
  <Dialog
    v-model:visible="localVisible"
    :header="header"
    modal
    maximizable
    :maximized="true"
    :draggable="false"
    :style="{ width: '100vw', height: '100vh', top: '0', left: '0' }"
    @hide="closeDialog"
  >
    <div v-html="fullText" class="full-screen-text"></div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  fullText: string
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
.full-screen-text {
  height: 100%;
  overflow: auto; /* Para hacer scroll si el contenido es grande */
}
</style>
