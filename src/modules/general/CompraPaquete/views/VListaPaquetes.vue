<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

import OServicios from '@/modules/inicio/components/OServicios.vue'
import paqueteService from '@/modules/admin/Paquetes/services/paquete.service'
import type { IPaquete } from '@/modules/admin/Paquetes/types/paquete.types'

const toast = useToast()
const dt = ref()

const submitted = ref(false)

const paquetes = ref<IPaquete[]>([])

onMounted(() => {
  
  loadListadoPaquetes()
})



const hideDialog = () => {
  submitted.value = false
}

const loadListadoPaquetes = async () => {
  const response = await paqueteService.listarPaquetesSegunUsuario()
  console.log('response', response)
  if (response) {
    paquetes.value = response
    console.log('paquetes.value', paquetes.value)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener datos de paquetes',
      life: 3000
    })
  }
}
</script>
<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toast />

        <div class="grid">
        <OServicios
          v-for="(pkg, index) in paquetes"
          :key="index"
          :id="pkg.id"
          :title="pkg.nombre"
          :description="pkg.descripcion"
          :price="pkg.precio"
          :duration="pkg.cantidad_dias"
          :tienefechalimite="pkg.tiene_fecha_limite"
          :fechalimite="pkg.fecha_limite_compra"
        />
      </div>



      </div>
    </div>
  </div>
</template>
<style scoped lang="scss"></style>
