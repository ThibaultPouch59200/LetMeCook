<template>
  <div class="page">
    <div class="panel-title top-bar">
      <span>Recipes</span>
      <button class="btn btn-sm btn-green" @click="openCreate">+ New Recipe</button>
    </div>
    <div class="panel recipe-list">
      <div class="trow header-row">
        <div style="flex:3">Name</div>
        <div style="flex:1">Prep</div>
        <div style="flex:1">Cook</div>
        <div style="flex:1">Servings</div>
        <div style="flex:1">Status</div>
        <div style="flex:0 0 60px"></div>
      </div>
      <router-link v-for="r in recipes" :key="r.id" :to="`/recipes/${r.id}`" class="trow recipe-row">
        <div style="flex:3"><span class="trow-name">{{ r.name }}</span></div>
        <div style="flex:1">{{ r.prep_time ? r.prep_time + ' min' : '—' }}</div>
        <div style="flex:1">{{ r.cook_time ? r.cook_time + ' min' : '—' }}</div>
        <div style="flex:1">{{ r.servings || '—' }}</div>
        <div style="flex:1"><StockBadge :canCook="r.canCook" :missingCount="r.missingCount" /></div>
        <div style="flex:0 0 60px" @click.prevent="confirmDelete(r)">
          <button class="btn btn-sm btn-danger">✕</button>
        </div>
      </router-link>
      <div class="trow" v-if="!recipes.length" style="color:var(--text-muted)">No recipes yet. Create one!</div>
    </div>

    <div class="overlay" v-if="showCreate" @click.self="showCreate = false">
      <div class="modal">
        <div class="panel-title">New Recipe</div>
        <div class="modal-body">
          <label>Name *</label>
          <input v-model="form.name" class="input" placeholder="e.g. Spaghetti Bolognese" />
          <div class="hint">Add ingredients and steps in the recipe detail after creating.</div>
          <div class="error" v-if="error">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showCreate = false">Cancel</button>
          <button class="btn btn-green" @click="create">Create & Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import StockBadge from '../components/StockBadge.vue'

const router = useRouter()
const recipes = ref([])
const showCreate = ref(false)
const form = ref({ name: '' })
const error = ref('')

onMounted(load)
async function load() { recipes.value = await api.recipes.list() }

function openCreate() { form.value = { name: '' }; error.value = ''; showCreate.value = true }

async function create() {
  error.value = ''
  try {
    const recipe = await api.recipes.create({ name: form.value.name, steps: [] })
    showCreate.value = false
    router.push(`/recipes/${recipe.id}`)
  } catch (e) { error.value = e.message }
}

async function confirmDelete(r) {
  if (!confirm(`Delete recipe "${r.name}"?`)) return
  await api.recipes.remove(r.id)
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; }
.top-bar { background: var(--header-mid); border: 1px solid var(--border-dim); border-bottom: none; box-shadow: var(--bevel-hi), var(--bevel-lo); }
.recipe-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }
.recipe-row { text-decoration: none; color: inherit; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.78); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--panel); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo), 0 8px 32px rgba(0,0,0,0.7); width: 400px; }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.modal-body label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); margin-bottom: -6px; }
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.hint { color: var(--text-faint); font-size: 0.78rem; }
.modal-footer { padding: 10px 16px; background: var(--header-mid); border-top: 1px solid var(--border-dim); display: flex; gap: 6px; justify-content: flex-end; }
.error { color: var(--red); font-size: 0.82rem; }
</style>
