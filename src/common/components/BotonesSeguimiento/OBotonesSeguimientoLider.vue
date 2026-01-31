<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ICantidadEtapasOrden } from '@/modules/general/Ordenes/types/cantidadEtapasOrden.types'
import ordenService from '@/modules/general/Ordenes/services/orden.service'

const router = useRouter()

const goToRoute = (routeName: string) => {
  router.push({ name: routeName })
}
const cantidadEtapasOrden = ref<ICantidadEtapasOrden>()
const countOrdenGirada = ref(0)
const countOrdenPresupuestada = ref(0)
const countInfoDocEntregado = ref(0)
const countDineroEntregado = ref(0)
const countListaRealizar = ref(0)
const countDescargadas = ref(0)
const countPronuncioAbogado = ref(0)
const countCuentasConciliada = ref(0)
///
const countVencidasLeves = ref(0)
const countVencidasGraves = ref(0)
const countPrePresupuestadas = ref(0)
const isHorizontalVisible = ref(true)

const loadCantidadEtapasOrdenDeLider = async () => {
  const response = await ordenService.obtenerCantidadEtapasOrdenDeLider()
  if (response) {
    cantidadEtapasOrden.value = response
    countOrdenGirada.value = cantidadEtapasOrden.value?.cantidad_giradas || 0
    countOrdenPresupuestada.value = cantidadEtapasOrden.value?.cantidad_presupuestadas || 0
    countInfoDocEntregado.value = cantidadEtapasOrden.value?.cantidad_aceptadas || 0
    countDineroEntregado.value = cantidadEtapasOrden.value?.cantidad_dinero_entregado || 0
    countListaRealizar.value = cantidadEtapasOrden.value?.cantidad_lista_realizar || 0
    countDescargadas.value = cantidadEtapasOrden.value?.cantidad_descargadas || 0
    countPronuncioAbogado.value = cantidadEtapasOrden.value?.cantidad_pronuncio_abogado || 0
    countCuentasConciliada.value = cantidadEtapasOrden.value?.cantidad_cuentas_conciliadas || 0
    ///
    countVencidasLeves.value = cantidadEtapasOrden.value?.cantidad_vencidas_leves || 0
    countVencidasGraves.value = cantidadEtapasOrden.value?.cantidad_vencidas_graves || 0
    countPrePresupuestadas.value = cantidadEtapasOrden.value?.cantidad_pre_presupuestadas || 0
    localStorage.setItem('cantidadVencidasLeves', countVencidasLeves.value.toString())
    localStorage.setItem('cantidadPrePresupuestadas', countPrePresupuestadas.value.toString())
    localStorage.setItem('cantidadVencidasGraves', countVencidasGraves.value.toString())
  } else {
    console.log('Fallo al obtener cantidades')
  }
}

onMounted(() => {
    loadCantidadEtapasOrdenDeLider()
})

const iconClass = computed(() => {
  return isHorizontalVisible.value ? 'pi pi-angle-down flecha' : 'pi pi-angle-up flecha'
})
const toggleVisibility = async () => {
  isHorizontalVisible.value = !isHorizontalVisible.value
}
</script>

<template>
  <div class="card custom-div flex flex-row align-items-stretch mb-1">
    <div v-if="isHorizontalVisible" class="div-horizontal">
      <Button
        type="button"
        label="P1"
        :badge="`${countOrdenGirada}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenGiradasLider')"
      />
      <Button
        type="button"
        label="P1$2"
        :badge="`${countPrePresupuestadas}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenPrePresupuestadaLider')"
      />
      <Button
        type="button"
        label="P2"
        :badge="`${countOrdenPresupuestada}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenPresupuestadasLider')"
      />
      <Button
        type="button"
        label="P3"
        :badge="`${countInfoDocEntregado}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenInfoDocEntregadoLider')"
      />
      <Button
        type="button"
        label="P4"
        :badge="`${countDineroEntregado}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenDineroEntregadoLider')"
      />
      <Button
        type="button"
        label="P5"
        :badge="`${countListaRealizar}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenListaRealizarLider')"
      />
      <Button
        type="button"
        label="P6"
        :badge="`${countDescargadas}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenDescargadasLider')"
      />
      <Button
        type="button"
        label="P7"
        :badge="`${countPronuncioAbogado}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenPronuncioAbogadoLider')"
      />
      <Button
        type="button"
        label="P8"
        :badge="`${countCuentasConciliada}`"
        size="small"
        rounded
        class="mr-2 mb-2"
        @click="goToRoute('CausasOrdenCuentasConciliadasLider')"
      />
    </div>
    <!-- Botones verticales -->
    <div v-if="!isHorizontalVisible" class="div-vertical">
      <div class="flex flex-column">
        <div class="flex mb-2">
          <Button
            type="button"
            label="P1"
            :badge="`${countOrdenGirada}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenGiradasLider')"
          />
          <Tag
            :value="`PASO1: Tiene ${countOrdenGirada} órdenes recientemente giradas`"
            severity="success"
          />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P1$2"
            :badge="`${countPrePresupuestadas}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenPrePresupuestadaLider')"
          />
          <Tag
            :value="`PASO 1$2: Tiene ${countPrePresupuestadas} órdenes pre-presupuestadas`"
            severity="success"
          />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P2"
            :badge="`${countOrdenPresupuestada}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenPresupuestadasLider')"
          />
          <Tag
            :value="`PASO2: Tiene ${countOrdenPresupuestada} órdenes presupuestadas`"
            severity="success"
          />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P3"
            :badge="`${countInfoDocEntregado}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenInfoDocEntregadoLider')"
          />
          <Tag
            :value="`PASO3: Tiene ${countInfoDocEntregado} órdenes con información y documentación entregada`"
            severity="success"
          />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P4"
            :badge="`${countDineroEntregado}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenDineroEntregadoLider')"
          />
          <Tag
            :value="`PASO4: Tiene ${countDineroEntregado} órdenes con dinero entregado`"
            severity="success"
          />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P5"
            :badge="`${countListaRealizar}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenListaRealizarLider')"
          />
          <Tag
            :value="`PASO5: Tiene ${countListaRealizar} órdenes en tramitación operativa`"
            severity="success"
          />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P6"
            :badge="`${countDescargadas}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenDescargadasLider')"
          />
          <Tag :value="`PASO6: Tiene ${countDescargadas} órdenes descargadas`" severity="success" />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P7"
            :badge="`${countPronuncioAbogado}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenPronuncioAbogadoLider')"
          />
          <Tag
            :value="`PASO7: Tiene ${countPronuncioAbogado} órdenes con pronunciamiento del abogado`"
            severity="success"
          />
        </div>
        <div class="flex mb-2">
          <Button
            type="button"
            label="P8"
            :badge="`${countCuentasConciliada}`"
            size="small"
            rounded
            class="mr-2"
            @click="goToRoute('CausasOrdenCuentasConciliadasLider')"
          />
          <Tag
            :value="`PASO8: Tiene ${countCuentasConciliada} órdenes con cuentas conciliadas`"
            severity="success"
          />
        </div>
      </div>
    </div>

    <div class="div-icon">
      <i :class="iconClass" @click="toggleVisibility"></i>
    </div>
  </div>
</template>

<style scoped>
/* Estilo opcional para espaciado entre botones */
/* .mr-2 {
  margin-right: 0.5rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}

.custom-div {
  padding: 5px;
} */

.card {
  display: flex;
  flex-direction: row;
  align-items: stretch; /* Ambos divs tendrán la misma altura */
}

.div-vertical {
  flex-grow: 1; /* Permite que este div crezca */
}

.div-icon {
  flex-grow: 1; /* Permite que este div crezca para igualar la altura */
}
.flecha {
  cursor: pointer;
}
</style>
