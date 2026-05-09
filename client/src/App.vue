<template>
  <div id="layout">
    <nav class="toolbar">
      <div class="toolbar-logo">LetMeCook</div>
      <router-link to="/" class="btn btn-sm" :class="{ 'btn-active': $route.path === '/' }">⌂ Dashboard</router-link>
      <router-link to="/ingredients" class="btn btn-sm" :class="{ 'btn-active': $route.path === '/ingredients' }">⬡ Ingredients</router-link>
      <router-link to="/recipes" class="btn btn-sm" :class="{ 'btn-active': $route.path.startsWith('/recipes') }">⚙ Recipes</router-link>
      <router-link to="/cook-log" class="btn btn-sm" :class="{ 'btn-active': $route.path === '/cook-log' }">📋 Cook Log</router-link>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
#layout { display: flex; flex-direction: column; height: 100vh; }
.toolbar {
  background: var(--header);
  border-bottom: 2px solid var(--border-dim);
  box-shadow: var(--bevel-hi), var(--bevel-lo), 0 2px 6px rgba(0,0,0,0.6);
  display: flex; align-items: center; height: 42px; padding: 0 8px; gap: 2px; flex-shrink: 0;
}
.toolbar-logo {
  color: var(--text);
  font-weight: 700; font-size: 0.92rem;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 0 12px 0 4px; margin-right: 6px; border-right: 1px solid var(--border-dim);
}
.toolbar a { text-decoration: none; }
.main-content { flex: 1; overflow: hidden; }
</style>
