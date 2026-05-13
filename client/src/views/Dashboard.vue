<template>
  <div class="dashboard">

    <!-- HUD HEADER -->
    <div class="hud-header">
      <div class="hud-left">
        <div class="hud-title">KITCHEN STATUS</div>
        <div class="hud-date">{{ todayStr }}</div>
      </div>
      <div class="hud-right" v-if="data">
        <div class="sys-status" :class="systemStatus.cls">
          <span class="sys-led"></span>
          SYSTEM {{ systemStatus.label }}
        </div>
        <div class="hud-summary">
          {{ data.stats.totalIngredients }} ingr &bull; {{ data.stats.totalRecipes }} recipes &bull; {{ data.stats.totalCooks }} cooks
        </div>
      </div>
    </div>

    <!-- STAT ROW -->
    <div class="stat-row panel" v-if="data">
      <div class="stat-block" v-for="s in stats" :key="s.label">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value" :style="{ color: s.color || 'var(--text-bright)' }">{{ s.value }}</div>
        <div class="stat-track" v-if="s.bar != null">
          <div class="stat-fill" :style="{ width: Math.max(2, s.bar) + '%', background: s.barColor }"></div>
        </div>
      </div>
    </div>

    <!-- TWO PANELS -->
    <div class="row-2" v-if="data">

      <!-- EXPIRING SOON -->
      <div class="panel">
        <div class="panel-title">
          ▲ EXPIRING SOON
          <span class="badge" :class="data.expiringIngredients.length ? 'badge-red' : 'badge-green'">
            {{ data.expiringIngredients.length }}
          </span>
        </div>
        <div class="trow" v-if="!data.expiringIngredients.length" style="color:var(--green);gap:8px">
          <span>✓</span><span>All clear — nothing expiring soon</span>
        </div>
        <div class="expiry-row" v-for="i in data.expiringIngredients" :key="i.id">
          <span class="led" :class="ledClass(i.expiration_date)"></span>
          <div class="expiry-info">
            <span class="expiry-name">{{ i.name }}</span>
            <span class="expiry-qty">{{ i.quantity }} {{ i.unit }}</span>
          </div>
          <div class="countdown" :class="countdownClass(i.expiration_date)">
            <span class="cd-num">{{ daysUntil(i.expiration_date) }}</span>
            <span class="cd-unit">DAYS</span>
          </div>
        </div>
      </div>

      <!-- RECENT INTAKE -->
      <div class="panel">
        <div class="panel-title">RECENT INTAKE</div>
        <div class="trow" v-for="i in data.recentIngredients" :key="i.id">
          <div>
            <div class="trow-name">{{ i.name }}</div>
            <div class="trow-meta">{{ i.quantity }} {{ i.unit }} — {{ timeAgo(i.created_at) }}</div>
          </div>
          <span class="badge badge-grey">{{ i.category || '—' }}</span>
        </div>
        <div class="trow" v-if="!data.recentIngredients.length" style="color:var(--text-muted)">No ingredients yet.</div>
      </div>
    </div>

    <!-- RECIPE READINESS -->
    <div class="panel" v-if="data">
      <div class="panel-title">
        RECIPE READINESS
        <span class="panel-note">{{ readyCount }}/{{ data.recentRecipes.length }} READY</span>
      </div>
      <div class="recipes-grid">
        <router-link
          v-for="r in data.recentRecipes"
          :key="r.id"
          :to="`/recipes/${r.id}`"
          class="recipe-card"
          :class="r.canCook ? 'rc-ok' : 'rc-nok'"
        >
          <div class="rc-top-bar" :class="r.canCook ? 'ok' : 'nok'"></div>
          <div class="rc-icon">{{ r.canCook ? '▶' : '○' }}</div>
          <div class="rc-name">{{ r.name }}</div>
          <div class="rc-date">{{ r.lastCookedAt || 'Never cooked' }}</div>
          <div class="rc-status" :class="r.canCook ? 'ok' : 'nok'">
            {{ r.canCook ? 'READY' : `MISSING ${r.missingCount}` }}
          </div>
        </router-link>
        <div v-if="!data.recentRecipes.length" style="color:var(--text-muted);padding:12px;grid-column:1/-1">No recipes yet.</div>
      </div>
    </div>

    <div v-if="!data" class="loading-state">
      <span class="led led-pulse"></span> INITIALIZING SYSTEMS...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'

const data = ref(null)
onMounted(async () => { data.value = await api.dashboard.get() })

const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()

const readyCount = computed(() => {
  if (!data.value) return 0
  return data.value.recentRecipes.filter(r => r.canCook).length
})

const systemStatus = computed(() => {
  if (!data.value) return { label: 'OFFLINE', cls: 'offline' }
  const hasCritical = data.value.expiringIngredients.some(i => daysUntil(i.expiration_date) <= 3)
  const hasWarning = data.value.expiringIngredients.some(i => daysUntil(i.expiration_date) <= 7)
  if (hasCritical) return { label: 'CRITICAL', cls: 'critical' }
  if (hasWarning) return { label: 'WARNING', cls: 'warning' }
  return { label: 'NOMINAL', cls: 'nominal' }
})

const stats = computed(() => {
  if (!data.value) return []
  const s = data.value.stats
  const pctExpiring = s.totalIngredients > 0 ? (s.expiringCount / s.totalIngredients) * 100 : 0
  const pctReady = s.totalRecipes > 0 ? (s.readyCount / s.totalRecipes) * 100 : 0
  return [
    { label: 'Ingredients', value: s.totalIngredients },
    { label: 'Expiring', value: s.expiringCount, color: s.expiringCount > 0 ? 'var(--red)' : 'var(--green)', bar: pctExpiring, barColor: 'var(--red)' },
    { label: 'Recipes', value: s.totalRecipes },
    { label: 'Ready to Cook', value: s.readyCount, color: s.readyCount > 0 ? 'var(--green)' : 'var(--text)', bar: pctReady, barColor: 'var(--green)' },
    { label: 'Total Cooks', value: s.totalCooks },
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

function ledClass(dateStr) {
  const d = daysUntil(dateStr)
  if (d <= 3) return 'led-red'
  if (d <= 7) return 'led-yellow'
  return 'led-green'
}

function countdownClass(dateStr) {
  const d = daysUntil(dateStr)
  if (d <= 3) return 'cd-critical'
  if (d <= 7) return 'cd-warning'
  return 'cd-ok'
}
</script>

<style scoped>
.dashboard {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
}

/* ── HUD HEADER ── */
.hud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--header);
  border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
  background-image:
    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.025) 39px, rgba(255,255,255,0.025) 40px),
    repeating-linear-gradient(0deg,  transparent, transparent 19px, rgba(255,255,255,0.025) 19px, rgba(255,255,255,0.025) 20px);
}
.hud-title {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--accent);
  text-shadow: 0 0 20px rgba(224,160,32,0.45);
}
.hud-date {
  font-size: 0.65rem;
  color: var(--text-faint);
  letter-spacing: 2px;
  margin-top: 3px;
}
.hud-right { text-align: right; }
.hud-summary {
  font-size: 0.65rem;
  color: var(--text-faint);
  letter-spacing: 1px;
  margin-top: 4px;
}

/* ── SYSTEM STATUS ── */
.sys-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 2px;
  font-weight: 700;
}
.sys-status.nominal  { color: var(--green); }
.sys-status.warning  { color: var(--yellow); }
.sys-status.critical { color: var(--red); }
.sys-status.offline  { color: var(--text-faint); }

.sys-led {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.nominal  .sys-led { background: var(--green);  box-shadow: 0 0 6px var(--green);  animation: pulse-green  2.5s ease-in-out infinite; }
.warning  .sys-led { background: var(--yellow); box-shadow: 0 0 6px var(--yellow); animation: pulse-yellow 1.5s ease-in-out infinite; }
.critical .sys-led { background: var(--red);    box-shadow: 0 0 8px var(--red);    animation: pulse-red    0.7s ease-in-out infinite; }
.offline  .sys-led { background: var(--text-faint); }

/* ── STAT ROW ── */
.stat-row { display: flex; }
.stat-block {
  flex: 1;
  padding: 10px 14px;
  border-right: 1px solid var(--border-dim);
}
.stat-block:last-child { border-right: none; }
.stat-label {
  color: var(--text-dim);
  font-size: 0.63rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 4px;
}
.stat-value {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.7rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 7px;
}
.stat-track {
  height: 2px;
  background: var(--border-dim);
}
.stat-fill {
  height: 100%;
  transition: width 0.6s ease;
}

/* ── ROW 2 ── */
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

/* ── EXPIRY ROWS ── */
.expiry-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-bottom: 1px solid var(--border-dim);
}
.expiry-row:nth-child(even) { background: var(--row-alt); }
.expiry-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.expiry-name { color: var(--text-bright); font-weight: 600; font-size: 0.83rem; }
.expiry-qty  { color: var(--text-dim); font-size: 0.72rem; }

/* ── LED DOTS ── */
.led {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.led-green  { background: var(--green);     box-shadow: 0 0 4px var(--green); }
.led-yellow { background: var(--yellow);    box-shadow: 0 0 4px var(--yellow); animation: pulse-yellow 1.5s ease-in-out infinite; }
.led-red    { background: var(--red);       box-shadow: 0 0 6px var(--red);    animation: pulse-red    0.8s ease-in-out infinite; }
.led-pulse  { background: var(--text-faint); animation: pulse-grey 1s ease-in-out infinite; }

/* ── COUNTDOWN ── */
.countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 38px;
  font-family: 'Share Tech Mono', monospace;
}
.cd-num  { font-size: 1.35rem; font-weight: 700; line-height: 1; }
.cd-unit { font-size: 0.52rem; letter-spacing: 1px; color: var(--text-faint); }
.cd-critical .cd-num { color: var(--red);    text-shadow: 0 0 8px rgba(200,48,32,0.6); }
.cd-warning  .cd-num { color: var(--yellow); }
.cd-ok       .cd-num { color: var(--green);  }

/* ── PANEL NOTE ── */
.panel-note {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.68rem;
  color: var(--text-faint);
  letter-spacing: 1px;
}

/* ── RECIPE GRID ── */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  background: var(--border-dim);
  padding: 1px;
}
.recipe-card {
  background: var(--panel-alt);
  text-decoration: none;
  color: inherit;
  border: 1px solid transparent;
  overflow: hidden;
  transition: background 0.1s;
}
.recipe-card:hover { background: #2a2a2a; border-color: var(--border); }

.rc-top-bar { height: 3px; }
.rc-top-bar.ok  { background: var(--green); box-shadow: 0 1px 5px rgba(90,184,48,0.45); }
.rc-top-bar.nok { background: var(--red); }

.rc-icon   { padding: 8px 10px 0; font-size: 1rem; }
.rc-ok  .rc-icon { color: var(--green); }
.rc-nok .rc-icon { color: var(--red); }

.rc-name {
  padding: 4px 10px 2px;
  color: var(--text-bright);
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rc-date {
  padding: 0 10px 4px;
  color: var(--text-faint);
  font-size: 0.67rem;
}
.rc-status {
  padding: 4px 10px 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.rc-status.ok  { color: var(--green); }
.rc-status.nok { color: var(--red); }

/* ── LOADING ── */
.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2rem;
  color: var(--text-faint);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 2px;
}

/* ── MOBILE ── */
@media (max-width: 767px) {
  .hud-header { flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 12px; }
  .hud-right { text-align: left; }
  .hud-title { font-size: 0.9rem; letter-spacing: 2px; }

  .stat-row { flex-wrap: wrap; }
  .stat-block {
    flex: 1 1 50%;
    border-right: 1px solid var(--border-dim);
    border-bottom: 1px solid var(--border-dim);
    min-width: 0;
  }
  .stat-block:nth-child(even) { border-right: none; }
  .stat-block:nth-last-child(-n+2) { border-bottom: none; }
  .stat-value { font-size: 1.35rem; }

  .row-2 { grid-template-columns: 1fr; }

  .recipes-grid { grid-template-columns: repeat(2, 1fr); }
  .rc-name { font-size: 0.78rem; }
}

/* ── ANIMATIONS ── */
@keyframes pulse-green {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--green); }
  50%       { opacity: 0.55; box-shadow: 0 0 2px var(--green); }
}
@keyframes pulse-yellow {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--yellow); }
  50%       { opacity: 0.45; box-shadow: 0 0 2px var(--yellow); }
}
@keyframes pulse-red {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--red); }
  50%       { opacity: 0.35; box-shadow: 0 0 2px var(--red); }
}
@keyframes pulse-grey {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 0.25; }
}

</style>
