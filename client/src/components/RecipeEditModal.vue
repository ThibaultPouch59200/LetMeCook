<template>
  <AppModal :title="`Edit Recipe: ${recipe.name}`" :large="true" @close="$emit('close')">
    <template v-if="loaded">
      <label>Name *</label>
      <input v-model="editForm.name" class="input" />
      <div class="three-col">
        <div><label>Prep (min)</label><input v-model.number="editForm.prep_time" type="number" class="input" /></div>
        <div><label>Cook (min)</label><input v-model.number="editForm.cook_time" type="number" class="input" /></div>
        <div><label>Servings</label><input v-model.number="editForm.servings" type="number" class="input" /></div>
      </div>
      <label>Notes</label>
      <textarea v-model="editForm.notes" class="input textarea" rows="2"></textarea>

      <label>Ingredients</label>
      <IngredientEditorList
        v-model="editForm.ingredients"
        :allIngredients="allIngredients"
        @ingredient-created="onIngredientCreated"
      />

      <label>Steps</label>
      <StepEditorList v-model="editForm.steps" />

      <div class="error" v-if="editError">{{ editError }}</div>
    </template>
    <template #footer>
      <button class="btn" @click="$emit('close')">Cancel</button>
      <button class="btn btn-green" @click="saveEdit" :disabled="!loaded">Save</button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import AppModal from './AppModal.vue'
import IngredientEditorList from './IngredientEditorList.vue'
import StepEditorList from './StepEditorList.vue'

const props = defineProps({ recipe: Object })
const emit = defineEmits(['close', 'saved'])

const loaded = ref(false)
const editForm = ref({})
const editError = ref('')
const allIngredients = ref([])

onMounted(async () => {
  allIngredients.value = await api.ingredients.list()
  editForm.value = {
    name: props.recipe.name,
    prep_time: props.recipe.prep_time,
    cook_time: props.recipe.cook_time,
    servings: props.recipe.servings,
    notes: props.recipe.notes || '',
    steps: JSON.parse(JSON.stringify(props.recipe.steps)),
    ingredients: props.recipe.ingredients.map(i => ({
      ingredientId: i.ingredient_id,
      quantity: i.quantity,
      unit: i.unit,
      searchText: i.ingredient_name || ''
    }))
  }
  loaded.value = true
})

function onIngredientCreated(newIng) {
  allIngredients.value = [...allIngredients.value, newIng]
}

async function saveEdit() {
  editError.value = ''
  const steps = editForm.value.steps
    .filter(s => s.text.trim())
    .map(s => ({ text: s.text, substeps: s.substeps.filter(sub => sub.trim()) }))
  const ingredients = editForm.value.ingredients.filter(i => i.ingredientId && i.quantity)
  try {
    await api.recipes.update(props.recipe.id, { ...editForm.value, steps, ingredients })
    emit('saved')
  } catch (e) {
    editError.value = e.message
  }
}
</script>

<style scoped>
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.textarea { resize: vertical; }
.error { color: var(--red); font-size: 0.82rem; }

@media (max-width: 767px) {
  .three-col { grid-template-columns: 1fr !important; }
}
</style>
