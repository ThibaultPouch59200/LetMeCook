<template>
  <div class="ing-combo">
    <input
      v-model="localText"
      class="input"
      placeholder="Search ingredient..."
      autocomplete="off"
      @focus="isOpen = true"
      @input="isOpen = true"
      @blur="closeDelayed"
    />
    <div class="ing-dropdown" v-if="isOpen">
      <div
        class="ing-option"
        v-for="opt in filteredIngs"
        :key="opt.id"
        @mousedown.prevent="selectIng(opt)"
      >{{ opt.name }} ({{ opt.unit }})</div>
      <div
        class="ing-option ing-create"
        v-if="localText.trim() && !exactMatch"
        @mousedown.prevent="createIng"
      >+ Create "{{ localText.trim() }}"</div>
      <div class="ing-option ing-empty" v-if="!filteredIngs.length && !localText.trim()">
        Start typing to search
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '../api'

const props = defineProps({
  modelValue: Object,
  allIngredients: Array
})
const emit = defineEmits(['update:modelValue', 'ingredient-created'])

const isOpen = ref(false)
const localText = ref(props.modelValue?.searchText || '')

watch(() => props.modelValue?.searchText, (v) => { localText.value = v || '' })

const filteredIngs = computed(() => {
  const text = localText.value
  if (!text || !text.trim()) return (props.allIngredients || []).slice(0, 20)
  const q = text.toLowerCase()
  return (props.allIngredients || []).filter(i => i.name.toLowerCase().includes(q))
})

const exactMatch = computed(() => {
  const q = localText.value.toLowerCase().trim()
  return (props.allIngredients || []).some(i => i.name.toLowerCase() === q)
})

function closeDelayed() {
  setTimeout(() => { isOpen.value = false }, 150)
}

function selectIng(opt) {
  localText.value = opt.name
  isOpen.value = false
  emit('update:modelValue', {
    ...props.modelValue,
    ingredientId: opt.id,
    searchText: opt.name,
    unit: props.modelValue?.unit || opt.unit
  })
}

async function createIng() {
  const name = localText.value.trim()
  const newIng = await api.ingredients.create({ name, quantity: 0, unit: props.modelValue?.unit || 'pcs' })
  emit('ingredient-created', newIng)
  selectIng(newIng)
}
</script>

<style scoped>
.ing-combo { position: relative; }
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.ing-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 200; background: var(--panel); border: 1px solid var(--border-dim); box-shadow: 0 4px 16px rgba(0,0,0,0.6); max-height: 180px; overflow-y: auto; }
.ing-option { padding: 6px 10px; font-size: 0.85rem; cursor: pointer; color: var(--text); }
.ing-option:hover { background: var(--panel-alt); }
.ing-create { color: var(--green); }
.ing-empty { color: var(--text-faint); cursor: default; }
</style>
