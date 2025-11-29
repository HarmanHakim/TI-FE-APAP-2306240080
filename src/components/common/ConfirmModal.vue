<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    show: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    confirmClass?: string
}>()

const emit = defineEmits<{
    confirm: []
    cancel: []
}>()

const handleConfirm = () => {
    emit('confirm')
}

const handleCancel = () => {
    emit('cancel')
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
                <!-- Backdrop -->
                <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="handleCancel"></div>

                <!-- Modal -->
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
                        <!-- Icon -->
                        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
                            <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <!-- Content -->
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
                            <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3">
                            <button @click="handleCancel"
                                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                                {{ cancelText || 'Cancel' }}
                            </button>
                            <button @click="handleConfirm" :class="confirmClass || 'bg-red-600 hover:bg-red-700'"
                                class="flex-1 px-4 py-2 text-white rounded-lg transition-colors">
                                {{ confirmText || 'Confirm' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
    transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: scale(0.95);
}
</style>
