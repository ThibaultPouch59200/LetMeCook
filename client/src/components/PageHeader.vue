<template>
  <div class="panel-title top-bar">
    <span>{{ title }}</span>
    <slot />
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>

<style scoped>
.top-bar { background: var(--header-mid); border: 1px solid var(--border-dim); border-bottom: none; box-shadow: var(--bevel-hi), var(--bevel-lo); }
</style>
