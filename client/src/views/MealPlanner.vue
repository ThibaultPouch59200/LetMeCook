<!-- client/src/views/MealPlanner.vue -->
<template>
  <div class="page">
    <PageHeader title="Meal Plan">
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
    </PageHeader>

    <div class="week-container">
      <MealDayCell
        v-for="(day, i) in days"
        :key="i"
        :day="day"
        :dayIndex="i"
        :isToday="isToday(i)"
        :lunch="getSlot(i, 'lunch')"
        :dinner="getSlot(i, 'dinner')"
        @open-picker="({ dayIndex, mealType }) => openPicker(dayIndex, mealType)"
      />
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
import PageHeader from '../components/PageHeader.vue'
import MealDayCell from '../components/MealDayCell.vue'

const showNextWeek = ref(false)
const plan = ref([])
const picker = ref({ open: false, day: null, mealType: null })

function getWeekStart(offsetWeeks = 0) {
  const today = new Date()
  const jsDay = today.getDay()
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
  return slotMap.value[`${day}-${mealType}`] || null
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
.week-toggle { display: flex; gap: 4px; }
.week-container { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; align-items: start; }

@media (max-width: 767px) {
  .week-container { grid-template-columns: 1fr; gap: 6px; }
}
</style>
