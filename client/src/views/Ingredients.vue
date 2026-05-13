<template>
  <div class="page">
    <div class="panel-title top-bar">
      <span>Ingredients</span>
      <button class="btn btn-sm btn-green" @click="openAdd">+ Add Ingredient</button>
    </div>
    <div class="panel ing-list">
      <div class="trow header-row">
        <div class="col-name" style="flex:2">Name</div>
        <div class="col-qty" style="flex:1">Quantity</div>
        <div class="col-cat" style="flex:1">Category</div>
        <div class="col-exp" style="flex:1">Expires</div>
        <div class="col-actions" style="flex:0 0 80px">Actions</div>
      </div>
      <div class="trow" v-for="ing in ingredients" :key="ing.id" style="cursor:default">
        <div class="col-name" style="flex:2"><span class="trow-name">{{ ing.name }}</span></div>
        <div class="col-qty" style="flex:1">{{ ing.quantity }} {{ ing.unit }}</div>
        <div class="col-cat" style="flex:1">
          <span class="badge badge-grey" v-if="ing.category">{{ ing.category }}</span>
          <span v-else style="color:var(--text-faint)">—</span>
        </div>
        <div class="col-exp" style="flex:1">
          <span v-if="ing.expiration_date" class="badge" :class="expiryBadge(ing.expiration_date)">{{ ing.expiration_date }}</span>
          <span v-else style="color:var(--text-faint)">—</span>
        </div>
        <div class="col-actions" style="flex:0 0 80px;display:flex;gap:4px">
          <button class="btn btn-sm" @click="openEdit(ing)">✎</button>
          <button class="btn btn-sm btn-danger" @click="confirmDelete(ing)">✕</button>
        </div>
      </div>
      <div class="trow" v-if="!ingredients.length" style="color:var(--text-muted)">No ingredients yet. Add some!</div>
    </div>

    <!-- ADD/EDIT MODAL -->
    <div class="overlay" v-if="showForm" @click.self="showForm = false">
      <div class="modal">
        <div class="panel-title">{{ editing ? 'Edit Ingredient' : 'Add Ingredient' }}</div>
        <div class="modal-body">
          <label>Name *</label>
          <input v-model="form.name" class="input" placeholder="e.g. Ground Beef" />
          <div class="two-col">
            <div>
              <label>Quantity *</label>
              <input v-model.number="form.quantity" type="number" class="input" placeholder="500" />
            </div>
            <div>
              <label>Unit *</label>
              <input v-model="form.unit" class="input" placeholder="g, ml, pieces..." />
            </div>
          </div>
          <label>Category</label>
          <input v-model="form.category" class="input" placeholder="Dairy, Meat, Vegetables..." />
          <label>Expiration Date</label>
          <input v-model="form.expiration_date" type="date" class="input" />
          <div class="error" v-if="error">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showForm = false">Cancel</button>
          <button class="btn btn-green" @click="save">{{ editing ? 'Save' : 'Add' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const ingredients = ref([])
const showForm = ref(false)
const editing = ref(null)
const error = ref('')
const form = ref({ name: '', quantity: '', unit: '', category: '', expiration_date: '' })

onMounted(load)

async function load() { ingredients.value = await api.ingredients.list() }

function openAdd() {
  editing.value = null
  form.value = { name: '', quantity: '', unit: '', category: '', expiration_date: '' }
  error.value = ''
  showForm.value = true
}

function openEdit(ing) {
  editing.value = ing
  form.value = { name: ing.name, quantity: ing.quantity, unit: ing.unit, category: ing.category || '', expiration_date: ing.expiration_date || '' }
  error.value = ''
  showForm.value = true
}

async function save() {
  error.value = ''
  try {
    if (editing.value) await api.ingredients.update(editing.value.id, form.value)
    else await api.ingredients.create(form.value)
    showForm.value = false
    await load()
  } catch (e) { error.value = e.message }
}

async function confirmDelete(ing) {
  if (!confirm(`Delete "${ing.name}"?`)) return
  await api.ingredients.remove(ing.id)
  await load()
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
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 0; }
.top-bar { background: var(--header-mid); border: 1px solid var(--border-dim); border-bottom: none; box-shadow: var(--bevel-hi), var(--bevel-lo); }
.ing-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.78); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--panel); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo), 0 8px 32px rgba(0,0,0,0.7); width: 420px; }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.modal-body label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); margin-bottom: -6px; }
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.modal-footer { padding: 10px 16px; background: var(--header-mid); border-top: 1px solid var(--border-dim); display: flex; gap: 6px; justify-content: flex-end; }
.error { color: var(--red); font-size: 0.82rem; }

@media (max-width: 767px) {
  .header-row { display: none; }
  .col-cat, .col-exp { display: none !important; }
  .col-actions { flex: 0 0 72px !important; }
  .trow { min-height: 44px; }
  .modal { width: calc(100vw - 16px) !important; }
  .two-col { grid-template-columns: 1fr 1fr; }
}
</style>
