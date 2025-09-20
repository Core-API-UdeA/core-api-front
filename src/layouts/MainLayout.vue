<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-black">
      <q-toolbar class="row justify-between q-pa-md">
        <div>
          <q-img
            src="~assets/core-api-isotipo.png"
            alt="Logo"
            style="width: 30px; height: 30px"
            class="q-mb-sm"
          />
        </div>

        <div class="flex flex-center cursor-pointer" @click="$router.push('/')">
          <q-img src="~assets/core api.png" alt="Logo" style="width: 100px" class="q-mb-sm" />
        </div>

        <div class="row items-center q-gutter-x-sm">
          <q-btn flat round dense no-caps icon="fab fa-instagram" class="text-white" />
          <q-btn flat round dense no-caps icon="fab fa-github" class="text-white" />
          <q-btn
            label="Sign In"
            class="text-white"
            color="primary"
            unelevated
            no-caps
            style="border-radius: 10px"
            to="/login"
          />
          <q-btn
            label="Sign Up"
            class="text-white"
            color="accentitems"
            unelevated
            no-caps
            style="border-radius: 10px"
            :to="{ path: '/login/register' }"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-dark text-white">
      <div class="row q-gutter-x-sm flex flex-center q-pt-sm">
        <q-btn
          flat
          no-caps
          label="Términos y Condiciones"
          class="text-white"
          @click="$router.push('/terminos')"
        />
        <q-btn
          flat
          no-caps
          label="Contacto"
          class="text-white"
          @click="$router.push('/contacto')"
        />
        <q-btn
          flat
          no-caps
          label="¿Quiénes somos?"
          class="text-white"
          @click="$router.push('/quienes-somos')"
        />
      </div>
      <div class="row justify-center q-pb-md text-accentitems text-weight-light">
        <span>&copy; 2025 Core API. All rights reserved.</span>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
</script>
