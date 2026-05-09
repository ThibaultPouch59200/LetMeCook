<template>
  <span class="badge" :class="canCook ? 'badge-green' : 'badge-red'">
    {{ canCook ? '✔ Ready' : `✘ Missing ${missingCount}` }}
  </span>
</template>

<script setup>
defineProps({ canCook: Boolean, missingCount: { type: Number, default: 0 } })
</script>
