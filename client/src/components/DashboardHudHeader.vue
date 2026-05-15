<template>
  <div class="hud-header">
    <div class="hud-left">
      <div class="hud-title">KITCHEN STATUS</div>
      <div class="hud-date">{{ todayStr }}</div>
    </div>
    <div class="hud-right" v-if="summary">
      <div class="sys-status" :class="systemStatus.cls">
        <span class="sys-led"></span>
        SYSTEM {{ systemStatus.label }}
      </div>
      <div class="hud-summary">
        {{ summary.totalIngredients }} ingr &bull; {{ summary.totalRecipes }} recipes &bull; {{ summary.totalCooks }} cooks
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ todayStr: String, systemStatus: Object, summary: Object })
</script>

<style scoped>
.hud-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: var(--header); border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
  background-image:
    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.025) 39px, rgba(255,255,255,0.025) 40px),
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.025) 19px, rgba(255,255,255,0.025) 20px);
}
.hud-title { font-family: 'Share Tech Mono', monospace; font-size: 1.1rem; font-weight: 700; letter-spacing: 4px; color: var(--accent); text-shadow: 0 0 20px rgba(224,160,32,0.45); }
.hud-date { font-size: 0.65rem; color: var(--text-faint); letter-spacing: 2px; margin-top: 3px; }
.hud-right { text-align: right; }
.hud-summary { font-size: 0.65rem; color: var(--text-faint); letter-spacing: 1px; margin-top: 4px; }
.sys-status { display: inline-flex; align-items: center; gap: 7px; font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; letter-spacing: 2px; font-weight: 700; }
.sys-status.nominal  { color: var(--green); }
.sys-status.warning  { color: var(--yellow); }
.sys-status.critical { color: var(--red); }
.sys-status.offline  { color: var(--text-faint); }
.sys-led { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.nominal  .sys-led { background: var(--green);  box-shadow: 0 0 6px var(--green);  animation: pulse-green  2.5s ease-in-out infinite; }
.warning  .sys-led { background: var(--yellow); box-shadow: 0 0 6px var(--yellow); animation: pulse-yellow 1.5s ease-in-out infinite; }
.critical .sys-led { background: var(--red);    box-shadow: 0 0 8px var(--red);    animation: pulse-red    0.7s ease-in-out infinite; }
.offline  .sys-led { background: var(--text-faint); }

@media (max-width: 767px) {
  .hud-header { flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 12px; }
  .hud-right { text-align: left; }
  .hud-title { font-size: 0.9rem; letter-spacing: 2px; }
}
@keyframes pulse-green  { 0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--green);  } 50% { opacity: 0.55; box-shadow: 0 0 2px var(--green);  } }
@keyframes pulse-yellow { 0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--yellow); } 50% { opacity: 0.45; box-shadow: 0 0 2px var(--yellow); } }
@keyframes pulse-red    { 0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--red);    } 50% { opacity: 0.35; box-shadow: 0 0 2px var(--red);    } }
</style>
