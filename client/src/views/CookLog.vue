<template>
  <div class="page">
    <div class="panel-title top-bar">
      <span>Cook Log</span>
      <span style="color:var(--text-faint);font-size:0.78rem">{{ entries.length }} entries</span>
    </div>
    <div class="panel log-list">
      <div class="trow header-row">
        <div style="flex:3">Recipe</div>
        <div style="flex:1">Date</div>
        <div style="flex:0 0 60px"></div>
      </div>
      <div class="trow" v-for="entry in entries" :key="entry.id" style="cursor:default">
        <div style="flex:3">
          <router-link :to="`/recipes/${entry.recipe_id}`" class="recipe-link">{{ entry.recipe_name }}</router-link>
        </div>
        <div style="flex:1">{{ entry.cooked_at }}</div>
        <div style="flex:0 0 60px">
          <button class="btn btn-sm btn-danger" @click="confirmDelete(entry)">✕</button>
        </div>
      </div>
      <div class="trow" v-if="!entries.length" style="color:var(--text-muted)">No cooks logged yet.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const entries = ref([])
onMounted(load)
async function load() { entries.value = await api.cookLog.list() }

async function confirmDelete(entry) {
  if (!confirm(`Delete cook log entry for "${entry.recipe_name}" on ${entry.cooked_at}?`)) return
  await api.cookLog.remove(entry.id)
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; }
.top-bar { background: var(--header-mid); border: 1px solid var(--border-dim); border-bottom: none; box-shadow: var(--bevel-hi), var(--bevel-lo); }
.log-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }
.recipe-link { color: var(--text-bright); text-decoration: none; font-weight: 600; }
.recipe-link:hover { color: var(--accent); }

@media (max-width: 767px) {
  .header-row { display: none; }
  .trow { min-height: 44px; flex-wrap: wrap; gap: 4px; }
}
</style>
