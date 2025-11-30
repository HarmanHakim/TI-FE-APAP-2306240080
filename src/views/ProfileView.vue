<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const userRole = computed(() => authStore.userRole)

const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
        'SUPERADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
        'FLIGHT_AIRLINE': 'bg-blue-100 text-blue-800 border-blue-200',
        'CUSTOMER': 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
</script>

<template>
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p class="text-gray-600">Manage your account information and preferences</p>
        </div>

        <!-- Profile Card -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Header with gradient -->
            <div class="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

            <!-- Profile Content -->
            <div class="px-8 pb-8">
                <!-- Avatar -->
                <div class="flex items-end -mt-16 mb-6">
                    <div
                        class="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                        <div
                            class="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <span class="text-5xl font-bold text-white">
                                {{ user?.username?.charAt(0).toUpperCase() || 'U' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- User Info -->
                <div class="space-y-6">
                    <!-- Username -->
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-2">Username</label>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p class="text-lg font-semibold text-gray-900">{{ user?.username || 'N/A' }}</p>
                        </div>
                    </div>

                    <!-- Email (if available) -->
                    <div v-if="user?.email">
                        <label class="block text-sm font-medium text-gray-600 mb-2">Email</label>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p class="text-lg text-gray-900">{{ user.email }}</p>
                        </div>
                    </div>

                    <!-- Role -->
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-2">Role</label>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span :class="[
                                'px-4 py-2 rounded-full text-sm font-semibold border',
                                getRoleBadgeColor(userRole!)
                            ]">
                                {{ userRole }}
                            </span>
                        </div>
                    </div>

                    <!-- User ID (if available) -->
                    <div v-if="user?.id">
                        <label class="block text-sm font-medium text-gray-600 mb-2">User ID</label>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <p class="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded">{{ user.id }}</p>
                        </div>
                    </div>

                    <!-- Account Created (if available) -->
                    <div v-if="user?.createdAt">
                        <label class="block text-sm font-medium text-gray-600 mb-2">Member Since</label>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-gray-900">{{ formatDate(user.createdAt) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="mt-8 pt-6 border-t border-gray-200">
                    <div class="flex flex-wrap gap-3">
                        <button
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            disabled>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit Profile (Coming Soon)</span>
                        </button>
                        <button
                            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                            disabled>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <span>Change Password (Coming Soon)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Additional Info Card -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 class="font-semibold text-blue-900 mb-1">Account Information</h3>
                    <p class="text-sm text-blue-800">
                        Your account is active and in good standing. If you need to update your information or have any
                        questions, please contact support.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
