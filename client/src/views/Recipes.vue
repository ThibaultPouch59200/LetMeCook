<template>
  <div class="page">
    <PageHeader title="Recipes">
      <button class="btn btn-sm btn-green" @click="openCreate">+ New Recipe</button>
    </PageHeader>
    <div class="panel recipe-list">
      <div class="trow header-row">
        <div class="col-name" style="flex:3">Name</div>
        <div class="col-prep" style="flex:1">Prep</div>
        <div class="col-cook" style="flex:1">Cook</div>
        <div class="col-srv" style="flex:1">Servings</div>
        <div class="col-status" style="flex:1">Status</div>
        <div class="col-del" style="flex:0 0 60px"></div>
      </div>
      <router-link v-for="r in recipes" :key="r.id" :to="`/recipes/${r.id}`" class="trow recipe-row">
        <div class="col-name" style="flex:3"><span class="trow-name">{{ r.name }}</span></div>
        <div class="col-prep" style="flex:1">{{ r.prep_time ? r.prep_time + ' min' : '—' }}</div>
        <div class="col-cook" style="flex:1">{{ r.cook_time ? r.cook_time + ' min' : '—' }}</div>
        <div class="col-srv" style="flex:1">{{ r.servings || '—' }}</div>
        <div class="col-status" style="flex:1"><StockBadge :canCook="r.canCook" :missingCount="r.missingCount" /></div>
        <div class="col-del" style="flex:0 0 60px" @click.prevent="confirmDelete(r)">
          <button class="btn btn-sm btn-danger">✕</button>
        </div>
      </router-link>
      <div class="trow" v-if="!recipes.length" style="color:var(--text-muted)">No recipes yet. Create one!</div>
    </div>

    <AppModal v-if="showCreate" title="New Recipe" @close="showCreate = false">
      <label>Name *</label>
      <input v-model="form.name" class="input" placeholder="e.g. Spaghetti Bolognese" />
      <div class="hint">Add ingredients and steps in the recipe detail after creating.</div>
      <div class="error" v-if="error">{{ error }}</div>
      <template #footer>
        <button class="btn" @click="showCreate = false">Cancel</button>
        <button class="btn btn-green" @click="create">Create &amp; Edit</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import StockBadge from '../components/StockBadge.vue'
import PageHeader from '../components/PageHeader.vue'
import AppModal from '../components/AppModal.vue'

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
.recipe-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }
.recipe-row { text-decoration: none; color: inherit; }
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.hint { color: var(--text-faint); font-size: 0.78rem; }
.error { color: var(--red); font-size: 0.82rem; }

@media (max-width: 767px) {
  .header-row { display: none; }
  .col-prep, .col-cook, .col-srv { display: none !important; }
  .col-name { flex: 1 !important; }
  .col-del { flex: 0 0 52px !important; }
  .trow { min-height: 44px; }
}
</style>
