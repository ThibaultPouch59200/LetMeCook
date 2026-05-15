<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal" :class="{ 'large-modal': large }">
      <div class="panel-title">{{ title }}</div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String, large: Boolean })
defineEmits(['close'])
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.78); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: var(--panel); border: 1px solid var(--border-dim); box-shadow: var(--bevel-hi), var(--bevel-lo), 0 8px 32px rgba(0,0,0,0.7); width: 420px; max-height: 88vh; display: flex; flex-direction: column; }
.large-modal { width: 620px; }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; }
.modal-body :deep(label) { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); margin-bottom: -6px; display: block; }
.modal-footer { padding: 10px 16px; background: var(--header-mid); border-top: 1px solid var(--border-dim); display: flex; gap: 6px; justify-content: flex-end; flex-shrink: 0; }

@media (max-width: 767px) {
  .modal { width: calc(100vw - 16px) !important; }
}
</style>
