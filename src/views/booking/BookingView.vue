<script setup lang="ts">
import { useBookingStore } from '@/stores/booking/booking.store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const bookingStore = useBookingStore()

// Filter states
const searchQuery = ref('')
const filterStatus = ref<number | undefined>(undefined)
const showInactive = ref(true)

onMounted(() => bookingStore.fetchAllBookings())

const filteredBookings = computed(() => {
  return bookingStore.bookings.filter(booking => {
    // Universal search
    if (searchQuery.value) {
      const searchLower = searchQuery.value.toLowerCase()
      const matchesSearch =
        booking.id.toLowerCase().includes(searchLower) ||
        booking.flightNumber.toLowerCase().includes(searchLower) ||
        booking.contactEmail.toLowerCase().includes(searchLower) ||
        booking.contactPhone.toLowerCase().includes(searchLower) ||
        booking.originAirportCode.toLowerCase().includes(searchLower) ||
        booking.destinationAirportCode.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Filter by status
    if (filterStatus.value !== undefined && booking.status !== filterStatus.value) {
      return false
    }

    // Filter by inactive/deleted
    if (!showInactive.value && booking.isDeleted) {
      return false
    }

    return true
  })
})

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = undefined
  showInactive.value = true
}

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
      <h1 class="text-3xl font-bold">Flight Bookings</h1>
      <button @click="router.push('/bookings/add')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Create Booking
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-lg shadow mb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by booking ID, flight, contact, or route..."
          class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-6 rounded-lg shadow mb-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Filters</h2>
        <button @click="clearFilters" class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded">
          Clear All Filters
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select v-model="filterStatus" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option :value="undefined">All Status</option>
            <option :value="1">Unpaid</option>
            <option :value="2">Paid</option>
            <option :value="3">Cancelled</option>
            <option :value="4">Rescheduled</option>
          </select>
        </div>
      </div>

      <div class="flex items-center">
        <label class="flex items-center cursor-pointer">
          <input
            v-model="showInactive"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="ml-2 text-sm font-medium text-gray-700">Show Inactive/Deleted Bookings</span>
        </label>
      </div>

      <div class="mt-4 text-sm text-gray-600">
        Showing {{ filteredBookings.length }} of {{ bookingStore.bookings.length }} bookings
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Code</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flight</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passengers</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="filteredBookings.length === 0">
            <td colspan="9" class="px-6 py-8 text-center text-gray-500">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-lg font-medium">No bookings found</p>
                <p class="text-sm mt-1">Try adjusting your filters</p>
              </div>
            </td>
          </tr>
          <tr v-for="booking in filteredBookings" :key="booking.id" :class="{ 'bg-gray-50': booking.isDeleted }">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              {{ booking.id }}
              <span v-if="booking.isDeleted" class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                Deleted
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ booking.flightNumber }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              {{ booking.originAirportCode }} → {{ booking.destinationAirportCode }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ booking.classType }}</td>
            <td class="px-6 py-4 text-sm">
              <div>{{ booking.contactEmail }}</div>
              <div class="text-gray-500 text-xs">{{ booking.contactPhone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">{{ booking.passengerCount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
              ${{ booking.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="getStatusColor(booking.status)" class="font-medium">{{ booking.statusLabel }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button
                @click="router.push(`/bookings/${booking.id}`)"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
