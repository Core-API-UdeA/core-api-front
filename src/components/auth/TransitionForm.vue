<template>
  <transition name="fade">
    <q-card
      v-if="visible"
      flat
      style="height: 100%; width: 50%"
      :style="isLogin ? 'border-radius: 350px 0 0 200px;' : 'border-radius: 0 350px 200px 0;'"
      class="mixed-color flex flex-center"
    >
      <q-card-section>
        <div
          class="text-h4 text-white"
          style="font-weight: 600; text-align: center; padding: 20px; user-select: none"
        >
          {{ isLogin ? 'Hello, Friend!' : 'Welcome back!' }}
          <div class="text-weight-thin" style="font-size: 1.2vmax; width: 420px">
            {{
              isLogin
                ? 'Register using your personal information to access all of our features.'
                : 'Enter your personal details to access all of our features.'
            }}
          </div>
        </div>

        <div class="flex flex-center" style="margin-top: 20px">
          <q-btn
            :label="isLogin ? 'Sign Up' : 'Sign In'"
            style="padding: 0 30px 0 30px; font-size: 1vmax; border-radius: 10px"
            dense
            no-caps
            outline
            @click="emit('toggleForm')"
            color="white"
          />
        </div>
      </q-card-section>
    </q-card>
  </transition>
</template>

<script setup>
const props = defineProps({
  isLogin: {
    type: Boolean,
    required: true,
    default: true,
  },
  visible: {
    type: Boolean,
    required: false,
    default: true,
  },
})
const emit = defineEmits(['toggleForm'])
</script>

<style lang="scss" scoped>
.mixed-color {
  background: linear-gradient(90deg, #06cccc 14%, #0a4c52 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
