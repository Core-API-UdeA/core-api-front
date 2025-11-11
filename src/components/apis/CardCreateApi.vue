<template>
  <q-card
    flat
    class="flex flex-center bg-transparent api-card cursor-pointer"
    style="border-radius: 15px; max-width: 460px; min-width: 400px; border: 2px dashed #5e5e5e"
    @click="$router.push('/main/apis/registro')"
  >
    <q-card-section>
      <q-icon name="add" color="accentitems" size="md" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
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
</style>
