<script setup lang="ts">
import OServicios from '../components/OServicios.vue'
import { useToast } from 'primevue/usetoast'
import tablaConfigService from '@/modules/admin/TablaConfig/services/tablaConfig.service'
import paqueteService from '@/modules/admin/Paquetes/services/paquete.service'
import type { ITablaConfig } from '@/modules/admin/TablaConfig/types/tablaConfig.types'
import type { IPaquete } from '@/modules/admin/Paquetes/types/paquete.types'
import { ref, onMounted, onUnmounted } from 'vue'
import { baseUrlResource } from '@/config/constants'

const isHidden = ref(false)
const toast = useToast()
const imgIndex = ref('')
const imgIndexMobile = ref('')
const tituloIndex = ref('')
const textoIndex = ref('')

const handleScroll = () => {
  if (window.scrollY > 100) {
    isHidden.value = true
  } else {
    isHidden.value = false
  }
}
const datosTablaConfig = ref<ITablaConfig>()
const paquetes = ref<IPaquete[]>([])

const loadDatosTablaConfig = async () => {
  const response = await tablaConfigService.mostrarDatos()
  if (response) {
    datosTablaConfig.value = response
    imgIndex.value = datosTablaConfig.value.imagen_index
      ? `${baseUrlResource}/${datosTablaConfig.value.imagen_index}`
      : '/demo/images/blocks/hero/hero-1.png'
    imgIndexMobile.value = datosTablaConfig.value.imagen_index_mobil
      ? `${baseUrlResource}/${datosTablaConfig.value.imagen_index_mobil}`
      : '/demo/images/blocks/hero/hero-1.png'
    tituloIndex.value = datosTablaConfig.value.titulo_index
      ? datosTablaConfig.value.titulo_index
      : 'Sistema de seguimiento de Causas'
    textoIndex.value = datosTablaConfig.value.texto_index
      ? datosTablaConfig.value.texto_index
      : 'Un sistema para gestionar sus procesos judiciales, moderno y eficiente con procuraduria'
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Fallo al obtener datos',
      life: 3000
    })
  }
}

const loadListadoPaquetes = async () => {
  const response = await paqueteService.listarPaquetes()
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
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadDatosTablaConfig()
  loadListadoPaquetes()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function scrollToPaquetes() {
  const paqueteSection = document.getElementById('paquetes')
  if (paqueteSection) {
    paqueteSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="landing-wrapper w-full overflow-hidden">
    <div id="inicio" class="inicio-container">
      <div class="">
       
        <picture>
          <!-- Imagen para móvil -->
          <source media="(max-width: 768px)" :srcset="imgIndexMobile" />

          <!-- Imagen para desktop -->
          <img :src="imgIndex" alt="img" class="md:ml-auto block md:h-full w-full" />
        </picture>
      </div>
    </div>
    <div id="paquetes" class="surface-ground px-4 pt-2 pb-6 md:px-6 lg:px-8">
  <div class="text-center mb-1">
  
  <h2 class="text-900 text-3xl font-semibold m-0">
    Venta de paquetes
  </h2>
</div>
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
</template>

<style scoped>
.landing-wrapper img {
  max-height: 650px;
}

.hero-image {
  clip-path: polygon(20% 0, 100% 0%, 100% 100%, 0 100%);
  position: relative;
}

.slidedown-icon-container {
  position: absolute;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.5s;
}

.hidden {
  opacity: 0;
}

@media (min-width: 1200px) {
  .slidedown-icon-container {
    bottom: 150px;
  }
}

@media (min-width: 768px) and (max-width: 1280px) {
  .slidedown-icon-container {
    bottom: 50px;
  }
}

@media (max-width: 767px) {
  .hero-image {
    clip-path: none;
  }

  .slidedown-icon-container {
    bottom: 10px;
  }
}

@keyframes slidedown-icon {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(20px);
  }

  100% {
    transform: translateY(0);
  }
}

.slidedown-icon {
  animation: slidedown-icon;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

@media (max-width: 768px) {
  .inicio-container {
    height: 50vh; /* no tan alto en móvil */
  }
}

@media (max-width: 768px) {
  #paquetes {
    padding-top: 0.5rem !important;
  }
}

@media (max-width: 768px) {
  #paquetes .text-center {
    margin-bottom: 0.5rem !important;
  }
}
</style>
