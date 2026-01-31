import { ref, onMounted, onUnmounted } from 'vue';

export function useScreenSize() {
  const isMobile = ref(false);

  const checkScreenSize = () => {
    // Puedes ajustar el ancho de pantalla según lo que consideres como "móvil"
    isMobile.value = window.innerWidth <= 768; 
  };

  onMounted(() => {
    checkScreenSize(); // Comprobamos el tamaño al montar el componente
    window.addEventListener('resize', checkScreenSize); // Escuchamos cambios en el tamaño de la pantalla
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize); // Limpiamos el listener cuando el componente se desmonte
  });

  return {
    isMobile
  };
}
