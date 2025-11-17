<template>
  <div class="page-container">
    <div class="stepper-container">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
        flat
        dark
        class="custom-stepper"
      >
        <!-- Step 1: API Overview -->
        <q-step
          :name="1"
          title="Información General"
          icon="settings"
          :done="step > 1"
          class="step-content"
        >
          <div class="step-wrapper">
            <RegistrarApiOverview
              ref="overviewComponent"
              @success="handleOverviewSuccess"
              @cancel="handleCancel"
            />
          </div>
        </q-step>

        <!-- Step 2: Endpoints -->
        <q-step :name="2" title="Endpoints" icon="api" :done="step > 2" class="step-content">
          <div class="step-wrapper">
            <RegistrarEndpoints
              v-if="apiCreatedId"
              ref="endpointsComponent"
              :api-id="apiCreatedId"
              @success="handleEndpointsSuccess"
              @cancel="handleCancel"
            />
            <div v-else class="text-center q-pa-xl">
              <q-icon name="warning" size="48px" color="warning" />
              <p class="text-white q-mt-md">Debes completar el Paso 1 primero para continuar</p>
              <q-btn label="Volver al Paso 1" color="primary" no-caps @click="step = 1" />
            </div>

            <!-- Botones de finalización en Step 2 -->
            <div v-if="apiCreatedId" class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn
                label="Saltar este paso"
                flat
                color="grey-5"
                no-caps
                @click="finalizarRegistro"
                :disable="loading"
              >
                <q-tooltip class="bg-grey-8"> Puedes agregar endpoints más tarde </q-tooltip>
              </q-btn>
              <q-btn
                label="Finalizar e ir al Overview"
                color="primary"
                no-caps
                icon-right="arrow_forward"
                @click="finalizarRegistro"
                :loading="loading"
                :disable="loading"
              />
            </div>
          </div>
        </q-step>
      </q-stepper>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import RegistrarApiOverview from 'src/components/apis/FormularioApiOverview.vue'
import RegistrarEndpoints from 'src/components/apis/FormularioApiDocumentation.vue'

const router = useRouter()
const $q = useQuasar()

const step = ref(1)
const stepper = ref(null)
const overviewComponent = ref(null)
const endpointsComponent = ref(null)
const apiCreatedId = ref(null)
const loading = ref(false)

function handleOverviewSuccess(apiId) {
  apiCreatedId.value = apiId

  $q.notify({
    type: 'positive',
    message: 'Información general guardada. Puedes continuar con los endpoints.',
    icon: 'check_circle',
    position: 'top',
  })

  // Avanzar al siguiente paso automáticamente
  setTimeout(() => {
    stepper.value.next()
  }, 500)
}

function handleEndpointsSuccess() {
  $q.notify({
    type: 'positive',
    message: 'Documentación de endpoints guardada exitosamente.',
    icon: 'check_circle',
    position: 'top',
  })

  // Mostrar notificación adicional y esperar un momento
  setTimeout(() => {
    $q.notify({
      type: 'info',
      message: 'Haz clic en "Finalizar e ir al Overview" para ver tu API',
      icon: 'info',
      position: 'top',
      timeout: 3000,
    })
  }, 800)
}

function handleCancel() {
  $q.dialog({
    title: 'Cancelar registro',
    message: '¿Estás seguro de que deseas cancelar el registro de la API?',
    dark: true,
    cancel: {
      label: 'No',
      flat: true,
      color: 'grey-5',
    },
    ok: {
      label: 'Sí, cancelar',
      color: 'negative',
    },
  }).onOk(() => {
    router.push('/main/apis')
  })
}

function finalizarRegistro() {
  if (!apiCreatedId.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa el paso 1 primero',
      icon: 'warning',
    })
    step.value = 1
    return
  }

  loading.value = true

  // Codificar el ID en base64
  const encodedId = btoa(apiCreatedId.value)

  $q.notify({
    type: 'positive',
    message: 'API registrada exitosamente. Redirigiendo...',
    icon: 'celebration',
  })

  // Esperar un momento antes de redirigir para mostrar la notificación
  setTimeout(() => {
    loading.value = false
    router.push(`/main/detalle-api/${encodedId}`)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #000000;
  padding: 40px 20px;
}

.stepper-container {
  max-width: 1400px;
  margin: 0 auto;
}

.custom-stepper {
  background: transparent;
  border-radius: 12px;

  ::v-deep(.q-stepper__tab) {
    padding: 16px 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  ::v-deep(.q-stepper__tab:hover) {
    background: rgba(0, 168, 168, 0.05);
  }

  ::v-deep(.q-stepper__tab--active) {
    background: rgba(0, 168, 168, 0.1);
    border: 1px solid rgba(0, 168, 168, 0.3);
  }

  ::v-deep(.q-stepper__tab--done .q-stepper__dot) {
    background: #00a8a8;
  }
}

.step-content {
  :deep(.q-stepper__step-inner) {
    padding: 0;
  }
}

.step-wrapper {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 768px) {
  .page-container {
    padding: 20px 10px;
  }

  .custom-stepper {
    :deep(.q-stepper__header) {
      padding: 16px;
      margin-bottom: 20px;
    }

    :deep(.q-stepper__tab) {
      padding: 12px 16px;
    }

    :deep(.q-stepper__title) {
      font-size: 12px;
    }

    :deep(.q-stepper__dot) {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }
  }
}
</style>
