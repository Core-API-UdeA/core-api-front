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
        <div class="border-item">
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
            (val) => (val && val.length > 0) || 'Please type a username',
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

        <!-- CONFIRM PASSWORD -->
        <q-input
          class="q-mt-md"
          dark
          v-model="confirmPassword"
          standout="bg-grey-10 text-white"
          label="Confirm Password"
          :type="togglePasswordVisibility ? 'text' : 'password'"
          :rules="[
            (val) => (val && val.length > 0) || 'Please confirm your password',
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
    </q-form>
  </q-card>
</template>

<script setup>
import { useAuthStore } from 'stores/auth-store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const togglePasswordVisibility = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

async function handleRegister() {
  try {
    $q.loading.show({
      backgroundColor: '#fff',
      message: 'Registrando usuario...',
      messageColor: 'white',
    })

    // Válido otra vez las contraseñas que coincidan
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

    if (authStore.loggedIn) {
      router.push('/main')
    }
  } catch (err) {
    $q.notify({
      color: 'white',
      textColor: 'negative',
      icon: 'warning',
      message: 'Error '+(err.message || err),
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
}

.border-item:hover {
  background-color: #181818;
  border: 2px solid white;
  transition: 0.03s;
}
</style>
