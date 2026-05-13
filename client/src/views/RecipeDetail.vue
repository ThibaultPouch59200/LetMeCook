<template>
  <div class="detail-layout" v-if="recipe">
    <!-- LEFT PANEL -->
    <div class="panel left-panel">
      <div class="panel-title">
        Recipe Info
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" @click="showEdit = true">✎ Edit</button>
          <button class="btn btn-sm btn-green" @click="showCook = true">🍳 Log Cook</button>
        </div>
      </div>
      <div class="photo-area">
        <div style="font-size:2.5rem;opacity:0.25">🍽</div>
        <div style="color:var(--text-faint);font-size:0.65rem;text-transform:uppercase;letter-spacing:1px;margin-top:4px">No photo</div>
      </div>
      <div class="panel-scroll">
        <div class="meta-section">
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-meta">
            <span>Prep: <b>{{ recipe.prep_time ? recipe.prep_time + ' min' : '—' }}</b></span>
            <span>Cook: <b>{{ recipe.cook_time ? recipe.cook_time + ' min' : '—' }}</b></span>
            <span>Serves: <b>{{ recipe.servings || '—' }}</b></span>
          </div>
        </div>
        <div class="stock-bar" :class="recipe.canCook ? 'ok' : 'missing'">
          <span :style="{ color: recipe.canCook ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '0.82rem' }">
            {{ recipe.canCook ? '✔ All ingredients in stock' : `✘ Missing ${missingCount} ingredient(s)` }}
          </span>
          <button class="btn btn-sm btn-green" @click="showCook = true" v-if="recipe.canCook">🍳 Log Cook</button>
        </div>
        <div class="section-label">Ingredients</div>
        <div class="trow" v-for="ing in recipe.ingredients" :key="ing.id">
          <div>
            <div class="trow-name">{{ ing.ingredient_name }}</div>
            <div class="trow-meta">needs {{ ing.quantity }} {{ ing.unit }}</div>
          </div>
          <div :style="{ color: ing.hasEnough ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '0.82rem' }">
            {{ ing.hasEnough ? '✔' : '✘' }} {{ ing.stock_quantity }} {{ ing.stock_unit }}
          </div>
        </div>
        <div class="trow" v-if="!recipe.ingredients.length" style="color:var(--text-muted)">No ingredients linked.</div>
        <div v-if="recipe.notes">
          <div class="section-label">Notes</div>
          <div style="padding:10px 12px;color:var(--text-dim);font-size:0.85rem;line-height:1.5">{{ recipe.notes }}</div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="panel right-panel">
      <div class="panel-title">
        Steps
        <span style="color:var(--text-faint);font-size:0.75rem">{{ recipe.steps.length }} step{{ recipe.steps.length !== 1 ? 's' : '' }}</span>
      </div>
      <div style="flex:1;overflow-y:auto">
        <StepList :steps="recipe.steps" />
        <div v-if="!recipe.steps.length" style="padding:16px;color:var(--text-muted)">No steps defined. Edit the recipe to add steps.</div>
      </div>
    </div>

    <CookDeductModal v-if="showCook" :recipe="recipe" @close="showCook = false" @logged="onLogged" />

    <!-- EDIT MODAL -->
    <div class="overlay" v-if="showEdit" @click.self="showEdit = false">
      <div class="modal large-modal">
        <div class="panel-title">Edit Recipe: {{ recipe.name }}</div>
        <div class="modal-body">
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
          <div class="ing-edit-list">
            <div class="ing-edit-row" v-for="(ing, i) in editForm.ingredients" :key="i">
              <select v-model="ing.ingredientId" class="input" style="flex:2">
                <option value="">— Select —</option>
                <option v-for="opt in allIngredients" :key="opt.id" :value="opt.id">{{ opt.name }} ({{ opt.unit }})</option>
              </select>
              <input v-model.number="ing.quantity" type="number" class="input" placeholder="Qty" style="flex:1" />
              <input v-model="ing.unit" class="input" placeholder="Unit" style="flex:1" />
              <button class="btn btn-sm btn-danger" @click="editForm.ingredients.splice(i,1)">✕</button>
            </div>
            <button class="btn btn-sm" @click="editForm.ingredients.push({ ingredientId: '', quantity: '', unit: '' })">+ Add Ingredient</button>
          </div>

          <label>Steps</label>
          <div class="steps-edit-list">
            <div class="step-edit-block" v-for="(step, si) in editForm.steps" :key="si">
              <div class="step-edit-row">
                <span style="color:var(--text-dim);font-size:0.82rem;min-width:22px">{{ si + 1 }}.</span>
                <input v-model="step.text" class="input" placeholder="Step description" style="flex:1" />
                <button class="btn btn-sm btn-danger" @click="editForm.steps.splice(si,1)">✕</button>
              </div>
              <div class="substep-edit-list">
                <div class="substep-edit-row" v-for="(sub, subi) in step.substeps" :key="subi">
                  <span style="color:var(--text-faint);padding:0 8px;font-size:0.82rem">↳</span>
                  <input v-model="step.substeps[subi]" class="input" placeholder="Sub-step" style="flex:1" />
                  <button class="btn btn-sm btn-danger" @click="step.substeps.splice(subi,1)">✕</button>
                </div>
                <button class="btn btn-sm" style="margin-left:28px;margin-top:4px" @click="step.substeps.push('')">+ Sub-step</button>
              </div>
            </div>
            <button class="btn btn-sm" @click="editForm.steps.push({ text: '', substeps: [] })">+ Add Step</button>
          </div>

          <div class="error" v-if="editError">{{ editError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showEdit = false">Cancel</button>
          <button class="btn btn-green" @click="saveEdit">Save</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else style="padding:2rem;color:var(--text-muted)">Loading...</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import StepList from '../components/StepList.vue'
import CookDeductModal from '../components/CookDeductModal.vue'

const route = useRoute()
const recipe = ref(null)
const allIngredients = ref([])
const showCook = ref(false)
const showEdit = ref(false)
const editForm = ref({})
const editError = ref('')

const missingCount = computed(() => recipe.value?.ingredients.filter(i => !i.hasEnough).length ?? 0)

onMounted(async () => {
  await load()
  allIngredients.value = await api.ingredients.list()
})

async function load() {
  recipe.value = await api.recipes.get(Number(route.params.id))
}

async function onLogged() {
  showCook.value = false
  await load()
}

watch(showEdit, (v) => {
  if (!v) return
  editError.value = ''
  editForm.value = {
    name: recipe.value.name,
    prep_time: recipe.value.prep_time,
    cook_time: recipe.value.cook_time,
    servings: recipe.value.servings,
    notes: recipe.value.notes || '',
    steps: JSON.parse(JSON.stringify(recipe.value.steps)),
    ingredients: recipe.value.ingredients.map(i => ({
      ingredientId: i.ingredient_id, quantity: i.quantity, unit: i.unit
    }))
  }
})

async function saveEdit() {
  editError.value = ''
  const steps = editForm.value.steps
    .filter(s => s.text.trim())
    .map(s => ({ text: s.text, substeps: s.substeps.filter(sub => sub.trim()) }))
  const ingredients = editForm.value.ingredients.filter(i => i.ingredientId && i.quantity)
  try {
    await api.recipes.update(recipe.value.id, { ...editForm.value, steps, ingredients })
    showEdit.value = false
    await load()
  } catch (e) { editError.value = e.message }
}
</script>

<style scoped>
.detail-layout { display: flex; gap: 8px; padding: 10px; height: 100%; }
.left-panel { width: 310px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; }
.right-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.panel-scroll { overflow-y: auto; flex: 1; }
.photo-area {
  height: 130px; background: #181818; border-bottom: 1px solid var(--border-dim);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; flex-direction: column;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.015) 5px, rgba(255,255,255,0.015) 10px);
}
.meta-section { padding: 10px 12px; border-bottom: 1px solid var(--border-dim); }
.recipe-name { font-size: 1.1rem; font-weight: 700; color: var(--text-bright); margin-bottom: 6px; }
.recipe-meta { display: flex; gap: 14px; flex-wrap: wrap; color: var(--text-dim); font-size: 0.78rem; }
.recipe-meta b { color: var(--text); }
.stock-bar { padding: 7px 12px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; border-bottom: 1px solid var(--border-dim); }
.stock-bar.ok { background: var(--green-bg); border-left: 2px solid var(--green-border); }
.stock-bar.missing { background: var(--red-bg); border-left: 2px solid var(--red-border); }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--panel); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo), 0 8px 32px rgba(0,0,0,0.8); width: 420px; max-height: 88vh; display: flex; flex-direction: column; }
.large-modal { width: 620px; }
.modal-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; }
.modal-body label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); }
.input { background: var(--bg-mid); border: 1px solid var(--border-dim); box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); color: var(--text); font-family: inherit; font-size: 0.88rem; padding: 7px 10px; width: 100%; }
.textarea { resize: vertical; }
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.modal-footer { padding: 10px 14px; background: var(--header-mid); border-top: 1px solid var(--border-dim); display: flex; gap: 6px; justify-content: flex-end; flex-shrink: 0; }
.error { color: var(--red); font-size: 0.82rem; }
.ing-edit-list { display: flex; flex-direction: column; gap: 5px; }
.ing-edit-row { display: flex; gap: 5px; align-items: center; }
.steps-edit-list { display: flex; flex-direction: column; gap: 8px; }
.step-edit-block { background: #1a1a1a; border: 1px solid var(--border-dim); padding: 8px; }
.step-edit-row { display: flex; gap: 6px; align-items: center; margin-bottom: 5px; }
.substep-edit-list { display: flex; flex-direction: column; gap: 4px; }
.substep-edit-row { display: flex; gap: 4px; align-items: center; }

@media (max-width: 767px) {
  .detail-layout {
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    padding: 6px;
    gap: 6px;
  }
  .left-panel {
    width: 100% !important;
    flex-shrink: 0;
    overflow: visible;
    height: auto;
  }
  .panel-scroll { overflow: visible; flex: none; height: auto; }
  .photo-area { height: 80px; }
  .right-panel {
    flex: none;
    height: auto;
    overflow: visible;
    min-height: 200px;
  }
  .right-panel > div { overflow: visible; height: auto; }

  .modal, .large-modal { width: calc(100vw - 16px) !important; max-height: 90vh; }
  .three-col { grid-template-columns: 1fr !important; }
  .ing-edit-row { flex-wrap: wrap; }
  .ing-edit-row select { flex: 1 1 100% !important; }
}
</style>
