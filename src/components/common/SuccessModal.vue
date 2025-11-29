<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    show: boolean
    title: string
    message?: string
    details?: Record<string, any>
    actionText?: string
    actionRoute?: string
}>()

const emit = defineEmits<{
    close: []
    action: []
}>()

const handleClose = () => {
    emit('close')
}

const handleAction = () => {
    emit('action')
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
                <!-- Backdrop -->
                <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="handleClose"></div>

                <!-- Modal -->
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
                        <!-- Success Icon -->
                        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <!-- Content -->
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
                            <p v-if="message" class="text-sm text-gray-600 mb-4">{{ message }}</p>

                            <!-- Details -->
                            <div v-if="details" class="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                                <div v-for="(value, key) in details" :key="key"
                                    class="flex justify-between py-1 text-sm">
                                    <span class="text-gray-600 capitalize">{{ key.replace(/([A-Z])/g, ' $1').trim()
                                        }}:</span>
                                    <span class="font-medium text-gray-900">{{ value }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3">
                            <button @click="handleClose"
                                class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                                Close
                            </button>
                            <button v-if="actionText" @click="handleAction"
                                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                {{ actionText }}
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
