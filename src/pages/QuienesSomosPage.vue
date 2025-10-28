<template>
  <q-page class="bg-black text-white q-pa-xl flex flex-center">
    <div class="q-mx-auto q-pa-sm" style="max-width: 800px">
      <!-- Recuadro gris -->
      <div
        class="q-pa-lg q-mt-md texto-justificado"
        style="
          background-color: #2f2f2f;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        "
      >
        <!-- Título -->
        <h3 class="text-h5 text-bold q-mb-md text-center" style="color: #009688">Quiénes somos</h3>

        <!-- Logo reutilizado coreApi -->
        <div class="row items-center justify-center q-mb-md">
          <img src="~assets/core api.png" alt="Logo" style="height: 30px; margin-right: 10px" />
          <span style="font-weight: bold; font-size: 18px; color: white">CoreApi</span>
        </div>

        <!-- Contenido -->
        <p class="text-body1 q-mb-md">
          <b>CoreApi</b> es una aplicación desarrollada por estudiantes de la
          <b>Universidad de Antioquia</b>, creada con el propósito de facilitar la consulta y
          gestión de información de APIs de manera clara, moderna y accesible.
        </p>

        <p class="text-body1 q-mb-md">
          Nuestro objetivo es ofrecer una herramienta que permita a los usuarios explorar,
          visualizar y comprender la funcionalidad de diversas APIs de forma intuitiva y segura.
        </p>

        <p class="text-body1 q-mb-md">
          El proyecto fue creado por <b>Luis Alfonso Castaño</b>, <b>José Henao</b> y
          <b>Andrés Lema</b>, como parte de un proceso académico orientado al aprendizaje práctico
          del desarrollo web y la integración de servicios tecnológicos.
        </p>

        <p class="text-body1">
          En <b>CoreApi</b> creemos que la tecnología debe estar al servicio del conocimiento, la
          colaboración y la innovación.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup></script>

<style scoped>
.texto-justificado {
  text-align: justify;
  line-height: 1.8;
  color: #f1f1f1;
}
</style>
