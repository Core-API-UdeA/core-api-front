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
          </div>
        </q-step>

        <!-- Step 3: Authentication (Placeholder) -->
        <q-step :name="3" title="Autenticación" icon="lock" :done="step > 3" class="step-content">
          <div class="step-wrapper">
            <div class="placeholder-content">
              <q-icon name="lock" size="64px" color="grey-6" />
              <p class="text-grey-5 q-mt-md">Configuración de Autenticación</p>
              <p class="text-caption text-grey-7">Próximamente...</p>
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn
                flat
                label="Anterior"
                color="grey-5"
                no-caps
                @click="$refs.stepper.previous()"
              />
              <q-btn label="Finalizar" color="primary" no-caps @click="finalizarRegistro" />
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
const apiCreatedId = ref(null)

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
  if (apiCreatedId.value) {
    $q.notify({
      type: 'positive',
      message: 'API registrada exitosamente',
      icon: 'celebration',
    })

    router.push(`/main/catalogo/${apiCreatedId.value}`)
  } else {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa el paso 1 primero',
      icon: 'warning',
    })
    step.value = 1
  }
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

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
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

  .placeholder-content {
    padding: 30px 20px;
    min-height: 300px;
  }
}
</style>
