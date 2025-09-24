<template>
  <q-item
    clickable
    class="q-ma-sm"
    :to="props.link"
    :class="isActive ? 'bg-accent' : ''"
    style="border-radius: 12px"
  >
    <q-item-section avatar>
      <div class="q-pa-sm q-mr-sm">
        <q-icon :name="props.icon" size="24px" :color="isActive ? 'primary' : 'white'" />
      </div>
    </q-item-section>

    <q-item-section>
      <q-item-label :class="isActive ? 'text-weight-bolder text-accentlight' : 'text-weight-bolder text-accentitems'" >{{ props.title }}</q-item-label>
      <q-item-label caption :style="isActive ? 'border-bottom: solid #07A6A8; width: 5vmax' : ''" class="text-accentlight">{{
        props.caption
      }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  title: String,
  caption: String,
  link: String,
  icon: String,
})

const router = useRouter()

const isActive = computed({
  get() {
    return router.currentRoute.value.path.includes(props.link)
  },
})
</script>

<style scoped></style>
