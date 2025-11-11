<template>
  <!-- Tabla principal -->
  <q-card flat class="bg-transparent">
    <q-card-section class="row q-col-gutter-md">
      <div v-if="isMine" class="col-12 col-sm-6 col-md-4 flex" style="justify-content: center;">
        <CardCreateApi class="full-width" />
      </div>
      <div v-for="api in apis" :key="api.id" class="col-12 col-sm-6 col-md-4 flex">
        <CardApi
          :id="api.id"
          :title="api.title"
          :type="api.type"
          :price="api.price"
          :owner="api.owner.username"
          :createdAt="api.created_at"
          :caption="api.short_summary"
          :ratingAverage="api.rating_average"
          :views="api.views"
          class="full-width"
        />
      </div>
    </q-card-section>

    <q-card-section class="flex flex-center">
      <div class="row">
        <q-pagination
          unelevated
          v-if="localPagination.rowsNumber > 0"
          v-model="currentPage"
          :max="maxPage"
          :max-pages="6"
          boundary-numbers
          @update:modelValue="onRequest"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { useApisStore } from 'stores/apis-store.js'
import { useRouter } from 'vue-router'

const CardApi = defineAsyncComponent(() => import('src/components/apis/CardApi.vue'))
const CardCreateApi = defineAsyncComponent(() => import('src/components/apis/CardCreateApi.vue'))

const $q = useQuasar()

const loading = ref(false)

const apisStore = useApisStore()
const router = useRouter()
const apis = computed(() => apisStore.records.data || [])

const props = defineProps({
  isMine: {
    type: Boolean,
    default: false,
  },
})

const localPagination = computed({
  get() {
    return apisStore.pagination
  },
})

const maxPage = computed(() =>
  Math.ceil(+apisStore.pagination.rowsNumber / +apisStore.pagination.rowsPerPage),
)

const currentPage = computed({
  get() {
    return +apisStore.pagination.page
  },
  set(pageNumber) {
    apisStore.pagination.page = pageNumber
  },
})

const initialPagination = ref({
  page: 1,
  rowsPerPage: 30,
  sortBy: 'created_at',
  descending: false,
})

async function onInitialRequest() {
  if (apis.value.length === 0) {
    apisStore.pagination = apisStore.paginationOriginal
  }
}

async function onRequest(pageNumber) {
  loading.value = true

  $q.loading.show({
    message: 'Cargando ...',
  })

  apisStore.pagination.page = +pageNumber
  await apisStore.cargarApis()
  loading.value = false

  $q.loading.hide()
}

onUnmounted(() => {
  apisStore.resetStore()
})

onMounted(async () => {
  onInitialRequest({
    pagination: initialPagination.value,
    filter: undefined,
  })
  try {
    loading.value = true
    $q.loading.show({
      message: 'Cargando apis...',
    })
    await apisStore.cargarApis(true)
  } catch (error) {
    $q.notify({
      progress: true,
      message: 'Error al momento de cargar los registros. ' + error.message,
      icon: 'error',
      color: 'red',
      textColor: 'white',
    })
  } finally {
    loading.value = false
    $q.loading.hide()
  }
})

const detalleSolicitud = () => {
  accionesDialog.value = false
  const encodedId = btoa(String(solicitudSeleccionada.value.id))
  router.push({
    path: `apis/detalle/${encodedId}`,
  })
}
</script>

<style scoped>
/* Asegura que las cards tengan la misma altura */
.flex {
  display: flex;
}

.full-width {
  width: 100%;
}
</style>
