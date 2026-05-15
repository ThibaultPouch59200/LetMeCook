<template>
  <div class="stat-block">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value" :style="{ color: color || 'var(--text-bright)' }">{{ value }}</div>
    <div class="stat-track" v-if="bar != null">
      <div class="stat-fill" :style="{ width: Math.max(2, bar) + '%', background: barColor }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [Number, String],
  color: String,
  bar: { type: Number, default: null },
  barColor: String
})
</script>

<style scoped>
.stat-block { flex: 1; padding: 10px 14px; border-right: 1px solid var(--border-dim); }
.stat-block:last-child { border-right: none; }
.stat-label { color: var(--text-dim); font-size: 0.63rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
.stat-value { font-family: 'Share Tech Mono', monospace; font-size: 1.7rem; font-weight: 700; line-height: 1; margin-bottom: 7px; }
.stat-track { height: 2px; background: var(--border-dim); }
.stat-fill { height: 100%; transition: width 0.6s ease; }

@media (max-width: 767px) {
  .stat-block { flex: 1 1 50%; border-right: 1px solid var(--border-dim); border-bottom: 1px solid var(--border-dim); min-width: 0; }
  .stat-block:nth-child(even) { border-right: none; }
  .stat-block:nth-last-child(-n+2) { border-bottom: none; }
  .stat-value { font-size: 1.35rem; }
}
</style>
