<template>
  <div class="expiry-row">
    <span class="led" :class="ledClass"></span>
    <div class="expiry-info">
      <span class="expiry-name">{{ ingredient.name }}</span>
      <span class="expiry-qty">{{ ingredient.quantity }} {{ ingredient.unit }}</span>
    </div>
    <div class="countdown" :class="countdownClass">
      <span class="cd-num">{{ days }}</span>
      <span class="cd-unit">DAYS</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ ingredient: Object })

const days = computed(() => Math.max(0, Math.ceil((new Date(props.ingredient.expiration_date) - Date.now()) / 86400000)))
const ledClass = computed(() => days.value <= 3 ? 'led-red' : days.value <= 7 ? 'led-yellow' : 'led-green')
const countdownClass = computed(() => days.value <= 3 ? 'cd-critical' : days.value <= 7 ? 'cd-warning' : 'cd-ok')
</script>

<style scoped>
.expiry-row { display: flex; align-items: center; gap: 10px; padding: 7px 12px; border-bottom: 1px solid var(--border-dim); }
.expiry-row:nth-child(even) { background: var(--row-alt); }
.expiry-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.expiry-name { color: var(--text-bright); font-weight: 600; font-size: 0.83rem; }
.expiry-qty  { color: var(--text-dim); font-size: 0.72rem; }
.led { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.led-green  { background: var(--green);  box-shadow: 0 0 4px var(--green); }
.led-yellow { background: var(--yellow); box-shadow: 0 0 4px var(--yellow); animation: pulse-yellow 1.5s ease-in-out infinite; }
.led-red    { background: var(--red);    box-shadow: 0 0 6px var(--red);    animation: pulse-red    0.8s ease-in-out infinite; }
.countdown { display: flex; flex-direction: column; align-items: center; min-width: 38px; font-family: 'Share Tech Mono', monospace; }
.cd-num  { font-size: 1.35rem; font-weight: 700; line-height: 1; }
.cd-unit { font-size: 0.52rem; letter-spacing: 1px; color: var(--text-faint); }
.cd-critical .cd-num { color: var(--red);    text-shadow: 0 0 8px rgba(200,48,32,0.6); }
.cd-warning  .cd-num { color: var(--yellow); }
.cd-ok       .cd-num { color: var(--green);  }
@keyframes pulse-yellow { 0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--yellow); } 50% { opacity: 0.45; box-shadow: 0 0 2px var(--yellow); } }
@keyframes pulse-red    { 0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--red);    } 50% { opacity: 0.35; box-shadow: 0 0 2px var(--red);    } }
</style>
