<template>
  <div class="ing-edit-list">
    <div class="ing-edit-row" v-for="(ing, i) in items" :key="i">
      <IngredientSearchDropdown
        style="flex:2"
        :modelValue="ing"
        :allIngredients="allIngredients"
        @update:modelValue="(val) => { items[i] = val; emitUpdate() }"
        @ingredient-created="$emit('ingredient-created', $event)"
      />
      <input
        type="number"
        class="input"
        placeholder="Qty"
        style="flex:1"
        :value="ing.quantity"
        @change="(e) => { items[i] = { ...items[i], quantity: parseFloat(e.target.value) || '' }; emitUpdate() }"
      />
      <UnitSelect
        :modelValue="ing.unit"
        style="flex:1"
        @update:modelValue="(val) => { items[i] = { ...items[i], unit: val }; emitUpdate() }"
      />
      <button class="btn btn-sm btn-danger" @click="removeItem(i)">✕</button>
    </div>
    <button class="btn btn-sm" @click="addItem">+ Add Ingredient</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IngredientSearchDropdown from './IngredientSearchDropdown.vue'
import UnitSelect from './UnitSelect.vue'

const props = defineProps({ modelValue: Array, allIngredients: Array })
const emit = defineEmits(['update:modelValue', 'ingredient-created'])

const items = ref((props.modelValue || []).map(i => ({ ...i })))

function emitUpdate() {
  emit('update:modelValue', [...items.value])
}

function removeItem(i) {
  items.value.splice(i, 1)
  emitUpdate()
}

function addItem() {
  items.value.push({ ingredientId: '', quantity: '', unit: '', searchText: '' })
  emitUpdate()
}
</script>

<style scoped>
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.ing-edit-list { display: flex; flex-direction: column; gap: 5px; }
.ing-edit-row { display: flex; gap: 5px; align-items: center; }

@media (max-width: 767px) {
  .ing-edit-row { flex-wrap: wrap; }
  .ing-edit-row :deep(select) { flex: 1 1 100% !important; }
}
</style>
