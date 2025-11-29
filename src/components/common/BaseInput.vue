<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  modelValue: string
}>(), {
  type: 'text',
  required: false,
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input-label">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :value="modelValue"
      @input="handleInput"
      class="base-input"
    />
  </div>
</template>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.base-input-label {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.base-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.base-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.base-input::placeholder {
  color: #999;
}
</style>
