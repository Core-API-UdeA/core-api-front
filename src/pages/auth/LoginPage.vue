<template>
  <q-page class="auth-container">
    <div class="forms-wrapper" :class="{ 'show-register': !isLogin }">
      <!-- Contenedor completo que se desliza -->
      <div class="sliding-container">
        <!-- Vista Login (Login + Transition) -->
        <div class="form-view login-view">
          <div class="form-column">
            <LoginForm />
          </div>
          <TransitionForm :isLogin="isLogin" @toggleForm="toggleForm" :visible="isLogin" />
        </div>

        <!-- Vista Register (Transition + Register) -->
        <div class="form-view register-view">
          <TransitionForm :isLogin="isLogin" @toggleForm="toggleForm" :visible="!isLogin" />
          <div class="form-column">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, ref } from 'vue'

const LoginForm = defineAsyncComponent(() => import('src/components/auth/LoginForm.vue'))
const RegisterForm = defineAsyncComponent(() => import('src/components/auth/RegisterForm.vue'))
const TransitionForm = defineAsyncComponent(() => import('src/components/auth/TransitionForm.vue'))

const isLogin = ref(true)

function toggleForm() {
  isLogin.value = !isLogin.value
}
</script>

<style lang="scss" scoped>
.auth-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.forms-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.sliding-container {
  display: flex;
  width: 200%; // Dos vistas lado a lado
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateX(0);

  // Cuando se muestra registro, desliza hacia la izquierda
  .forms-wrapper.show-register & {
    transform: translateX(-50%);
  }
}

.form-view {
  width: 50%; // Cada vista ocupa 50% del contenedor deslizante
  height: 100%;
  display: flex;
  flex-shrink: 0;
}

.form-column,
.transition-column {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: stretch;
}

// Animación de aparición para los elementos
.form-column,
.transition-column {
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.6s ease-out forwards;
}

// Delay escalonado para efecto más suave
.login-view .form-column {
  animation-delay: 0.2s;
}

.login-view .transition-column {
  animation-delay: 0.4s;
}

.register-view .transition-column {
  animation-delay: 0.2s;
}

.register-view .form-column {
  animation-delay: 0.4s;
}

@keyframes slideInUp {
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
  .form-view {
    flex-direction: column;
  }

  .form-column,
  .transition-column {
    flex: 1;
    min-height: 50vh;
  }
}

// Mejora de rendimiento
.sliding-container {
  will-change: transform;
  backface-visibility: hidden;
}

// Efecto hover sutil en la transición
.transition-column {
  transition: filter 0.3s ease;
}

.forms-wrapper:not(.show-register) .register-view .transition-column,
.forms-wrapper.show-register .login-view .transition-column {
  filter: brightness(0.95);
}
</style>
