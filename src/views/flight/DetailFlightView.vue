<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flight.store'
import { useBookingStore } from '@/stores/booking/booking.store'
import { seatService } from '@/services/seat.service'
import type { ReadFlightDto } from '@/interfaces/flight.interface'
import type { ReadSeatDto } from '@/interfaces/seat.interface'
import type { ReadBookingDto } from '@/interfaces/booking.interface'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const flightStore = useFlightStore()
const bookingStore = useBookingStore()

const flight = ref<ReadFlightDto | null>(null)
const seats = ref<ReadSeatDto[]>([])
const bookings = ref<ReadBookingDto[]>([])
const showSeats = ref(false)
const showBookings = ref(false)
const loading = ref(true)

const getStatusColor = (status: number) => {
  const colors: Record<number, string> = {
    1: 'text-blue-600',
    2: 'text-yellow-600',
    3: 'text-green-600',
    4: 'text-gray-600',
    5: 'text-red-600'
  }
  return colors[status] || 'text-gray-600'
}

const calculateDuration = (departureTime: Date, arrivalTime: Date) => {
  const diff = new Date(arrivalTime).getTime() - new Date(departureTime).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

const loadSeats = async () => {
  if (!flight.value) return

  try {
    // Load seats for all classes of this flight
    const allSeats: ReadSeatDto[] = []
    for (const cls of flight.value.classes) {
      const response = await seatService.getAllSeats({ classFlightId: cls.id })
      allSeats.push(...response.data)
    }
    seats.value = allSeats
  } catch {
    toast.error('Failed to load seats')
  }
}

const loadBookings = async () => {
  if (!flight.value) return

  try {
    await bookingStore.fetchAllBookings()
    // Filter bookings for this flight
    bookings.value = bookingStore.bookings.filter(b => b.flightId === flight.value?.id)
  } catch {
    toast.error('Failed to load bookings')
  }
}

const toggleSeats = async () => {
  showSeats.value = !showSeats.value
  if (showSeats.value && seats.value.length === 0) {
    await loadSeats()
  }
}

const toggleBookings = async () => {
  showBookings.value = !showBookings.value
  if (showBookings.value && bookings.value.length === 0) {
    await loadBookings()
  }
}

const handleCancelFlight = async () => {
  if (!flight.value) return

  if (confirm('Are you sure you want to cancel this flight? This action cannot be undone.')) {
    try {
      await flightStore.cancelFlight(flight.value.id)
      router.push('/flights')
    } catch {
      // Error handled by store
    }
  }
}

onMounted(async () => {
  const flightId = route.params.id as string
  flight.value = await flightStore.fetchFlightById(flightId)
  loading.value = false
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Flight Details</h1>
      <button @click="router.push('/flights')" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
        Back to Flights
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading flight details...</p>
    </div>

    <div v-else-if="flight" class="space-y-6">
      <!-- Flight Summary -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ flight.id }}</h2>
            <p class="text-gray-600">{{ flight.airlineName }} • {{ flight.airplaneModel }}</p>
          </div>
          <span :class="[getStatusColor(flight.status), 'px-4 py-2 rounded-lg bg-gray-50 font-semibold']">
            {{ flight.statusLabel }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Route -->
          <div class="border-l-4 border-blue-500 pl-4">
            <p class="text-sm text-gray-600 mb-1">Route</p>
            <p class="text-xl font-semibold">{{ flight.originAirportCode }} → {{ flight.destinationAirportCode }}</p>
          </div>

          <!-- Departure -->
          <div class="border-l-4 border-green-500 pl-4">
            <p class="text-sm text-gray-600 mb-1">Departure</p>
            <p class="font-semibold">{{ new Date(flight.departureTime).toLocaleDateString() }}</p>
            <p class="text-sm text-gray-600">{{ new Date(flight.departureTime).toLocaleTimeString() }}</p>
          </div>

          <!-- Arrival -->
          <div class="border-l-4 border-purple-500 pl-4">
            <p class="text-sm text-gray-600 mb-1">Arrival</p>
            <p class="font-semibold">{{ new Date(flight.arrivalTime).toLocaleDateString() }}</p>
            <p class="text-sm text-gray-600">{{ new Date(flight.arrivalTime).toLocaleTimeString() }}</p>
          </div>

          <!-- Duration -->
          <div class="border-l-4 border-orange-500 pl-4">
            <p class="text-sm text-gray-600 mb-1">Duration</p>
            <p class="text-lg font-semibold">{{ calculateDuration(flight.departureTime, flight.arrivalTime) }}</p>
          </div>

          <!-- Terminal & Gate -->
          <div class="border-l-4 border-pink-500 pl-4">
            <p class="text-sm text-gray-600 mb-1">Terminal & Gate</p>
            <p class="font-semibold">Terminal {{ flight.terminal || 'N/A' }} • Gate {{ flight.gate || 'N/A' }}</p>
          </div>

          <!-- Baggage -->
          <div class="border-l-4 border-indigo-500 pl-4">
            <p class="text-sm text-gray-600 mb-1">Baggage Allowance</p>
            <p class="font-semibold">{{ flight.baggageAllowance || 0 }} kg</p>
          </div>
        </div>

        <!-- Facilities -->
        <div v-if="flight.facilities" class="mt-6">
          <p class="text-sm text-gray-600 mb-2">Facilities</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(facility, index) in flight.facilities.split(',')"
              :key="index"
              class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {{ facility.trim() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Classes -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-4">Available Classes</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="cls in flight.classes"
            :key="cls.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div class="flex justify-between items-start mb-3">
              <h4 class="font-semibold text-gray-900">{{ cls.classType }}</h4>
              <span
                class="px-2 py-1 text-xs rounded-full"
                :class="cls.availableSeats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ cls.availableSeats > 0 ? 'Available' : 'Full' }}
              </span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Seats:</span>
                <span class="font-medium">{{ cls.availableSeats }} / {{ cls.seatCapacity }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Price:</span>
                <span class="text-lg font-bold text-green-600">
                  ${{ cls.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expandable: Seats -->
      <div class="bg-white rounded-lg shadow">
        <button
          @click="toggleSeats"
          class="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 class="text-xl font-semibold">Seat Map</h3>
          </div>
          <svg
            class="w-6 h-6 transition-transform"
            :class="{ 'rotate-180': showSeats }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-show="showSeats" class="px-6 pb-6">
          <div v-if="seats.length === 0" class="text-center py-8 text-gray-500">
            No seats data available
          </div>
          <div v-else>
            <!-- Group seats by class -->
            <div v-for="cls in flight.classes" :key="cls.id" class="mb-6">
              <h4 class="font-semibold text-gray-900 mb-3">{{ cls.classType }}</h4>
              <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                <div
                  v-for="seat in seats.filter(s => s.classFlightId === cls.id)"
                  :key="seat.id"
                  :class="[
                    'p-2 rounded text-center text-sm font-medium transition-all',
                    seat.isAvailable
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800'
                  ]"
                  :title="seat.isAvailable ? 'Available' : `Occupied by ${seat.passengerName || 'Unknown'}`"
                >
                  {{ seat.seatNumber }}
                </div>
              </div>
            </div>

            <div class="mt-4 flex gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-100 rounded"></div>
                <span>Available</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-100 rounded"></div>
                <span>Occupied</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expandable: Bookings -->
      <div class="bg-white rounded-lg shadow">
        <button
          @click="toggleBookings"
          class="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="text-xl font-semibold">Bookings & Passengers</h3>
          </div>
          <svg
            class="w-6 h-6 transition-transform"
            :class="{ 'rotate-180': showBookings }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-show="showBookings" class="px-6 pb-6">
          <div v-if="bookings.length === 0" class="text-center py-8 text-gray-500">
            No bookings for this flight yet
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Code</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passengers</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="booking in bookings" :key="booking.id">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">{{ booking.id }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">{{ booking.classType }}</td>
                  <td class="px-4 py-3 text-sm">
                    <div>{{ booking.contactEmail }}</div>
                    <div class="text-gray-500">{{ booking.contactPhone }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ booking.passengerCount }} passenger(s)
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 rounded-full text-xs"
                      :class="{
                        'bg-yellow-100 text-yellow-800': booking.status === 1,
                        'bg-green-100 text-green-800': booking.status === 2,
                        'bg-red-100 text-red-800': booking.status === 3,
                        'bg-blue-100 text-blue-800': booking.status === 4
                      }"
                    >
                      {{ booking.statusLabel }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      @click="router.push(`/bookings/${booking.id}`)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white p-6 rounded-lg shadow flex flex-wrap gap-4">
        <button
          @click="router.push(`/bookings/add?flightId=${flight.id}`)"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Book This Flight
        </button>

        <button
          v-if="(flight.status === 1 || flight.status === 2) && !flight.isDeleted"
          @click="router.push(`/flights/${flight.id}/edit`)"
          class="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Flight
        </button>

        <button
          v-if="(flight.status === 1 || flight.status === 2) && !flight.isDeleted"
          @click="handleCancelFlight"
          class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Cancel Flight
        </button>
      </div>
    </div>
  </div>
</template>
