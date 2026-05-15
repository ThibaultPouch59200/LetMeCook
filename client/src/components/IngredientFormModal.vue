<template>
  <AppModal :title="editing ? 'Edit Ingredient' : 'Add Ingredient'" @close="$emit('close')">
    <label>Name *</label>
    <input v-model="form.name" class="input" placeholder="e.g. Ground Beef" />
    <div class="two-col">
      <div>
        <label>Quantity *</label>
        <input v-model.number="form.quantity" type="number" class="input" placeholder="500" />
      </div>
      <div>
        <label>Unit *</label>
        <UnitSelect v-model="form.unit" />
      </div>
    </div>
    <label>Category</label>
    <input v-model="form.category" class="input" placeholder="Dairy, Meat, Vegetables..." />
    <label>Expiration Date</label>
    <input v-model="form.expiration_date" type="date" class="input" />
    <div class="error" v-if="error">{{ error }}</div>
    <template #footer>
      <button class="btn" @click="$emit('close')">Cancel</button>
      <button class="btn btn-green" @click="save">{{ editing ? 'Save' : 'Add' }}</button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'
import AppModal from './AppModal.vue'
import UnitSelect from './UnitSelect.vue'

const props = defineProps({ editing: Object })
const emit = defineEmits(['close', 'saved'])

const form = ref({
  name: props.editing?.name || '',
  quantity: props.editing?.quantity || '',
  unit: props.editing?.unit || '',
  category: props.editing?.category || '',
  expiration_date: props.editing?.expiration_date || ''
})
const error = ref('')

async function save() {
  error.value = ''
  try {
    if (props.editing) {
      await api.ingredients.update(props.editing.id, form.value)
    } else {
      await api.ingredients.create(form.value)
    }
    emit('saved')
  } catch (e) {
    error.value = e.message
  }
}
</script>

<style scoped>
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.error { color: var(--red); font-size: 0.82rem; }
</style>
