<template>
  <div class="dashboard">
    <!-- STAT BAR -->
    <div class="panel stat-bar" v-if="data">
      <div class="stat" v-for="s in stats" :key="s.label">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value" :style="{ color: s.color || 'var(--text)' }">{{ s.value }}</div>
      </div>
    </div>

    <!-- TWO PANELS -->
    <div class="row-2" v-if="data">
      <div class="panel">
        <div class="panel-title">Recently Added</div>
        <div class="trow" v-for="i in data.recentIngredients" :key="i.id">
          <div>
            <div class="trow-name">{{ i.name }}</div>
            <div class="trow-meta">{{ i.quantity }} {{ i.unit }} — added {{ timeAgo(i.created_at) }}</div>
          </div>
          <span class="badge badge-grey">{{ i.category || '—' }}</span>
        </div>
        <div class="trow" v-if="!data.recentIngredients.length" style="color:var(--text-muted)">No ingredients yet.</div>
      </div>

      <div class="panel">
        <div class="panel-title">⚠ Expiring Soon</div>
        <div class="trow" v-for="i in data.expiringIngredients" :key="i.id">
          <div>
            <div class="trow-name">{{ i.name }}</div>
            <div class="trow-meta">{{ i.quantity }} {{ i.unit }} — expires {{ i.expiration_date }}</div>
          </div>
          <span class="badge" :class="expiryBadge(i.expiration_date)">{{ daysUntil(i.expiration_date) }}d</span>
        </div>
        <div class="trow" v-if="!data.expiringIngredients.length" style="color:var(--text-muted)">Nothing expiring soon.</div>
      </div>
    </div>

    <!-- RECENT DISHES -->
    <div class="panel" v-if="data">
      <div class="panel-title">Recent Dishes</div>
      <div class="dishes-grid">
        <router-link v-for="r in data.recentRecipes" :key="r.id" :to="`/recipes/${r.id}`" class="dish-card">
          <div class="dish-icon">🍽</div>
          <div class="dish-name">{{ r.name }}</div>
          <div class="dish-date">{{ r.lastCookedAt ? 'Last cooked: ' + r.lastCookedAt : 'Not cooked yet' }}</div>
          <div class="dish-status" :class="r.canCook ? 'ok' : 'missing'">
            {{ r.canCook ? '✔ Ready to cook' : `✘ Missing ${r.missingCount}` }}
          </div>
        </router-link>
        <div v-if="!data.recentRecipes.length" style="color:var(--text-muted);padding:12px">No recipes yet.</div>
      </div>
    </div>

    <div v-if="!data" style="padding:2rem;color:var(--text-muted)">Loading...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'

const data = ref(null)
onMounted(async () => { data.value = await api.dashboard.get() })

const stats = computed(() => {
  if (!data.value) return []
  const s = data.value.stats
  return [
    { label: 'Ingredients', value: s.totalIngredients },
    { label: 'Expiring', value: s.expiringCount, color: s.expiringCount > 0 ? 'var(--red)' : 'var(--green)' },
    { label: 'Recipes', value: s.totalRecipes },
    { label: 'Ready to Cook', value: s.readyCount, color: 'var(--green)' },
    { label: 'Total Cooks', value: s.totalCooks }
  ]
})

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return '1 day ago'
  return `${diff} days ago`
}

function daysUntil(dateStr) {
  return Math.max(0, Math.ceil((new Date(dateStr) - Date.now()) / 86400000))
}

function expiryBadge(dateStr) {
  const d = daysUntil(dateStr)
  if (d <= 3) return 'badge-red'
  if (d <= 7) return 'badge-yellow'
  return 'badge-green'
}
</script>

<style scoped>
.dashboard { padding: 10px; display: flex; flex-direction: column; gap: 8px; height: 100%; overflow-y: auto; }

.stat-bar { display: flex; }
.stat { flex: 1; padding: 9px 14px; border-right: 1px solid var(--border-dim); }
.stat:last-child { border-right: none; }
.stat-label { color: var(--text-dim); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
.stat-value { font-size: 1.4rem; font-weight: 700; font-family: 'Share Tech Mono', monospace; }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.dishes-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--border-dim); padding: 1px; }
.dish-card {
  background: var(--panel-alt); padding: 10px; text-decoration: none; color: inherit;
  border: 1px solid transparent;
}
.dish-card:hover { background: #2a2a2a; border-color: var(--border); }
.dish-icon { font-size: 1.6rem; margin-bottom: 5px; filter: saturate(0.85); }
.dish-name { color: var(--text-bright); font-weight: 600; font-size: 0.82rem; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dish-date { color: var(--text-faint); font-size: 0.68rem; margin-bottom: 4px; }
.dish-status { font-size: 0.7rem; font-weight: 600; }
.dish-status.ok { color: var(--green); }
.dish-status.missing { color: var(--red); }
</style>
