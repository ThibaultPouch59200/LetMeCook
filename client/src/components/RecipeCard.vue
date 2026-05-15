<template>
  <router-link
    :to="`/recipes/${recipe.id}`"
    class="recipe-card"
    :class="recipe.canCook ? 'rc-ok' : 'rc-nok'"
  >
    <div class="rc-top-bar" :class="recipe.canCook ? 'ok' : 'nok'"></div>
    <div class="rc-icon">{{ recipe.canCook ? '▶' : '○' }}</div>
    <div class="rc-name">{{ recipe.name }}</div>
    <div class="rc-date">{{ recipe.lastCookedAt || 'Never cooked' }}</div>
    <div class="rc-status" :class="recipe.canCook ? 'ok' : 'nok'">
      {{ recipe.canCook ? 'READY' : `MISSING ${recipe.missingCount}` }}
    </div>
  </router-link>
</template>

<script setup>
defineProps({ recipe: Object })
</script>

<style scoped>
.recipe-card { display: block; background: var(--panel-alt); text-decoration: none; color: inherit; border: 1px solid transparent; overflow: hidden; transition: background 0.1s; }
.recipe-card:hover { background: #2a2a2a; border-color: var(--border); }
.rc-top-bar { height: 3px; }
.rc-top-bar.ok  { background: var(--green); box-shadow: 0 1px 5px rgba(90,184,48,0.45); }
.rc-top-bar.nok { background: var(--red); }
.rc-icon   { padding: 8px 10px 0; font-size: 1rem; }
.rc-ok  .rc-icon { color: var(--green); }
.rc-nok .rc-icon { color: var(--red); }
.rc-name { padding: 4px 10px 2px; color: var(--text-bright); font-weight: 600; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-date { padding: 0 10px 4px; color: var(--text-faint); font-size: 0.67rem; }
.rc-status { padding: 4px 10px 8px; font-family: 'Share Tech Mono', monospace; font-size: 0.67rem; font-weight: 700; letter-spacing: 0.5px; }
.rc-status.ok  { color: var(--green); }
.rc-status.nok { color: var(--red); }

@media (max-width: 767px) {
  .rc-name { font-size: 0.78rem; }
}
</style>
