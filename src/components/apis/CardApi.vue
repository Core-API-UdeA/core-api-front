<template>
  <div class="q-py-md">
    <q-card
      flat
      class="bg-accent row justify-between"
      style="border-radius: 15px; max-width: 460px; min-width: 400px"
    >
      <q-card-section class="col-2 justify-content-center">
        <q-badge unelevated color="white" style="border-radius: 8px">
          <span class="text-weight- text-accentitems q-px-sm q-py-xs" style="font-size: 1vmax">{{
            type
          }}</span>
        </q-badge>
        <div
          class="flex flex-center bg-white q-mt-sm"
          style="border-radius: 50px; width: 40px; height: 40px; border: solid 3px black"
        >
          <span class="text-weight-bolder">
            {{ getInitials(owner) }}
          </span>
        </div>
      </q-card-section>
      <q-card-section class="col-10">
        <div class="row justify-end">
          <q-icon name="eva-heart-outline" color="accentitems" size="md" />
        </div>
        <div class="q-my-md">
          <span class="text-h6 text-white">
            {{ title }}
          </span>
          <span class="text-subtitle1 text-weight-thin text-accentitems row">
            {{ caption }}
          </span>
        </div>

        <div class="row justify-between">
          <span class="text-subtitle1 text-weight-thin text-white">
            {{ owner }}
          </span>
          <span class="text-subtitle1 text-weight-thin text-white">
            {{ calculateTime(createdAt) }}
          </span>
        </div>

        <div class="row q-gutter-x-sm">
          <q-badge outline color="accentitems" style="border-radius: 8px"
            ><q-icon name="download" color="accentitems" size="xs"
          /></q-badge>
          <q-badge outline color="accentitems" style="border-radius: 8px"
            ><q-icon name="eva-star-outline" color="accentitems" size="xs"
          /></q-badge>
          <q-badge outline color="accentitems" style="border-radius: 8px"
            ><q-icon name="attach_money" color="accentitems" size="xs" />
            <span class="text-subtitle1 text-weight-thin text-accentitems">
              {{ price }}
            </span>
          </q-badge>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  type: String,
  price: Number,
  owner: String,
  createdAt: String,
  caption: String,
})

function getInitials(cadena) {
  if (!cadena) return ''
  return cadena.slice(0, 2).toUpperCase()
}

function calculateTime(date) {
  const actualDate = new Date()
  const dateConv = new Date(date)

  const diffMs = actualDate - dateConv // diferencia en milisegundos
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let result = 'Publicado hace '

  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365)
    result += years + (years > 1 ? ' años' : ' año')
  } else if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30)
    result += months + (months > 1 ? ' meses' : ' mes')
  } else if (diffDays >= 1) {
    result += diffDays + (diffDays > 1 ? ' días' : ' día')
  } else {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours > 0) {
      result += diffHours + (diffHours > 1 ? ' horas' : ' hora')
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      result += diffMinutes + (diffMinutes > 1 ? ' minutos' : ' minuto')
    }
  }

  return result
}
</script>

<style lang="scss" scoped></style>
