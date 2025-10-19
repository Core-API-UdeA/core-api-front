<template>
  <q-card flat class="bg-transparent flex flex-center q-pt-xl" style="width: 100%">
    <q-form @submit.prevent="handleRegister" style="width: 400px; max-width: 90vw" class="q-pt-xl">
      <q-card-section style="display: flex; align-items: center; justify-content: center">
        <div class="row items-center">
          <q-img
            src="~assets/core-api-isotipo.png"
            alt="Logo"
            style="width: 30px; height: 30px"
            class="q-mb-sm"
          />
          <div class="text-h4 q-ml-sm text-white text-bold">Register</div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-x-md flex flex-center">
        <!-- Google Sign In Button -->
        <div class="border-item" @click="googleSignIn">
          <Icon icon="logos:google-icon" width="48" />
        </div>
        <!-- Botón oculto de Google para móviles -->
        <div id="google-signin-button" style="display: none"></div>

        <div class="border-item" @click="githubSignIn">
          <Icon icon="simple-icons:github" width="48" color="#000000" />
        </div>
        <div class="border-item">
          <Icon icon="logos:microsoft-icon" width="48" />
        </div>
      </q-card-section>

      <q-card-section class="flex flex-center" style="margin: 0">
        <span class="text-accentitems" style="text-align: center; font-size: 1vmax">
          or using email and password
        </span>
      </q-card-section>

      <q-card-section style="margin: 0; padding: 0">
        <!-- EMAIL -->
        <q-input
          class="q-mt-md"
          dark
          type="email"
          v-model="email"
          standout="bg-grey-10 text-white"
          label="Email"
          :rules="[(val) => (val && val.length > 0) || 'Please type an email']"
        >
          <template v-slot:prepend>
            <Icon icon="mdi:email" width="24" class="text-accentitems" />
          </template>
        </q-input>

        <!-- USERNAME -->
        <q-input
          class="q-mt-md"
          dark
          v-model="username"
          standout="bg-grey-10 text-white"
          label="Username"
          :rules="[
            (val) => !!val || 'Please type a username',
            (val) =>
              (5 <= val.length && val.length <= 60) ||
              'Does not meet the number of characters allowed',
            (val) => !/\s/.test(val) || 'Username cannot contain spaces',
          ]"
        >
          <template v-slot:prepend>
            <Icon icon="mdi:account" width="24" class="text-accentitems" />
          </template>
        </q-input>

        <!-- PASSWORD -->
        <q-input
          class="q-mt-md"
          dark
          v-model="password"
          standout="bg-grey-10 text-white"
          label="Password"
          :type="togglePasswordVisibility ? 'text' : 'password'"
          maxlength="40"
          :rules="[
            (val) => !!val || 'Please type a password',
            (val) => /[A-Z]/.test(val) || 'Must contain at least one uppercase letter',
            (val) => /[0-9]/.test(val) || 'Must contain at least one number',
            (val) => /[^A-Za-z0-9]/.test(val) || 'Must contain at least one special character',
            (val) => val.length >= 8 || 'Does not meet the number of characters allowed',
          ]"
        >
          <template v-slot:prepend>
            <Icon icon="mdi:key" width="24" class="text-accentitems" />
          </template>
          <template v-slot:append>
            <Icon
              icon="mdi:eye"
              width="24"
              class="text-accentitems cursor-pointer"
              @click="togglePasswordVisibility = !togglePasswordVisibility"
            />
          </template>
        </q-input>

        <!-- CONFIRM PASSWORD -->
        <q-input
          class="q-mt-md"
          dark
          v-model="confirmPassword"
          standout="bg-grey-10 text-white"
          label="Confirm Password"
          :type="togglePasswordVisibility ? 'text' : 'password'"
          maxlength="40"
          :rules="[
            (val) => !!val || 'Please confirm your password',
            (val) => val === password || 'Passwords do not match',
          ]"
        >
          <template v-slot:prepend>
            <Icon icon="mdi:key" width="24" class="text-accentitems" />
          </template>
          <template v-slot:append>
            <Icon
              icon="mdi:eye"
              width="24"
              class="text-accentitems cursor-pointer"
              @click="togglePasswordVisibility = !togglePasswordVisibility"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="flex flex-center" style="margin: 0; padding-top: 0">
        <q-btn
          label="Sign Up"
          style="padding: 0 30px 0 30px; font-size: 1vmax; border-radius: 10px"
          dense
          no-caps
          outline
          type="submit"
          color="white"
          :disable="!email || !password || !username || !confirmPassword"
        />
      </q-card-section>

      <q-card-section class="flex flex-center" style="margin: 0" v-if="$q.platform.is.mobile">
        <span
          class="text-accentitems cursor-pointer"
          @click="emit('toggleForm')"
          style="text-align: center; font-size: 0.8vmax; display: flex; align-items: center"
        >
          Already have an account? Sign in to access all our features.
        </span>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script setup>
import { useAuthStore } from 'stores/auth-store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Icon } from '@iconify/vue'
import { ref, onMounted, nextTick } from 'vue'

const emit = defineEmits(['toggleForm'])

const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const togglePasswordVisibility = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

let googleInitialized = false

onMounted(async () => {
  await nextTick()
  initializeGoogleSignIn()
})

function githubSignIn() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/github/callback`)
  const scope = encodeURIComponent('read:user user:email')

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`

  window.location.href = githubAuthUrl
}

function initializeGoogleSignIn() {
  if (!window.google || googleInitialized) return

  try {
    // Inicializar Google Identity Services
    google.accounts.id.initialize({
      client_id: process.env.GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      use_fedcm_for_prompt: true,
    })

    // Si es móvil, renderizar botón invisible y simular click
    google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      width: 250,
    })

    googleInitialized = true
  } catch (error) {
    console.error('Error initializing Google Sign-In:', error)
  }
}

function googleSignIn() {
  if (!window.google) {
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'warning',
      message: 'Google Sign-In no está disponible',
    })
    return
  }

  try {
    // En móviles, simular click en el botón renderizado
    const googleButton = document.querySelector('#google-signin-button div[role="button"]')
    if (googleButton) {
      googleButton.click()
    } else {
      // Fallback: usar prompt con configuración móvil
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('Prompt no mostrado:', notification.getNotDisplayedReason())
          // Intentar con redirect como último recurso
          fallbackToRedirect()
        }
      })
    }
  } catch (error) {
    console.error('Error al iniciar Google Sign-In:', error)
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'warning',
      message: 'Error al iniciar sesión con Google',
    })
  }
}

function fallbackToRedirect() {
  // Método alternativo: usar OAuth2 redirect flow
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/google/callback')
  const scope = encodeURIComponent('email profile')
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`

  window.location.href = authUrl
}

async function handleGoogleResponse(response) {
  try {
    console.log('Google response received')

    $q.loading.show({
      backgroundColor: '#fff',
      message: 'Iniciando sesión con Google...',
      messageColor: 'white',
    })

    await authStore.googleLogin(response.credential)

    if (authStore.loggedIn) {
      router.push('/main')
    }
  } catch (error) {
    console.error('Error en handleGoogleResponse:', error)
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'warning',
      message: 'Error al iniciar sesión con Google',
    })
  } finally {
    $q.loading.hide()
  }
}

async function handleRegister() {
  try {
    $q.loading.show({
      backgroundColor: '#fff',
      message: 'Registrando usuario...',
      messageColor: 'white',
    })

    if (password.value !== confirmPassword.value) {
      $q.notify({
        color: 'white',
        textColor: 'negative',
        icon: 'warning',
        message: 'Passwords do not match',
      })
      return
    }

    try {
      await authStore.register(email.value, username.value, password.value)
      router.push('/confirmation')
    } catch (error) {
      throw new Error(error.response?.data?.ejecucion?.respuesta?.mensaje || 'Registration failed')
    }

  } catch (err) {
    $q.notify({
      color: 'white',
      textColor: 'negative',
      icon: 'warning',
      message: 'Error ' + (err.message || err),
    })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style lang="scss" scoped>
.border-item {
  border: 1px solid white;
  width: 70px;
  height: 70px;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2vmax;
  cursor: pointer;
  transition: all 0.3s ease;
}

.border-item:hover {
  background-color: #181818;
  border: 2px solid white;
  transition: 0.03s;
}

.border-item:active {
  transform: scale(0.95);
}

// Responsive adjustments
@media (max-width: 768px) {
  .border-item {
    width: 60px;
    height: 60px;
    padding: 8px;
  }
}
</style>
