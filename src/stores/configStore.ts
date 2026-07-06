import { defineStore } from 'pinia';
import { ref } from 'vue';
import tablaConfigService from '@/modules/admin/TablaConfig/services/tablaConfig.service';
import { baseUrlResource } from '@/config/constants'


export const useConfigStore = defineStore('config', () => {
  const imgLogo = ref<string | null>(null);
  const loading = ref(false);

  const fetchLogo = async () => {
    if (imgLogo.value) return; // Si ya está cargado, no hacemos nada

    loading.value = true;
    try {
      const response = await tablaConfigService.mostrarDatos();
      if (response && response.imagen_logo) {
        // Asegúrate de definir tu baseUrlResource
        imgLogo.value = `${baseUrlResource}/${response.imagen_logo}`;
      } else {
        imgLogo.value = ''; // Valor por defecto
      }
    } catch (error) {
      console.error('Error al cargar logo', error);
    } finally {
      loading.value = false;
    }
  };

  return { imgLogo, fetchLogo };
});