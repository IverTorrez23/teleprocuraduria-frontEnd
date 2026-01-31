<script setup>
import { defineProps } from 'vue'
import PDF from 'pdf-vue3'

const props = defineProps({
  pdfSrc: String
})
</script>

<template>
  <PDF v-if="pdfSrc" :src="pdfSrc" />
</template>

<style scoped></style>
