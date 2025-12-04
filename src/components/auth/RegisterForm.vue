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
        <div class="border-item" @click="initiateGoogleSignIn">
          <Icon icon="logos:google-icon" width="48" />
        </div>
        <!-- Botón oculto de Google -->
        <div id="google-signin-button-register" style="display: none"></div>

        <div class="border-item" @click="initiateGithubSignIn">
          <Icon icon="simple-icons:github" width="48" color="#000000" />
        </div>
        <!-- <div class="border-item">
          <Icon icon="logos:microsoft-icon" width="48" />
        </div> -->
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

    <!-- Modal de Términos y Condiciones -->
    <q-dialog v-model="showTermsDialog" persistent>
      <q-card class="terms-modal" style="min-width: 350px; max-width: 600px; max-height: 85vh">
        <q-card-section class="row items-center q-pb-md bg-grey-10">
          <div class="text-h6 text-white">Términos y Condiciones</div>
          <q-space />
          <q-btn icon="close" flat round dense color="white" @click="cancelTerms" />
        </q-card-section>

        <q-card-section class="scroll bg-grey-9 text-white" style="max-height: 55vh">
          <TerminosCondiciones />
        </q-card-section>

        <q-separator color="grey-7" />

        <q-card-section class="bg-grey-10">
          <q-checkbox v-model="acceptedTerms" color="white" dark>
            <template v-slot:default>
              <span class="text-white">Acepto los términos y condiciones</span>
            </template>
          </q-checkbox>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-10 q-pt-none">
          <q-btn flat label="Cancelar" color="grey-6" no-caps @click="cancelTerms" />
          <q-btn
            flat
            label="Aceptar y Continuar"
            color="white"
            no-caps
            :disable="!acceptedTerms"
            @click="proceedWithRegistration"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { useAuthStore } from 'stores/auth-store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Icon } from '@iconify/vue'
import { ref, onMounted, nextTick } from 'vue'
import TerminosCondiciones from 'src/components/auth/TerminosCondiciones.vue'

const emit = defineEmits(['toggleForm'])

const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const togglePasswordVisibility = ref(false)
const showTermsDialog = ref(false)
const acceptedTerms = ref(false)
const pendingRegistrationType = ref(null)
const pendingGoogleCredential = ref(null)

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

let googleInitialized = false

onMounted(async () => {
  await nextTick()
  initializeGoogleSignIn()
})

// ============= GITHUB =============
function initiateGithubSignIn() {
  pendingRegistrationType.value = 'github'
  showTermsDialog.value = true
}

function githubSignIn() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/github/callback`)
  const scope = encodeURIComponent('read:user user:email')
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
  window.location.href = githubAuthUrl
}

// ============= GOOGLE =============
function initializeGoogleSignIn() {
  if (!window.google || googleInitialized) return

  try {
    google.accounts.id.initialize({
      client_id: process.env.GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    google.accounts.id.renderButton(document.getElementById('google-signin-button-register'), {
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

function initiateGoogleSignIn() {
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
    const googleButton = document.querySelector('#google-signin-button-register div[role="button"]')
    if (googleButton) {
      googleButton.click()
    } else {
      google.accounts.id.prompt()
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

function handleGoogleCallback(response) {
  // Guardar la credencial y mostrar modal de términos
  pendingGoogleCredential.value = response.credential
  pendingRegistrationType.value = 'google'
  showTermsDialog.value = true
}

async function processGoogleRegistration() {
  try {
    $q.loading.show({
      backgroundColor: '#fff',
      message: 'Registrando con Google...',
      messageColor: 'white',
    })

    await authStore.googleLogin(pendingGoogleCredential.value)

    if (authStore.loggedIn) {
      router.push('/main')
    }
  } catch (error) {
    console.error('Error en Google registration:', error)
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'warning',
      message: 'Error al registrarse con Google',
    })
  } finally {
    $q.loading.hide()
  }
}

// ============= EMAIL REGISTRATION =============
async function handleRegister() {
  pendingRegistrationType.value = 'email'
  showTermsDialog.value = true
}

async function processEmailRegister() {
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

    await authStore.register(email.value, username.value, password.value)
    router.push('/confirmation')
  } catch (error) {
    $q.notify({
      color: 'white',
      textColor: 'negative',
      icon: 'warning',
      message: 'Error: ' + (error.response?.data?.ejecucion?.respuesta?.mensaje || 'Registration failed'),
    })
  } finally {
    $q.loading.hide()
  }
}

// ============= MODAL TERMS =============
function cancelTerms() {
  showTermsDialog.value = false
  acceptedTerms.value = false
  pendingRegistrationType.value = null
  pendingGoogleCredential.value = null
}

async function proceedWithRegistration() {
  if (!acceptedTerms.value) return

  showTermsDialog.value = false

  // Ejecutar el registro según el tipo
  if (pendingRegistrationType.value === 'email') {
    await processEmailRegister()
  } else if (pendingRegistrationType.value === 'google') {
    await processGoogleRegistration()
  } else if (pendingRegistrationType.value === 'github') {
    githubSignIn()
  }

  // Limpiar estado
  acceptedTerms.value = false
  pendingRegistrationType.value = null
  pendingGoogleCredential.value = null
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

@media (max-width: 768px) {
  .border-item {
    width: 60px;
    height: 60px;
    padding: 8px;
  }
}

.terms-modal {
  background-color: #1a1a1a;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.terms-modal .q-card__section {
  color: white;
}

.terms-modal :deep(.q-checkbox__inner) {
  color: white;
}

.terms-modal :deep(.q-checkbox__bg) {
  border-color: white;
}

.terms-modal :deep(.q-checkbox__svg) {
  color: #1a1a1a;
}
</style>
