<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="['base-card', $props.class]">
    <slot></slot>
  </div>
</template>

<style scoped>
.base-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}
</style>
