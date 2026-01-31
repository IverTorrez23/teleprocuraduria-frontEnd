<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  pdfs: Array
})

const emit = defineEmits(['selectPdf'])

const selectPdf = (src) => {
  emit('selectPdf', src)
}
</script>
<template>
  <div class="p-fluid">
    <ul class="list-none p-0 m-0">
      <li v-for="pdf in pdfs" :key="pdf.id" class="mb-1">
        <Button @click="selectPdf(pdf.src)" class="mr-2 mb-1" size="small">{{ pdf.title }}</Button>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
