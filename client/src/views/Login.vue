<template>
  <div class="login-container">
    <div class="login-panel">
      <h1>Let Me Cook</h1>
      <form @submit.prevent="login">
        <input
          v-model="password"
          type="password"
          placeholder="Enter password"
          autofocus
        />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { apiCall } from '../api'

export default {
  name: 'Login',
  emits: ['authenticated'],
  setup(props, { emit }) {
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const login = async () => {
      error.value = ''
      loading.value = true

      try {
        const response = await apiCall('/auth/login', 'POST', { password: password.value })
        emit('authenticated')
      } catch (err) {
        error.value = err.message || 'Invalid password'
        password.value = ''
      } finally {
        loading.value = false
      }
    }

    return { password, loading, error, login }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

.login-panel {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 300px;
}

.login-panel h1 {
  text-align: center;
  color: var(--accent);
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.login-panel form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-panel input {
  padding: 0.75rem;
  border: 1px solid var(--accent);
  background: #1a1a1a;
  color: #fff;
  border-radius: 4px;
  font-size: 1rem;
}

.login-panel input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(224, 160, 32, 0.1);
}

.login-panel button {
  padding: 0.75rem;
  background: var(--accent);
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.login-panel button:hover:not(:disabled) {
  background: #f0b030;
}

.login-panel button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: var(--red);
  text-align: center;
  margin-top: 1rem;
}
</style>
