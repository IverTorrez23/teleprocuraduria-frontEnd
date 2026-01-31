<script setup lang="ts">
import OMenu from '../components/OMenu.vue'
</script>

<template>
  <div class="layout-wrapper">
    <!-- menu navegacion -->
    <o-menu></o-menu>

    <div class="layout-main-container">
      <!-- contenido -->
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"
      />
      <a
        href="https://api.whatsapp.com/send?phone=68792185&text=Hola%21%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%Teleprocuraduria%202."
        class="float"
        target="_blank"
      >
        <i class="fa fa-whatsapp my-float"></i>
      </a>
      <div class="layout-main">
        <router-view></router-view>
      </div>
      <!-- footer -->
    </div>

    <div class="layout-mask"></div>
  </div>
</template>

<style scoped>
.float {
  position: fixed;
  width: 60px;
  height: 60px;
  bottom: 40px;
  right: 40px;
  background-color: #25d366;
  color: #fff;
  border-radius: 50px;
  text-align: center;
  font-size: 30px;
  box-shadow: 2px 2px 3px #999;
  z-index: 100;
}
.float:hover {
  text-decoration: none;
  color: #25d366;
  background-color: #fff;
}

.my-float {
  margin-top: 16px;
}
</style>
