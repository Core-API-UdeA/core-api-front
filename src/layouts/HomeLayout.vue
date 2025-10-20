<template>
  <q-layout view="lHh Lpr lFf" class="bg-bgpage">
    <q-header class="bg-black">
      <q-toolbar class="bg-black row justify-end">
        <div class="row items-center q-gutter-x-sm">
          <q-btn flat round dense no-caps icon="fab fa-instagram" class="text-white" />
          <q-btn flat round dense no-caps icon="fab fa-github" class="text-white" />
          <div>
            <span v-if="morphGroupModel === 'btn'" class="text-accentitems q-mr-md q-ml-sm">{{
              userName
            }}</span>
            <q-btn
              color="white"
              text-color="black"
              style="border-radius: 50px;"
              :label="getInitials(userName)"
              size="md"
              v-morph:btn:userGroup:300.resize="morphGroupModel"
              @click="nextMorph"
              round
              dense
            />

            <q-card
              v-morph:card1:userGroup:500.resize="morphGroupModel"
              class="bg-accent settingsMenu shadow-up-3"
              :style="{
                borderRadius: '20px',
                position: 'absolute',
                right: '1vmax',
                top: '0.1vmax',
                width: $q.screen.lt.sm ? '90vw' : '20vw',
                maxWidth: $q.screen.lt.sm ? '95vw' : '300px',
                minWidth: $q.screen.lt.sm ? '220px' : 'unset',
                zIndex: 2000,
              }"
            >
              <q-card-section class="sectionShadow">
                <div class="row justify-between flex flex-center">
                  <span class="text-grey-5" style="word-break: break-all">{{ email }}</span>
                  <q-btn fab flat color="grey-5" icon="person" @click="nextMorph" />
                </div>

                <q-separator />

                <q-item clickable @click="logout">
                  <q-item-section>
                    <div class="text-grey-5">
                      <q-icon name="logout" color="grey-5" />
                      Salir
                    </div>
                  </q-item-section>
                </q-item>
                <q-btn
                  flat
                  label="Cancel"
                  text-color="grey-5"
                  class="full-width"
                  @click="nextMorph"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <div
      class="absolute"
      style="top: 10vmax; left: 1vmax; z-index: 1000"
      v-if="!drawer && $q.screen.lt.md"
    >
      <q-btn dense round color="primary" icon="chevron_right" @click="toggleDrawer" unelevated />
    </div>

    <q-drawer
      v-model="drawer"
      show-if-above
      class="bg-bgpage"
      flat
      style="border-right: 1.5px solid black"
    >
      <q-scroll-area class="fit">
        <q-toolbar>
          <q-img src="~assets/core api.png" alt="Logo" style="width: 150px" class="q-mb-sm" />
        </q-toolbar>

        <q-list padding style="border-radius: 20px; min-height: 50vh">
          <div class="col-12">
            <EssentialLink v-for="link in links" :key="link.title" v-bind="link" />
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

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
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'
import EssentialLink from 'components/EssentialLink.vue'

const $q = useQuasar()
const router = useRouter()

const authStore = useAuthStore()
const drawer = ref(true)

const email = computed(() => authStore.user?.email || '')
const userName = computed(() => authStore.user?.username || '')

function toggleDrawer() {
  drawer.value = !drawer.value
}

const links = [
  {
    title: 'Home',
    caption: 'Home Page',
    link: '/main',
    icon: 'fas fa-home',
  },
  {
    title: 'APIs',
    caption: 'Manage your APIs',
    link: '/main/apis',
    icon: 'api',
  },
  {
    title: 'Catalogo',
    caption: 'Browse our catalog',
    link: '/main/catalogo',
    icon: 'fas fa-bag-shopping',
  },
]

const morphGroupModel = ref('btn')
const nextMorphStep = { btn: 'card1', card1: 'btn' }
function nextMorph() {
  morphGroupModel.value = nextMorphStep[morphGroupModel.value]
}

async function logout() {
  $q.loading.show({ message: 'Saliendo ...' })
  await authStore.logout()
  router.push('/')
  $q.loading.hide()
}

function getInitials(cadena) {
  if (!cadena) return ''
  return cadena.slice(0, 2).toUpperCase()
}
</script>
