<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  id: Number,
  title: String,
  description: String,
  price: Number,
  duration: Number,
  tienefechalimite: Number,
  fechalimite: String,
  tipo: String,
  es_promocion: Number
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
        class="shadow-2 p-3 h-full flex border-200 flex-column surface-card border-2 hover:border-primary transition-duration-300 transition-all card-paquete"
        style="border-radius: 10px"
      >
        <div v-if="props.es_promocion === 1" class="ribbon">🔥PROMOCIÓN</div>
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
          v-if="props.es_promocion === 1"
          label="Canjear cupon"
          class="p-3 w-full"
          @click="$router.push('/canjeo/' + props.id + '/cupon')"
        ></Button>
        <Button
          v-else
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

.card-paquete {
  position: relative;
  overflow: hidden;
}

.ribbon {
  transition: all 0.3s ease;
  position: absolute;

  bottom: 18px;
  right: -45px;

  width: 160px;
  background: #dc2626;
  color: white;
  text-align: center;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 6px 0;

  transform: rotate(-45deg);

  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
  z-index: 10;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.card-paquete:hover .ribbon {
  background: #ef4444;
  transform: rotate(-45deg) scale(1.05);
}
</style>
