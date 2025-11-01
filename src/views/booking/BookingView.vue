<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking/booking.store'

const router = useRouter()
const bookingStore = useBookingStore()

onMounted(() => bookingStore.fetchAllBookings())

const getStatusColor = (status: number) => {
  const colors: Record<number, string> = {
    1: 'text-yellow-600',
    2: 'text-green-600',
    3: 'text-red-600',
    4: 'text-blue-600'
  }
  return colors[status] || 'text-gray-600'
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Bookings</h1>
      <button @click="router.push('/bookings/add')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Create Booking
      </button>
    </div>

    <div class="bg-white rounded shadow overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flight</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passengers</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="booking in bookingStore.bookings" :key="booking.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ booking.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              {{ booking.flightNumber }}<br/>
              <span class="text-xs text-gray-500">
                {{ booking.originAirportCode }} → {{ booking.destinationAirportCode }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ booking.contactEmail }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ booking.passengerCount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">${{ booking.totalPrice.toFixed(2) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="getStatusColor(booking.status)">{{ booking.statusLabel }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button @click="router.push(`/bookings/${booking.id}`)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
