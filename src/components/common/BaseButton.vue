<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  type: 'button',
  disabled: false
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="base-button"
    :class="{ 'base-button-disabled': disabled }"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.base-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.base-button:hover:not(.base-button-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.base-button:active:not(.base-button-disabled) {
  transform: translateY(0);
}

.base-button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
