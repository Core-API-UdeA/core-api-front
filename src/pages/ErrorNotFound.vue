<template>
  <div class="error-container">
    <!-- Fondo animado con partículas -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="content-wrapper">
      <!-- Número 404 con efecto glitch -->
      <div class="error-number-container">
        <h1 class="error-number glitch" data-text="404">404</h1>
        <div class="error-number-shadow">404</div>
      </div>

      <!-- Mensaje principal -->
      <div class="error-message">
        <h2 class="main-message">¡Oops! Página no encontrada</h2>
        <p class="sub-message">
          Parece que la página que buscas se ha perdido en el ciberespacio.
          <br />
          ¡Pero no te preocupes, te ayudamos a volver al camino correcto!
        </p>
      </div>

      <!-- Ilustración SVG animada -->
      <div class="illustration">
        <svg width="200" height="150" viewBox="0 0 200 150" class="lost-astronaut">
          <!-- Astronauta -->
          <circle cx="100" cy="50" r="25" fill="#ffffff" class="head bounce"/>
          <ellipse cx="100" cy="85" rx="20" ry="30" fill="#e0e0e0" class="body"/>
          <rect x="85" y="70" width="30" height="20" rx="15" fill="#4a90e2" class="visor"/>

          <!-- Brazos -->
          <ellipse cx="75" cy="75" rx="8" ry="15" fill="#e0e0e0" class="arm-left wave"/>
          <ellipse cx="125" cy="75" rx="8" ry="15" fill="#e0e0e0" class="arm-right"/>

          <!-- Piernas -->
          <ellipse cx="90" cy="115" rx="6" ry="20" fill="#e0e0e0" class="leg"/>
          <ellipse cx="110" cy="115" rx="6" ry="20" fill="#e0e0e2" class="leg"/>

          <!-- Estrellas flotantes -->
          <circle cx="30" cy="30" r="2" fill="#ffd700" class="star star-1"/>
          <circle cx="170" cy="25" r="1.5" fill="#ffd700" class="star star-2"/>
          <circle cx="160" cy="60" r="2" fill="#ffd700" class="star star-3"/>
          <circle cx="40" cy="80" r="1" fill="#ffd700" class="star star-4"/>
        </svg>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <q-btn
          class="home-btn"
          color="white"
          text-color="primary"
          unelevated
          rounded
          size="lg"
          to="/"
          no-caps
          icon="home"
          label="Ir al Inicio"
        />
        <q-btn
          class="back-btn q-ml-md"
          color="transparent"
          text-color="white"
          outline
          rounded
          size="lg"
          @click="goBack"
          no-caps
          icon="arrow_back"
          label="Volver Atrás"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>
.error-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(90deg, #06cccc 14%, #0a4c52 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Fondo animado
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}

.shape-3 {
  width: 40px;
  height: 40px;
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: 20%;
  animation-delay: 1.5s;
}

.shape-5 {
  width: 50px;
  height: 50px;
  top: 50%;
  left: 5%;
  animation-delay: 3s;
}

.shape-6 {
  width: 70px;
  height: 70px;
  top: 40%;
  right: 5%;
  animation-delay: 0.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

// Contenido principal
.content-wrapper {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 20px;
}

// Número 404 con efecto glitch
.error-number-container {
  position: relative;
  margin-bottom: 30px;
}

.error-number {
  font-size: clamp(4rem, 15vw, 12rem);
  font-weight: 900;
  margin: 0;
  position: relative;
  display: inline-block;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.error-number-shadow {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: clamp(4rem, 15vw, 12rem);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.1);
  z-index: -1;
}

// Efecto glitch
.glitch {
  animation: glitch 2s infinite;
}

.glitch:before,
.glitch:after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch:before {
  animation: glitch-top 2s infinite;
  color: #ff0040;
  z-index: -1;
}

.glitch:after {
  animation: glitch-bottom 2s infinite;
  color: #00ffff;
  z-index: -2;
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-top {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, -2px); }
  40% { transform: translate(-2px, 2px); }
  60% { transform: translate(2px, -2px); }
  80% { transform: translate(2px, 2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-bottom {
  0% { transform: translate(0); }
  20% { transform: translate(2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, 2px); }
  80% { transform: translate(-2px, -2px); }
  100% { transform: translate(0); }
}

// Mensajes
.error-message {
  margin-bottom: 40px;
}

.main-message {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.sub-message {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 0;
}

// Ilustración SVG
.illustration {
  margin: 40px 0;
}

.lost-astronaut {
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
}

.bounce {
  animation: bounce 3s ease-in-out infinite;
}

.wave {
  animation: wave 2s ease-in-out infinite;
  transform-origin: center bottom;
}

.star {
  animation: twinkle 2s ease-in-out infinite alternate;
}

.star-1 { animation-delay: 0s; }
.star-2 { animation-delay: 0.5s; }
.star-3 { animation-delay: 1s; }
.star-4 { animation-delay: 1.5s; }

@keyframes bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes wave {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

@keyframes twinkle {
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.2); }
}

// Botones de acción
.action-buttons {
  margin: 40px 0;
}

.home-btn, .back-btn {
  transition: all 0.3s ease;
  font-weight: 500;
  padding: 12px 24px;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

// Enlaces útiles
.helpful-links {
  margin-top: 50px;
}

.links-title {
  font-size: 1.1rem;
  margin-bottom: 20px;
  opacity: 0.9;
}

.links-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.help-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  padding: 15px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  min-width: 80px;
}

.help-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
  color: white;
}

.help-link span {
  margin-top: 8px;
  font-size: 0.9rem;
}

// Responsive
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 15px;
  }

  .action-buttons {
    .back-btn {
      margin-left: 0 !important;
      margin-top: 15px;
    }
  }

  .links-grid {
    gap: 20px;
  }

  .floating-shapes .shape {
    display: none;
  }
}

@media (max-width: 480px) {
  .sub-message br {
    display: none;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}</style>
