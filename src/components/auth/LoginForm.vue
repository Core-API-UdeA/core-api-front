<template>
  <q-card flat class="bg-transparent flex flex-center q-pt-xl" style="width: 100%">
    <q-form :submit.prevent="login" style="width: 400px; max-width: 90vw" class="q-pt-xl">
      <q-card-section style="display: flex; align-items: center; justify-content: center">
        <div class="row items-center">
          <q-img
            src="~assets/core-api-isotipo.png"
            alt="Logo"
            style="width: 30px; height: 30px"
            class="q-mb-sm"
          />
          <div class="text-h4 q-ml-sm text-white text-bold">Login</div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-x-md flex flex-center">
        <div class="border-item" @click="googleSignIn">
          <Icon icon="logos:google-icon" width="48" />
        </div>
        <div class="border-item">
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
        <q-input
          class="q-mt-md"
          dark
          v-model="email"
          standout="bg-grey-10 text-white"
          label="Email"
          :rules="[(val) => (val && val.length > 0) || 'Please type an email']"
        >
          <template v-slot:prepend>
            <Icon icon="mdi:email" width="24" class="text-accentitems" />
          </template>
        </q-input>

        <q-input
          class="q-mt-md"
          dark
          v-model="password"
          standout="bg-grey-10 text-white"
          label="Password"
          :type="togglePasswordVisibility ? 'text' : 'password'"
          :rules="[(val) => (val && val.length > 0) || 'Please type a password']"
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

      <q-card-section class="flex flex-center" style="margin: 0">
        <span
          class="text-accentitems cursor-pointer"
          @click="resetPassword"
          style="text-align: center; font-size: 0.8vmax; display: flex; align-items: center"
        >
          <Icon icon="mdi:lock-outline" width="14" class="text-accentitems q-mr-sm" />
          Forgot your password?
        </span>
      </q-card-section>

      <q-card-section class="flex flex-center" style="margin: 0; padding-top: 0">
        <q-btn
          label="Sign In"
          style="padding: 0 30px 0 30px; font-size: 1vmax; border-radius: 10px"
          dense
          no-caps
          outline
          type="submit"
          color="white"
          :disable="!email || !password"
        />
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth-store'

const email = ref('')
const password = ref('')
const togglePasswordVisibility = ref(false)

const authStore = useAuthStore()
const $q = useQuasar()
const router = useRouter()

onMounted(() => {
  console.log(process.env.GOOGLE_CLIENT_ID)
  google.accounts.id.initialize({
    client_id: process.env.GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse,
  })
})

function googleSignIn() {
  google.accounts.id.prompt()
}


async function handleGoogleResponse(response) {
  console.log('Encoded JWT ID token: ' + response.credential)
  await authStore.googleLogin(response.credential)

  if (authStore.loggedIn) {
    router.push('/main')
  }
}

async function login() {
  try {
    $q.loading.show({
      backgroundColor: '#fff',
      message: 'Ingresando a la aplicación ...',
      messageColor: 'white',
    })

    await authStore.login(email.value, password.value)
    authStore.loginCallback()

    if (authStore.loggedIn) {
      router.push('/main')
    }
  } catch (error) {
    $q.notify({
      progress: true,
      message: error.message,
      icon: 'warning',
      color: 'white',
      textColor: 'negative',
    })
  } finally {
    $q.loading.hide()
  }
}

function resetPassword() {
  console.log('Reset password clicked')
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
}

.border-item:hover {
  background-color: #181818;
  border: 2px solid white;
  transition: 0.03s;
}
</style>
