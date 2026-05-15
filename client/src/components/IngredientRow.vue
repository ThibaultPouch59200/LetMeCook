<template>
  <div class="trow" style="cursor:default">
    <div class="col-name" style="flex:2"><span class="trow-name">{{ ingredient.name }}</span></div>
    <div class="col-qty" style="flex:1">{{ ingredient.quantity }} {{ ingredient.unit }}</div>
    <div class="col-cat" style="flex:1">
      <span class="badge badge-grey" v-if="ingredient.category">{{ ingredient.category }}</span>
      <span v-else style="color:var(--text-faint)">—</span>
    </div>
    <div class="col-exp" style="flex:1">
      <ExpiryBadge v-if="ingredient.expiration_date" :dateStr="ingredient.expiration_date" />
      <span v-else style="color:var(--text-faint)">—</span>
    </div>
    <div class="col-actions" style="flex:0 0 80px">
      <button class="btn btn-sm" @click="$emit('edit', ingredient)">✎</button>
      <button class="btn btn-sm btn-danger" @click="$emit('delete', ingredient)">✕</button>
    </div>
  </div>
</template>

<script setup>
import ExpiryBadge from './ExpiryBadge.vue'

defineProps({ ingredient: Object })
defineEmits(['edit', 'delete'])
</script>

<style scoped>
.col-actions { display: flex; gap: 4px; }

@media (max-width: 767px) {
  .col-cat, .col-exp { display: none !important; }
  .col-actions { flex: 0 0 72px !important; }
  .trow { min-height: 44px; }
}
</style>
