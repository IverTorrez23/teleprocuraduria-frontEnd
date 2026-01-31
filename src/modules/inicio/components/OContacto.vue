<script setup lang="ts"></script>

<template>
  <div class="col-12">
    <div class="card">
      <h5 class="card-title">Contáctanos</h5>
      <div class="grid">
        <!-- Formulario de contacto -->
        <div class="col-12 md:col-6 flex align-items-center justify-content-center">
          <div class="p-fluid">
            <div class="field">
              <label for="nombre">Nombre</label>
              <InputText id="nombre" type="text" placeholder="Tu nombre" />
            </div>
            <div class="field">
              <label for="email">E-mail</label>
              <InputText id="email" type="email" placeholder="Tu email" />
            </div>
            <div class="field">
              <label for="asunto">Asunto</label>
              <InputText id="asunto" type="text" placeholder="Asunto" />
            </div>
            <div class="field">
              <label for="mensaje">Mensaje</label>
              <Textarea
                id="mensaje"
                placeholder="Escriba el mensaje..."
                :autoResize="true"
                rows="3"
                cols="30"
              />
            </div>
            <Button label="Enviar" class="mt-2 p-button-success"></Button>
          </div>
        </div>

        <!-- Divider -->
        <div class="col-12 md:col-1 flex align-items-center justify-content-center">
          <Divider layout="vertical" class="divider-vertical"></Divider>
        </div>

        <!-- Ubicación -->
        <div class="col-12 md:col-5 flex flex-column align-items-center">
          <h5 class="location-title">Ubicación</h5>
          <p class="location-description">
            Estamos ubicados en:<br />
            Avenida principal, #123,<br />
            Ciudad, País.
          </p>
          <div class="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6566.290091245546!2d-63.178639080022634!3d-17.773050591512654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93f1e7de2ab5169f%3A0x58ba010a8e2624da!2sTOP%20CENTER!5e0!3m2!1ses!2sbo!4v1721855584134!5m2!1ses!2sbo"
              width="100%"
              height="400"
              style="border: 0"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.location-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.location-description {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-bottom: 1rem;
}

.map-container {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .card {
    text-align: center;
  }

  .divider-vertical {
    display: none;
  }

  .map-container {
    height: 300px;
  }
}
</style>
