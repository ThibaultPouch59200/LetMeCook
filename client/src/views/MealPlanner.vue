<!-- client/src/views/MealPlanner.vue -->
<template>
  <div class="page">
    <div class="panel-title top-bar">
      <span>Meal Plan</span>
      <div class="week-toggle">
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': !showNextWeek }"
          @click="showNextWeek = false"
        >This week</button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': showNextWeek }"
          @click="showNextWeek = true"
        >Next week</button>
      </div>
    </div>

    <div class="week-container">
      <div v-for="(day, i) in days" :key="i" class="day-cell">
        <div class="day-header" :class="{ today: isToday(i) }">
          <span class="day-name">{{ day.name }}</span>
          <span class="day-date">{{ day.date }}</span>
        </div>
        <div class="day-meals">
          <div v-for="meal in ['lunch', 'dinner']" :key="meal" class="meal-slot">
            <div class="slot-label">{{ meal === 'lunch' ? '🍽' : '🌙' }} {{ meal }}</div>
            <template v-if="getSlot(i, meal)">
              <div class="slot-filled">
                <div class="slot-name">{{ getSlot(i, meal).name }}</div>
                <div class="slot-actions">
                  <router-link :to="`/recipes/${getSlot(i, meal).id}`" class="btn btn-sm">View</router-link>
                  <button class="btn btn-sm" @click="openPicker(i, meal)">Change</button>
                </div>
              </div>
            </template>
            <template v-else>
              <button class="slot-empty btn" @click="openPicker(i, meal)">+ Select</button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <RecipePickerModal
      v-if="picker.open"
      @close="picker.open = false"
      @select="onSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '../api'
import RecipePickerModal from '../components/RecipePickerModal.vue'

const showNextWeek = ref(false)
const plan = ref([])
const picker = ref({ open: false, day: null, mealType: null })

function getWeekStart(offsetWeeks = 0) {
  const today = new Date()
  const jsDay = today.getDay() // 0=Sun, 1=Mon...
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday + offsetWeeks * 7)
  return monday.toISOString().split('T')[0]
}

const weekStart = computed(() => getWeekStart(showNextWeek.value ? 1 : 0))

const days = computed(() => {
  const start = new Date(weekStart.value + 'T00:00:00')
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return { name, date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  })
})

function isToday(dayIndex) {
  if (showNextWeek.value) return false
  // day 0=Mon maps to JS getDay()=1; formula: (dayIndex+1)%7
  return new Date().getDay() === (dayIndex + 1) % 7
}

const slotMap = computed(() => {
  const map = {}
  for (const slot of plan.value) {
    map[`${slot.day}-${slot.mealType}`] = slot.recipe
  }
  return map
})

function getSlot(day, mealType) {
  return slotMap.value[`${day}-${mealType}`]
}

async function load() {
  plan.value = await api.mealPlan.getWeek(weekStart.value)
}

watch(weekStart, load, { immediate: true })

function openPicker(day, mealType) {
  picker.value = { open: true, day, mealType }
}

async function onSelect(recipe) {
  picker.value.open = false
  await api.mealPlan.upsert({
    weekStart: weekStart.value,
    day: picker.value.day,
    mealType: picker.value.mealType,
    recipeId: recipe.id
  })
  await load()
}
</script>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 10px; }
.top-bar {
  background: var(--header-mid);
  border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
  display: flex; align-items: center; justify-content: space-between;
}
.week-toggle { display: flex; gap: 4px; }

/* Desktop: 7-column grid */
.week-container {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  align-items: start;
}
.day-cell {
  background: var(--panel);
  border: 1px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo);
  border-radius: 2px;
  overflow: hidden;
}
.day-header {
  background: var(--header-mid);
  border-bottom: 1px solid var(--border-dim);
  padding: 4px 6px;
  text-align: center;
}
.day-header.today { border-bottom-color: var(--green); }
.day-name { display: block; color: var(--text-bright); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.day-date { display: block; color: var(--text-faint); font-size: 0.65rem; }
.day-header.today .day-name { color: var(--green); }
.day-meals { padding: 5px; display: flex; flex-direction: column; gap: 5px; }

.meal-slot { display: flex; flex-direction: column; gap: 3px; }
.slot-label { font-size: 0.65rem; text-transform: uppercase; color: var(--text-faint); letter-spacing: 0.5px; }
.slot-empty {
  width: 100%; padding: 8px 4px; font-size: 0.75rem; font-style: italic;
  color: var(--text-muted); background: var(--panel-alt);
  border: 1px dashed var(--border-dim); cursor: pointer; border-radius: 2px;
}
.slot-empty:hover { border-color: var(--border); color: var(--text); }
.slot-filled {
  background: var(--panel-alt); border: 1px solid var(--border-dim);
  border-radius: 2px; padding: 5px;
}
.slot-name { color: var(--green); font-size: 0.78rem; font-weight: 600; margin-bottom: 4px; line-height: 1.3; }
.slot-actions { display: flex; gap: 3px; }
.slot-actions .btn { font-size: 0.65rem; padding: 2px 6px; }

/* Mobile: vertical day list, side-by-side meals */
@media (max-width: 767px) {
  .week-container {
    grid-template-columns: 1fr;
  }
  .day-header { text-align: left; display: flex; align-items: center; gap: 8px; padding: 6px 10px; }
  .day-name { display: inline; }
  .day-date { display: inline; }
  .day-meals { flex-direction: row; gap: 6px; }
  .meal-slot { flex: 1; }
}
</style>
