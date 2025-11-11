<template>
  <q-card
    flat
    class="bg-accent row justify-between api-card"
    style="border-radius: 15px; min-width: 400px"
  >
    <q-card-section class="col-2 justify-content-center">
      <q-badge unelevated color="white" style="border-radius: 8px">
        <span class="text-accentitems q-px-sm q-py-xs" style="font-size: 1vmax">{{ type }}</span>
      </q-badge>
      <div
        class="flex flex-center bg-white q-mt-sm avatar-circle"
        style="border-radius: 50px; width: 40px; height: 40px; border: solid 3px black"
      >
        <span class="text-weight-bolder">
          {{ getInitials(owner) }}
        </span>
      </div>
    </q-card-section>
    <q-card-section class="col-10">
      <div class="row justify-end">
        <q-icon
          :name="isFavorite ? 'eva-heart' : 'eva-heart-outline'"
          :color="isFavorite ? 'red' : 'accentitems'"
          size="md"
          class="heart-icon cursor-pointer"
          @click="markAsFavorite"
        />
      </div>
      <div class="q-my-md cursor-pointer" @click="verDetalle(id)">
        <span class="text-h6 text-white">
          {{ title.length > 80 ? title.substring(0, 80) + '...' : title }}
        </span>
        <span class="text-subtitle1 text-weight-thin text-accentitems row">
          {{ caption.length > 80 ? caption.substring(0, 80) + '...' : caption }}
        </span>
      </div>

      <div class="row justify-between">
        <span class="text-subtitle1 text-weight-thin text-white">
          {{ normalize(owner) }}
        </span>
        <span class="text-subtitle1 text-weight-thin text-white">
          {{ calculateTime(createdAt) }}
        </span>
      </div>

      <div class="row q-gutter-x-sm">
        <q-badge outline color="accentitems" style="border-radius: 8px" class="badge-item"
          ><q-icon name="download" color="accentitems" size="xs" />
          <span class="text-subtitle1 text-weight-thin text-accentitems">
            {{ views }}
          </span>
        </q-badge>
        <q-badge outline color="accentitems" style="border-radius: 8px" class="badge-item"
          ><q-icon name="eva-star-outline" color="accentitems" size="xs" />
          <span class="text-subtitle1 text-weight-thin text-accentitems">
            {{ ratingAverage }}
          </span>
        </q-badge>
        <q-badge outline color="accentitems" style="border-radius: 8px" class="badge-item"
          ><q-icon name="attach_money" color="accentitems" size="xs" />
          <span class="text-subtitle1 text-weight-thin text-accentitems">
            {{ price }}
          </span>
        </q-badge>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useApisStore } from 'stores/apis-store'
import { useAuthStore } from 'stores/auth-store'
import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'

const router = useRouter()
const apisStore = useApisStore()
const authStore = useAuthStore()

const $q = useQuasar()

const isFavorite = ref(false)

onMounted(async () => {
  try {
    if (authStore.loggedIn) {
      isFavorite.value = await apisStore.consultarUserInteraction(props.id)
      isFavorite.value = isFavorite.value.favorite
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'warning',
      message: 'Error al verificar favorito: ' + error.message,
    })
    console.error('Error al verificar favorito:', error)
  }
})

const props = defineProps({
  id: String,
  title: String,
  type: String,
  price: String,
  owner: String,
  createdAt: String,
  caption: String,
  ratingAverage: String,
  views: Number,
})

function getInitials(cadena) {
  if (!cadena) return ''
  return cadena.slice(0, 2).toUpperCase()
}

function calculateTime(date) {
  const actualDate = new Date()
  const dateConv = new Date(date)

  dateConv.setHours(dateConv.getHours() - 5)

  const diffMs = actualDate - dateConv
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let result = 'Publicado hace '

  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365)
    result += years + (years > 1 ? ' años' : ' año')
  } else if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30)
    result += months + (months > 1 ? ' meses' : ' mes')
  } else if (diffDays >= 1) {
    result += diffDays + (diffDays > 1 ? ' días' : ' día')
  } else {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours > 0) {
      result += diffHours + (diffHours > 1 ? ' horas' : ' hora')
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      result += diffMinutes + (diffMinutes > 1 ? ' minutos' : ' minuto')
    }
  }

  return result
}

function normalize(name) {
  let username = name.trim().toLowerCase()

  username = username
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s]/g, '')

  username = username.replace(/\s+/g, '.')

  username = username.replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '')

  if (username.length > 18) {
    const cutoff = username.substring(0, 20)
    const lastDot = cutoff.lastIndexOf('.')
    if (lastDot > 0) {
      username = cutoff.substring(0, lastDot)
    } else {
      username = cutoff
    }
  }

  return username
}

function verDetalle(id) {
  const idEncoded = window.btoa(id)
  router.replace('detalle-api/' + idEncoded)
}

async function markAsFavorite() {
  try {
    if (!authStore.loggedIn) {
      $q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'warning',
        message: 'Debes iniciar sesión para marcar como favorito',
      })
      return
    }
    await apisStore.actualizarFavorito(props.id)

    await apisStore.consultarUserInteraction(props.id).then((res) => {
      isFavorite.value = res.favorite
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      textColor: 'white',
      icon: 'warning',
      message: 'Error al marcar como favorito: ' + error.message,
    })
    console.error('Error al marcar como favorito:', error)
  }
}
</script>

<style lang="scss" scoped>
.api-card {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(0, 168, 168, 0.1) 0%,
      rgba(0, 168, 168, 0.05) 50%,
      transparent 100%
    );
    transition: left 0.6s ease;
    z-index: 1;
    pointer-events: none;
  }

  &:hover {
    box-shadow:
      0 20px 40px rgba(0, 168, 168, 0.15),
      0 0 30px rgba(0, 168, 168, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(0, 168, 168, 0.3);

    &::before {
      left: 100%;
    }

    .heart-icon {
      animation: heartBeat 0.6s ease-out;
      color: #ff6b6b !important;
    }

    .avatar-circle {
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(0, 168, 168, 0.4);
    }

    .badge-item {
      background-color: rgba(0, 168, 168, 0.15);
      transform: translateY(-2px);
    }
  }
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.3);
  }
  30% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.3);
  }
  60% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
