<template>
  <span class="badge" :class="badgeClass">{{ dateStr }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ dateStr: String })

const badgeClass = computed(() => {
  const d = Math.max(0, Math.ceil((new Date(props.dateStr) - Date.now()) / 86400000))
  if (d <= 3) return 'badge-red'
  if (d <= 7) return 'badge-yellow'
  return 'badge-green'
})
</script>
