<script setup lang="ts">
import { defineProps, ref } from 'vue'

const props = defineProps({
  id: Number,
  title: String,
  description: String,
  price: Number,
  duration: Number,
  tienefechalimite: Number,
  fechalimite: String,
  tipo: String
})
const tipoPaquete = ref('')
if (props.tipo === 'ABOGADO_INDEPENDIENTE') {
  tipoPaquete.value = 'Paquete Personal'
} else {
  tipoPaquete.value = 'Paquete Corporativo'
}
</script>

<template>
  <div class="col-12 lg:col-4">
    <div class="p-3 h-full">
      <div
        v-animateonscroll="{ enterClass: 'fadeInUp', leaveClass: 'fadeOut' }"
        class="shadow-2 p-3 h-full flex border-200 flex-column surface-card border-2 hover:border-primary transition-duration-300 transition-all"
        style="border-radius: 10px"
      >
        <div class="flex justify-content-between align-items-center mb-2">
          <div class="text-900 font-medium text-xl">
            {{ props.title }}
          </div>

          <span class="tipo-paquete">
            {{ tipoPaquete }}
          </span>
        </div>

        <hr class="my-3 mx-0 border-top-1 border-none surface-border" />
        <ul class="list-none p-0 m-0 flex-grow-1">
          <li
            v-animateonscroll="{ enterClass: 'fadeInLeft', leaveClass: 'fadeOut' }"
            class="flex align-items-center mb-3"
          >
            <i class="pi pi-check-circle text-green-500 mr-2"></i>
            <span>Vigencia de {{ props.duration }} días</span>
          </li>
          <li
            v-animateonscroll="{ enterClass: 'fadeInLeft', leaveClass: 'fadeOut' }"
            class="flex align-items-center mb-3"
          >
            <i class="pi pi-check-circle text-green-500 mr-2"></i>
            <span>Por {{ props.price }} Bs.</span>
          </li>

          <li
            v-animateonscroll="{ enterClass: 'fadeInLeft', leaveClass: 'fadeOut' }"
            class="flex align-items-center mb-3"
            v-if="props.tienefechalimite === 1"
          >
            <i class="pi pi-check-circle text-green-500 mr-2"></i>
            <span>Hasta {{ props.fechalimite }} para comprar</span>
          </li>
        </ul>
        <hr class="mb-3 mx-0 border-top-1 border-none surface-border mt-auto" />
        <div class="text-600" style="font-size: small">
          <i>{{ props.description }}</i>
        </div>
        <hr class="mb-3 mx-0 border-top-1 border-none surface-border mt-auto" />
        <Button
          label="Comprar"
          class="p-3 w-full"
          @click="$router.push('/paquete/' + props.id + '/compra')"
        ></Button>
      </div>
    </div>
  </div>
</template>
<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fadeInUp {
  animation: fadeInUp 1s ease-out;
}

.fadeInLeft {
  animation: fadeInLeft 1s ease-out;
}

.fadeInRight {
  animation: fadeInRight 1s ease-out;
}
.tipo-paquete {
  background-color: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
