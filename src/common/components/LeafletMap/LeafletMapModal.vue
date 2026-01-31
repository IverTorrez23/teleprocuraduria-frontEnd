<template>
  <Dialog
    v-model:visible="isVisible"
    :header="title"
    :modal="true"
    :closable="false"
    :style="{ width: '95vw', maxWidth: '1200px' }"
    class="enhanced-dynamic-leaflet-map-modal p-fluid"
  >
    <div class="map-container">
      <div ref="mapContainer" class="map"></div>
      <div class="map-overlay">
        <div class="search-and-controls p-d-flex p-jc-between">
          <div class="search-container p-inputgroup">
            <span class="p-inputgroup-addon">
              <i class="pi pi-search"></i>
            </span>
            <AutoComplete
              v-model="searchQuery"
              :suggestions="searchResults"
              @complete="searchLocation"
              @item-select="selectSearchResult"
              placeholder="Buscar ubicación"
              class="w-full"
            />
            <Button
              icon="pi pi-times"
              @click="clearSearch"
              v-if="searchQuery"
              class="p-button-raised"
            />
          </div>
          <div class="map-controls">
            <Button
              icon="pi pi-plus"
              class="p-button-raised p-button-rounded"
              @click="zoomIn"
              :disabled="zoom >= maxZoom"
              v-tooltip.bottom="'Acercar'"
            />
            <Button
              icon="pi pi-minus"
              class="p-button-raised p-button-rounded"
              @click="zoomOut"
              :disabled="zoom <= minZoom"
              v-tooltip.bottom="'Alejar'"
            />
            <Button
              icon="pi pi-map-marker"
              class="p-button-raised p-button-rounded"
              @click="centerOnMarker"
              v-tooltip.bottom="'Centrar en marcador'"
            />
            <Button
              icon="pi pi-compass"
              class="p-button-raised p-button-rounded"
              @click="getUserLocation"
              v-tooltip.bottom="'Mi ubicación'"
            />
            <Button
              icon="pi pi-refresh"
              class="p-button-raised p-button-rounded"
              @click="resetView"
              v-tooltip.bottom="'Reiniciar vista'"
            />
          </div>
        </div>
      </div>
      <div class="coordinates-display">
        <span
          >Lat: {{ selectedLocation[0].toFixed(6) }}, Lng:
          {{ selectedLocation[1].toFixed(6) }}</span
        >
      </div>
      <div class="location-details" v-if="locationDetails">
        <h3>Detalles de la ubicación</h3>
        <p v-if="locationDetails.address">
          <i class="pi pi-map-marker"></i> {{ locationDetails.address }}
        </p>
        <p v-if="locationDetails.city"><i class="pi pi-building"></i> {{ locationDetails.city }}</p>
        <p v-if="locationDetails.country">
          <i class="pi pi-flag"></i> {{ locationDetails.country }}
        </p>
        <p v-if="locationDetails.postcode">
          <i class="pi pi-envelope"></i> {{ locationDetails.postcode }}
        </p>
      </div>
    </div>
    <template #footer>
      <Button
        :label="mode === 'select' ? 'Confirmar ubicación' : 'Leer coordenadas'"
        icon="pi pi-check"
        @click="confirmAction"
        :disabled="!isLocationSelected"
        class="p-button-success"
      />
      <Button label="Cancelar" icon="pi pi-times" @click="closeModal" class="p-button-danger" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AutoComplete from 'primevue/autocomplete'

interface Props {
  modelValue: boolean
  initialZoom?: number
  title?: string
  mode?: 'select' | 'read'
}

const props = withDefaults(defineProps<Props>(), {
  initialZoom: 13,
  title: 'Mapa Interactivo',
  mode: 'select'
})

const emit = defineEmits([
  'update:modelValue',
  'location-selected',
  'coordinates-read',
  'favorite-added'
])

const toast = useToast()
const isVisible = ref(props.modelValue)
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const marker = ref<L.Marker | null>(null)
const selectedLocation = ref<[number, number]>([0, 0])
const zoom = ref(props.initialZoom)
const minZoom = 2
const maxZoom = 18
const searchQuery = ref('')
const searchResults = ref<string[]>([])
const isLocationSelected = ref(false)
const locationDetails = ref<any>(null)

const initMap = () => {
  if (mapContainer.value && !map.value) {
    map.value = L.map(mapContainer.value, {
      zoom: zoom.value,
      zoomControl: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value)

    map.value.on('locationfound', (e: L.LocationEvent) => {
      selectedLocation.value = [e.latlng.lat, e.latlng.lng]
      marker.value = L.marker(e.latlng, {
        draggable: true,
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          shadowSize: [41, 41]
        })
      }).addTo(map.value!)

      map.value!.setView(e.latlng, zoom.value)
      updateMarkerPosition(e.latlng)
    })
    map.value.on('locationerror', (e: L.ErrorEvent) => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener tu ubicación. Por favor, selecciona manualmente.',
        life: 3000
      })
    })
    map.value.locate({ setView: true, maxZoom: zoom.value })
    map.value.on('click', (e: L.LeafletMouseEvent) => {
      updateMarkerPosition(e.latlng)
    })

    marker.value.on('dragend', () => {
      if (marker.value) {
        updateMarkerPosition(marker.value.getLatLng())
      }
    })

    map.value.on('zoom', () => {
      if (map.value) {
        zoom.value = map.value.getZoom()
      }
    })

    L.control.scale().addTo(map.value)
  }
}

const updateMarkerPosition = async (latlng: L.LatLng) => {
  selectedLocation.value = [latlng.lat, latlng.lng]
  if (marker.value) {
    marker.value.setLatLng(latlng)
  }
  if (map.value) {
    map.value.panTo(latlng)
  }
  isLocationSelected.value = true
  await fetchLocationDetails(latlng.lat, latlng.lng)
}

const confirmAction = () => {
  if (props.mode === 'select') {
    emit('location-selected', {
      coordinates: selectedLocation.value,
      details: locationDetails.value
    })
  } else {
    emit('coordinates-read', selectedLocation.value)
  }
  closeModal()
  toast.add({
    severity: 'success',
    summary: props.mode === 'select' ? 'Ubicación seleccionada' : 'Coordenadas leídas',
    detail: `Lat: ${selectedLocation.value[0].toFixed(6)}, Lng: ${selectedLocation.value[1].toFixed(6)}`,
    life: 3000
  })
}

const closeModal = () => {
  isVisible.value = false
  emit('update:modelValue', false)
}

const zoomIn = () => {
  if (map.value && zoom.value < maxZoom) {
    map.value.setZoom(zoom.value + 1)
  }
}

const zoomOut = () => {
  if (map.value && zoom.value > minZoom) {
    map.value.setZoom(zoom.value - 1)
  }
}

const centerOnMarker = () => {
  if (map.value && marker.value) {
    map.value.panTo(marker.value.getLatLng())
  }
}

const resetView = () => {
  if (map.value) {
    map.value.locate({ setView: true, maxZoom: zoom.value })
  }
}

const searchLocation = async (event: { query: string }) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.query)}`
    )
    const data = await response.json()
    searchResults.value = data.map((item: any) => item.display_name)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo buscar la ubicación. Por favor, inténtelo de nuevo.',
      life: 3000
    })
  }
}

const selectSearchResult = async (event: { value: string }) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.value)}`
    )
    const data = await response.json()
    if (data.length > 0) {
      const { lat, lon } = data[0]
      updateMarkerPosition(L.latLng(parseFloat(lat), parseFloat(lon)))
      toast.add({
        severity: 'info',
        summary: 'Ubicación encontrada',
        detail: event.value,
        life: 3000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo seleccionar la ubicación. Por favor, inténtelo de nuevo.',
      life: 3000
    })
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const getUserLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        updateMarkerPosition(L.latLng(latitude, longitude))
        toast.add({
          severity: 'success',
          summary: 'Ubicación detectada',
          detail: 'Se ha detectado tu ubicación actual.',
          life: 3000
        })
      },
      (error) => {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'No se pudo obtener tu ubicación. Por favor, inténtalo de nuevo o selecciona manualmente.',
          life: 3000
        })
      }
    )
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Tu navegador no soporta la geolocalización.',
      life: 3000
    })
  }
}

const fetchLocationDetails = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
    const data = await response.json()
    locationDetails.value = {
      address: data.display_name,
      city: data.address.city || data.address.town || data.address.village,
      country: data.address.country,
      postcode: data.address.postcode
    }
  } catch (error) {
    locationDetails.value = null
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue
    if (newValue) {
      nextTick(() => {
        initMap()
        if (props.mode === 'read') {
          getUserLocation()
        }
      })
    }
  }
)

onMounted(() => {
  if (isVisible.value) {
    nextTick(() => {
      initMap()
      if (props.mode === 'read') {
        getUserLocation()
      }
    })
  }
})
</script>

<style scoped>
.enhanced-dynamic-leaflet-map-modal :deep(.p-dialog-content) {
  padding: 0;
  overflow: hidden;
}

.map-container {
  position: relative;
  height: 75vh;
  width: 100%;
}

.map {
  height: 100%;
  width: 100%;
}

.map-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 1000;
}

.search-and-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-container {
  flex-grow: 1;
  margin-right: 10px;
}

.map-controls {
  display: flex;
  gap: 5px;
}

.coordinates-display {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-details {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  max-width: 300px;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.location-details h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2em;
  color: #2c3e50;
}

.location-details p {
  margin: 8px 0;
  font-size: 0.95em;
  color: #34495e;
  display: flex;
  align-items: center;
}

.location-details p i {
  margin-right: 8px;
  color: #3498db;
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
}

.p-button-raised {
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.p-button-rounded {
  width: 2.8rem !important;
  height: 2.8rem !important;
}

@media (max-width: 768px) {
  .search-and-controls {
    flex-direction: column;
  }

  .search-container {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }

  .map-controls {
    justify-content: center;
    width: 100%;
  }

  .location-details {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>
