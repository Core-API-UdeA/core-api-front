<template>
  <q-page padding class="bg-bgpage">
    <div class="container">
      <div class="content-wrapper">
        <!-- Header con logo -->
        <div class="header">
          <q-img src="~assets/core api.png" alt="Logo" style="width: 150px" class="q-mb-sm" />
        </div>

        <!-- Contenido principal -->
        <div class="main-content">
          <!-- Icono de éxito -->
          <div class="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#00a8a8" stroke-width="2" />
              <path
                d="M32 42L38 48L56 28"
                stroke="#00a8a8"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <!-- Título principal -->
          <h1 class="title">¡Revisa tu correo!</h1>

          <!-- Descripción -->
          <p class="description">Hemos enviado un enlace de confirmación a tu bandeja de correo:</p>

          <!-- Instrucciones -->
          <div class="instructions">
            <p class="instructions-title">¿Qué sigue?</p>
            <ol class="instructions-list">
              <li>Abre tu bandeja de entrada</li>
              <li>Busca el correo de CoreAPI</li>
              <li>Haz clic en el enlace de confirmación</li>
              <li>¡Listo! Comenzarás a usar CoreAPI</li>
            </ol>
          </div>

          <!-- Advertencia -->
          <div class="warning-box">
            <p class="warning-text">
              <strong>Nota:</strong> El enlace expirará en 24 horas. Si no ves el correo, revisa tu
              carpeta de spam.
            </p>
          </div>

          <!-- Link de regreso -->
          <div class="back-link">
            <q-btn
              style="padding: 0 30px 0 30px; font-size: 0.6vmax; border-radius: 10px"
              dense
              no-caps
              flat
              color="white"
              label="volver atras"
              @click="$router.go(-1)"
              icon="arrow_back"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">
            ¿Necesitas ayuda? <a href="/support" class="footer-link">Contacta a nuestro equipo</a>
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup></script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.content-wrapper {
  width: 100%;
  max-width: 600px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #00a8a8;
  letter-spacing: 2px;
}

.main-content {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 50px 40px;
  border: 1px solid #2a2a2a;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.success-icon {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 15px;
}

.description {
  color: #b0b0b0;
  font-size: 16px;
  margin-bottom: 25px;
  line-height: 1.6;
}

.email-box {
  background: #252525;
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.email {
  color: #00a8a8;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  text-align: left;
  word-break: break-all;
}

.change-email-btn {
  background: transparent;
  color: #00a8a8;
  border: 1px solid #00a8a8;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(0, 168, 168, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
}

.instructions {
  background: #252525;
  border-left: 4px solid #00a8a8;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 25px;
  text-align: left;
}

.instructions-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
}

.instructions-list {
  list-style: none;
  padding: 0;

  li {
    color: #b0b0b0;
    font-size: 14px;
    padding: 8px 0;
    padding-left: 28px;
    position: relative;
    line-height: 1.6;

    &::before {
      content: attr(data-number);
      position: absolute;
      left: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #00a8a8;
      color: #0f0f0f;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
    }

    &:nth-child(1)::before {
      content: '1';
    }
    &:nth-child(2)::before {
      content: '2';
    }
    &:nth-child(3)::before {
      content: '3';
    }
    &:nth-child(4)::before {
      content: '4';
    }
  }
}

.warning-box {
  background: rgba(0, 168, 168, 0.1);
  border: 1px solid rgba(0, 168, 168, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 30px;
}

.warning-text {
  color: #b0b0b0;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;

  strong {
    color: #00a8a8;
  }
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  flex-direction: column;

  @media (min-width: 480px) {
    flex-direction: row;
  }
}

.primary-btn,
.secondary-btn {
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  flex: 1;
}

.primary-btn {
  background: linear-gradient(135deg, #00a8a8 0%, #008080 100%);
  color: white;
  box-shadow: 0 10px 25px rgba(0, 168, 168, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(0, 168, 168, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.secondary-btn {
  background: #252525;
  color: #00a8a8;
  border: 1px solid #00a8a8;

  &:hover:not(:disabled) {
    background: rgba(0, 168, 168, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}

.back-link {
  text-align: center;
}

.link {
  color: #00a8a8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    text-decoration: underline;
  }
}

.footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #2a2a2a;
}

.footer-text {
  color: #808080;
  font-size: 13px;
  line-height: 1.6;
}

.footer-link {
  color: #00a8a8;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    text-decoration: underline;
  }
}
</style>
