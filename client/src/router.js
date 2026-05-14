import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Ingredients from './views/Ingredients.vue'
import Recipes from './views/Recipes.vue'
import RecipeDetail from './views/RecipeDetail.vue'
import CookLog from './views/CookLog.vue'
import MealPlanner from './views/MealPlanner.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/ingredients', component: Ingredients },
  { path: '/recipes', component: Recipes },
  { path: '/recipes/:id', component: RecipeDetail },
  { path: '/cook-log', component: CookLog },
  { path: '/meal-plan', component: MealPlanner }
]

export default createRouter({ history: createWebHashHistory(), routes })
