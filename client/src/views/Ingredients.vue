<template>
  <div class="page">
    <PageHeader title="Ingredients">
      <button class="btn btn-sm btn-green" @click="openAdd">+ Add Ingredient</button>
    </PageHeader>
    <div class="panel ing-list">
      <div class="trow header-row">
        <div class="col-name" style="flex:2">Name</div>
        <div class="col-qty" style="flex:1">Quantity</div>
        <div class="col-cat" style="flex:1">Category</div>
        <div class="col-exp" style="flex:1">Expires</div>
        <div class="col-actions" style="flex:0 0 80px">Actions</div>
      </div>
      <IngredientRow
        v-for="ing in ingredients"
        :key="ing.id"
        :ingredient="ing"
        @edit="openEdit"
        @delete="confirmDelete"
      />
      <div class="trow" v-if="!ingredients.length" style="color:var(--text-muted)">No ingredients yet. Add some!</div>
    </div>

    <IngredientFormModal
      v-if="showForm"
      :editing="editing"
      @close="showForm = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import PageHeader from '../components/PageHeader.vue'
import IngredientRow from '../components/IngredientRow.vue'
import IngredientFormModal from '../components/IngredientFormModal.vue'

const ingredients = ref([])
const showForm = ref(false)
const editing = ref(null)

onMounted(load)

async function load() { ingredients.value = await api.ingredients.list() }

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(ing) {
  editing.value = ing
  showForm.value = true
}

function onSaved() {
  showForm.value = false
  load()
}

async function confirmDelete(ing) {
  if (!confirm(`Delete "${ing.name}"?`)) return
  await api.ingredients.remove(ing.id)
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 0; }
.ing-list { flex: 1; overflow-y: auto; }
.header-row { background: var(--panel-alt); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); cursor: default !important; }

@media (max-width: 767px) {
  .header-row { display: none; }
  .col-cat, .col-exp { display: none !important; }
  .col-actions { flex: 0 0 72px !important; }
  .trow { min-height: 44px; }
}
</style>
