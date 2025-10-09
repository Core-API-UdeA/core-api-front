<template>
  <div class="cards-container">
    <div class="row animated-row q-gutter-x-md q-gutter-y-md flex flex-center">
      <div
        v-for="(item, index) in items"
        :key="item.name"
        class="col-lg col-xs-12 animated-card"
        :class="[item.color, `card-${index + 1}`]"
        :style="{
          '--delay': `${index * 0.1}s`,
          '--card-index': index,
        }"
        @mouseenter="handleHover(index)"
        @mouseleave="handleLeave(index)"
      >
        <!-- Efectos de fondo -->
        <div class="card-bg-effects">
          <div class="shimmer-effect"></div>
          <div class="gradient-overlay"></div>
          <div class="floating-particles">
            <span class="particle particle-1"></span>
            <span class="particle particle-2"></span>
            <span class="particle particle-3"></span>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="card-content">
          <div class="text-subtitle1 text-white q-pa-sm text-weight-bold card-text">
            {{ item.description }}
          </div>

          <!-- Indicador de hover -->
          <div class="hover-indicator">
            <q-icon name="arrow_forward" size="20px" color="white" />
          </div>
        </div>

        <!-- Borde animado -->
        <div class="animated-border"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  {
    name: 'card1',
    description: '+100 APIs disponibles | +5000 descargas | Creciendo cada semana',
    color: 'bg-primary',
  },
  {
    name: 'card2',
    description: 'La manera más simple de integrar tecnología en tus proyectos',
    color: 'bg-secondary',
  },
  {
    name: 'card3',
    description: 'Más rápido, más seguro, más escalable',
    color: 'bg-primary',
  },
  {
    name: 'card4',
    description: 'Un marketplace hecho para crecer contigo',
    color: 'bg-secondary',
  },
  {
    name: 'card5',
    description: 'Conecta, publica y monetiza tus APIs',
    color: 'bg-primary',
  },
  {
    name: 'card6',
    description: 'Descubre mucho más...',
    color: 'bg-secondary',
  },
])

function handleHover(index) {
  // Opcional: agregar lógica adicional en hover
}

function handleLeave(index) {
  // Opcional: agregar lógica adicional cuando sale el hover
}
</script>

<style lang="scss" scoped>
.cards-container {
  perspective: 1000px;
}

.animated-row {
  animation: slideInFromBottom 0.8s ease-out;
}

.animated-card {
  max-width: 95vw;
  position: relative;
  border-radius: 15px !important;
  min-height: 11vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: fadeInUp 0.6s ease-out calc(var(--delay)) both;
  transform-origin: center bottom;

  // Hover effects
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    z-index: 10;

    .shimmer-effect {
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .gradient-overlay {
      opacity: 1;
    }

    .floating-particles .particle {
      animation-play-state: running;
    }

    .hover-indicator {
      opacity: 1;
      transform: translateX(0);
    }

    .animated-border {
      opacity: 1;
      animation: borderPulse 2s ease-in-out infinite;
    }

    .card-text {
      transform: translateX(5px);
    }
  }

  // Efectos específicos por índice
  &.card-1:hover {
    transform: translateY(-8px) scale(1.02) rotateY(2deg);
  }
  &.card-2:hover {
    transform: translateY(-8px) scale(1.02) rotateY(-2deg);
  }
  &.card-3:hover {
    transform: translateY(-8px) scale(1.02) rotateY(2deg);
  }
  &.card-4:hover {
    transform: translateY(-8px) scale(1.02) rotateY(-2deg);
  }
  &.card-5:hover {
    transform: translateY(-8px) scale(1.02) rotateY(2deg);
  }
  &.card-6:hover {
    transform: translateY(-8px) scale(1.02) rotateY(-2deg);
  }
}

// Efectos de fondo
.card-bg-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.shimmer-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.5s;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

// Partículas flotantes
.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation-play-state: paused;
}

.particle-1 {
  top: 20%;
  right: 20%;
  animation: float1 3s ease-in-out infinite;
  animation-delay: 0s;
}

.particle-2 {
  top: 60%;
  right: 10%;
  animation: float2 4s ease-in-out infinite;
  animation-delay: 1s;
}

.particle-3 {
  top: 30%;
  right: 40%;
  animation: float3 5s ease-in-out infinite;
  animation-delay: 2s;
}

// Contenido principal
.card-content {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-text {
  font-size: 0.8vmax !important;
  transition: transform 0.3s ease;
  flex: 1;
}

.hover-indicator {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  margin-right: 15px;
}

// Borde animado
.animated-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 15px;
  opacity: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 15px;
    padding: 2px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd);
    background-size: 300% 300%;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: gradientRotate 3s linear infinite;
  }
}

// Animaciones keyframes
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes float1 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }
  33% {
    transform: translateY(-10px) translateX(5px);
  }
  66% {
    transform: translateY(5px) translateX(-5px);
  }
}

@keyframes float2 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) translateX(10px) rotate(180deg);
  }
}

@keyframes float3 {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.2);
  }
}

@keyframes borderPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.01);
  }
}

@keyframes gradientRotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// Efectos adicionales para bg-primary y bg-secondary
.bg-primary {
  background: linear-gradient(135deg, #07a6a8 0%, #069092 100%) !important;

  &:hover {
    background: linear-gradient(135deg, #07a6a8 0%, #067577 100%) !important;
  }
}

.bg-secondary {
  background: linear-gradient(135deg, #0a4c52 0%, #023f44 100%) !important;

  &:hover {
    background: linear-gradient(135deg, #0a4c52 0%, #032f33 100%) !important;
  }
}

// Responsive
@media (max-width: 1024px) {
  .animated-card {
    &:hover {
      transform: translateY(-5px) scale(1.01);
    }

    &.card-1:hover,
    &.card-2:hover,
    &.card-3:hover,
    &.card-4:hover,
    &.card-5:hover,
    &.card-6:hover {
      transform: translateY(-5px) scale(1.01);
    }
  }

  .card-text {
    font-size: 0.9rem !important;
  }
}

@media (max-width: 768px) {
  .animated-card {
    min-height: 10vh;

    &:hover {
      transform: translateY(-3px);
    }
  }

  .card-text {
    font-size: 0.8rem !important;
  }

  .floating-particles,
  .animated-border {
    display: none;
  }
}

// Efectos de entrada escalonada para mobile
@media (max-width: 768px) {
  .animated-card {
    animation: mobileSlideIn 0.5s ease-out calc(var(--delay)) both;
  }
}

@keyframes mobileSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
