<template>
  <q-page padding class="bg-bgpage">
    <div class="row flex flex-center q-gutter-y-md">
      <HeroSection />
    </div>
    <div class="flex flex-center q-mt-md">
      <LandingCarousel />
    </div>

    <div class="row q-col-gutter-sm">
      <CardApi
      class="col-md-3"
        :title="'Titulo del API - Nombre'"
        :type="'Tipo'"
        :price="2.15"
        :owner="'Juan.Lema'"
        :createdAt="'2025/08/25'"
        :caption="'subtitulo descriptivo del api expuesta en este punto'"
        v-for="value in 4"
        :key="value"
      />
    </div>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const HeroSection = defineAsyncComponent(() => import('src/components/main/HeroSection.vue'))
const LandingCarousel = defineAsyncComponent(
  () => import('src/components/main/LandingCarousel.vue'),
)
const CardApi = defineAsyncComponent(() => import('src/components/apis/CardApi.vue'))
</script>
