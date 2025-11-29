<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { flightService } from '@/services/flight.service'
import type { FlightReminderDto } from '@/interfaces/flight-reminder.interface'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
    interval?: number
    showForCustomer?: boolean
}>()

const router = useRouter()
const authStore = useAuthStore()
const reminders = ref<FlightReminderDto[]>([])
const loading = ref(false)

const loadReminders = async () => {
    loading.value = true
    try {
        const customerId = props.showForCustomer && authStore.user?.id ? authStore.user.id : undefined
        const response = await flightService.getFlightReminders(props.interval || 3, customerId)
        reminders.value = response.data || []
    } catch (error) {
        console.error('Failed to load flight reminders:', error)
        reminders.value = []
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadReminders()
})

const getStatusColor = (status: number) => {
    const colors: Record<number, string> = {
        1: 'bg-blue-100 text-blue-800',
        2: 'bg-yellow-100 text-yellow-800',
        3: 'bg-green-100 text-green-800',
        4: 'bg-gray-100 text-gray-800',
        5: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

const viewBookings = (flightNumber: string) => {
    router.push(`/bookings?flight=${flightNumber}`)
}

const viewFlightDetail = (flightNumber: string) => {
    router.push(`/flights/${flightNumber}`)
}
</script>

<template>
    <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upcoming Flight Reminders
            </h2>
            <button @click="loadReminders"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>

        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="text-gray-500 mt-2">Loading reminders...</p>
        </div>

        <div v-else-if="reminders.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-600 font-medium">No upcoming flights available.</p>
            <p class="text-gray-500 text-sm mt-1">There are no flights departing in the next {{ interval || 3 }} hours.
            </p>
        </div>

        <div v-else class="overflow-x-auto">
            <div class="flex gap-4 pb-4" style="scroll-snap-type: x mandatory; overflow-x: auto;">
                <div v-for="reminder in reminders" :key="reminder.flightNumber"
                    class="flex-shrink-0 w-80 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    style="scroll-snap-align: start;">

                    <!-- Flight Header -->
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h3 class="font-bold text-lg text-gray-900">{{ reminder.flightNumber }}</h3>
                            <p class="text-sm text-gray-600">{{ reminder.airline }}</p>
                        </div>
                        <span :class="[getStatusColor(reminder.status), 'px-2 py-1 rounded text-xs font-semibold']">
                            {{ reminder.statusLabel }}
                        </span>
                    </div>

                    <!-- Route -->
                    <div class="mb-3">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-semibold text-gray-900">{{ reminder.origin }}</span>
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span class="font-semibold text-gray-900">{{ reminder.destination }}</span>
                        </div>
                    </div>

                    <!-- Departure Time -->
                    <div class="mb-3 bg-gray-50 rounded p-2">
                        <p class="text-xs text-gray-600 mb-1">Departure Time</p>
                        <p class="font-medium text-gray-900">{{ new Date(reminder.departureTime).toLocaleString() }}</p>
                        <p class="text-sm text-blue-600 font-semibold mt-1">
                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ reminder.remainingTime }} remaining
                        </p>
                    </div>

                    <!-- Booking Stats -->
                    <div class="flex gap-2 mb-3">
                        <span
                            class="flex-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium text-center">
                            {{ reminder.totalPaidBookings }} Paid
                        </span>
                        <span
                            class="flex-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-medium text-center">
                            {{ reminder.totalUnpaidBookings }} Unpaid
                        </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button @click="viewFlightDetail(reminder.flightNumber)"
                            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                            Detail
                        </button>
                        <button @click="viewBookings(reminder.flightNumber)"
                            class="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium">
                            View Bookings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar for horizontal scroll */
div[style*="overflow-x: auto"]::-webkit-scrollbar {
    height: 8px;
}

div[style*="overflow-x: auto"]::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

div[style*="overflow-x: auto"]::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
