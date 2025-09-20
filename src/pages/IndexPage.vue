<template>
  <q-page padding class="bg-bgpage">
    <div class="row flex flex-center q-gutter-y-md">
      <HeroSection />
    </div>
    <div class="flex flex-center q-mt-md">
      <LandingCarousel />
    </div>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const HeroSection = defineAsyncComponent(() => import('src/components/main/HeroSection.vue'))
const LandingCarousel = defineAsyncComponent(() => import('src/components/main/LandingCarousel.vue'))
</script>
