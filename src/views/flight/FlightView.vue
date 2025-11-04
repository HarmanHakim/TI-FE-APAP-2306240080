<script setup lang="ts">
import { useAirlineStore } from '@/stores/airline/airline.store'
import { useFlightStore } from '@/stores/flight/flight.store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const flightStore = useFlightStore()
const airlineStore = useAirlineStore()

// Filter states
const searchOrigin = ref('')
const searchDestination = ref('')
const universalSearch = ref('')
const filterAirlineId = ref<string>('')
const filterStatus = ref<number | undefined>(undefined)
const showInactive = ref(true)

// Accordion state
const expandedFlights = ref<Set<string>>(new Set())

// Booking mode state
const bookingMode = ref<'one-way' | 'two-way'>('one-way')
const selectedDepartureFlight = ref<string | null>(null)
const selectedReturnFlight = ref<string | null>(null)

const toggleFlight = (flightId: string) => {
  if (expandedFlights.value.has(flightId)) {
    expandedFlights.value.delete(flightId)
  } else {
    expandedFlights.value.add(flightId)
  }
}

const isExpanded = (flightId: string) => {
  return expandedFlights.value.has(flightId)
}

const setBookingMode = (mode: 'one-way' | 'two-way') => {
  bookingMode.value = mode
  selectedDepartureFlight.value = null
  selectedReturnFlight.value = null
}

const selectFlightForBooking = (flightId: string) => {
  if (bookingMode.value === 'one-way') {
    router.push(`/bookings/add?flightId=${flightId}`)
  } else {
    // Two-way mode
    if (!selectedDepartureFlight.value) {
      selectedDepartureFlight.value = flightId
      toast.success('Departure flight selected. Now select your return flight.')
    } else if (!selectedReturnFlight.value && flightId !== selectedDepartureFlight.value) {
      selectedReturnFlight.value = flightId
      toast.success('Return flight selected!')
    } else {
      toast.error('Please select a different flight for return.')
    }
  }
}

const proceedToTwoWayBooking = () => {
  if (selectedDepartureFlight.value && selectedReturnFlight.value) {
    router.push(`/bookings/add?departureFlightId=${selectedDepartureFlight.value}&returnFlightId=${selectedReturnFlight.value}`)
  }
}

const calculateDuration = (departureTime: Date, arrivalTime: Date) => {
  const diff = new Date(arrivalTime).getTime() - new Date(departureTime).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

onMounted(async () => {
  await flightStore.fetchAllFlights()
  await airlineStore.fetchAllAirlines()
})

const filteredFlights = computed(() => {
  return flightStore.flights.filter(f => {
    // Universal search - searches across all columns
    if (universalSearch.value) {
      const searchLower = universalSearch.value.toLowerCase()
      const matchesUniversal =
        f.id.toLowerCase().includes(searchLower) ||
        f.originAirportCode.toLowerCase().includes(searchLower) ||
        f.destinationAirportCode.toLowerCase().includes(searchLower) ||
        f.airlineName.toLowerCase().includes(searchLower) ||
        f.airplaneModel.toLowerCase().includes(searchLower) ||
        f.statusLabel.toLowerCase().includes(searchLower) ||
        new Date(f.departureTime).toLocaleString().toLowerCase().includes(searchLower)

      if (!matchesUniversal) return false
    }

    // Filter by origin
    const matchOrigin = !searchOrigin.value || f.originAirportCode.toLowerCase().includes(searchOrigin.value.toLowerCase())
    if (!matchOrigin) return false

    // Filter by destination
    const matchDest = !searchDestination.value || f.destinationAirportCode.toLowerCase().includes(searchDestination.value.toLowerCase())
    if (!matchDest) return false

    // Filter by airline
    if (filterAirlineId.value && f.airlineId !== filterAirlineId.value) {
      return false
    }

    // Filter by status
    if (filterStatus.value !== undefined && f.status !== filterStatus.value) {
      return false
    }

    // Filter by inactive status
    if (!showInactive.value && f.isDeleted) {
      return false
    }

    return true
  })
})

const clearFilters = () => {
  searchOrigin.value = ''
  searchDestination.value = ''
  universalSearch.value = ''
  filterAirlineId.value = ''
  filterStatus.value = undefined
  showInactive.value = true
}

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

const handleDeleteFlight = async (flightId: string) => {
  if (confirm('Are you sure you want to cancel this flight? This action cannot be undone.')) {
    try {
      await flightStore.cancelFlight(flightId)
    } catch {
      // Error handled by store
    }
  }
}

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Flights</h1>
      <button @click="router.push('/flights/add')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Create Flight
      </button>
    </div>

    <!-- Booking Mode Selection -->
    <div class="bg-white p-4 rounded-lg shadow mb-4">
      <div class="flex items-center justify-between">
        <div class="flex gap-3">
          <button
            @click="setBookingMode('one-way')"
            :class="[
              'px-6 py-2 rounded-lg font-medium transition-all',
              bookingMode === 'one-way'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            One-Way (Sekali Jalan)
          </button>
          <button
            @click="setBookingMode('two-way')"
            :class="[
              'px-6 py-2 rounded-lg font-medium transition-all',
              bookingMode === 'two-way'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Two-Way (Pulang Pergi)
          </button>
        </div>

        <!-- Two-Way Selection Status -->
        <div v-if="bookingMode === 'two-way'" class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Departure:</span>
            <span :class="selectedDepartureFlight ? 'text-green-600 font-semibold' : 'text-gray-400'">
              {{ selectedDepartureFlight || 'Not selected' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Return:</span>
            <span :class="selectedReturnFlight ? 'text-green-600 font-semibold' : 'text-gray-400'">
              {{ selectedReturnFlight || 'Not selected' }}
            </span>
          </div>
          <button
            v-if="selectedDepartureFlight && selectedReturnFlight"
            @click="proceedToTwoWayBooking"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Proceed to Booking
          </button>
        </div>
      </div>
    </div>

    <!-- Universal Search Bar -->
    <div class="bg-white p-4 rounded-lg shadow mb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input v-model="universalSearch" type="text"
          placeholder="Search across all fields (ID, Origin, Destination, Airline, Status, etc.)..."
          class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <button v-if="universalSearch" @click="universalSearch = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Origin</label>
          <input v-model="searchOrigin" placeholder="Search origin..." class="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Destination</label>
          <input v-model="searchDestination" placeholder="Search destination..."
            class="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Airline</label>
          <select v-model="filterAirlineId" class="w-full px-4 py-2 border rounded-lg">
            <option value="">All Airlines</option>
            <option v-for="airline in airlineStore.airlines" :key="airline.id" :value="airline.id">
              {{ airline.name }} ({{ airline.id }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select v-model="filterStatus" class="w-full px-4 py-2 border rounded-lg">
            <option :value="undefined">All Status</option>
            <option :value="1">Scheduled</option>
            <option :value="2">Delayed</option>
            <option :value="3">Departed</option>
            <option :value="4">Arrived</option>
            <option :value="5">Cancelled</option>
          </select>
        </div>
      </div>

      <div class="flex items-center">
        <label class="flex items-center cursor-pointer">
          <input v-model="showInactive" type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <span class="ml-2 text-sm font-medium text-gray-700">Show Inactive/Deleted Flights</span>
        </label>
      </div>

      <div class="mt-4 text-sm text-gray-600">
        Showing {{ filteredFlights.length }} of {{ flightStore.flights.length }} flights
      </div>
    </div>

    <!-- Accordion Flight List -->
    <div class="space-y-3">
      <!-- Empty State -->
      <div v-if="filteredFlights.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <div class="flex flex-col items-center">
          <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <p class="text-xl font-medium text-gray-700">No flights found</p>
          <p class="text-sm text-gray-500 mt-2">Try adjusting your filters or clear all filters to see results</p>
        </div>
      </div>

      <!-- Flight Accordion Items -->
      <div v-for="flight in filteredFlights" :key="flight.id" class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Flight Header (Always Visible) -->
        <div
          class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          :class="{
            'bg-blue-50 border-2 border-blue-400': bookingMode === 'two-way' && (selectedDepartureFlight === flight.id || selectedReturnFlight === flight.id)
          }"
          @click="toggleFlight(flight.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
              <!-- Flight ID & Status -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Flight ID</p>
                <p class="font-semibold text-gray-900">{{ flight.id }}</p>
                <span v-if="flight.isDeleted" class="mt-1 inline-block px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                  Deleted
                </span>
                <span v-if="selectedDepartureFlight === flight.id" class="mt-1 inline-block px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                  Departure
                </span>
                <span v-if="selectedReturnFlight === flight.id" class="mt-1 inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                  Return
                </span>
              </div>

              <!-- Route -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Route</p>
                <p class="font-semibold text-gray-900">
                  {{ flight.originAirportCode }} → {{ flight.destinationAirportCode }}
                </p>
              </div>

              <!-- Airline -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Airline</p>
                <p class="font-medium text-gray-900">{{ flight.airlineName }}</p>
                <p class="text-xs text-gray-600">{{ flight.airplaneModel }}</p>
              </div>

              <!-- Departure -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Departure</p>
                <p class="font-medium text-gray-900">
                  {{ new Date(flight.departureTime).toLocaleDateString() }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ new Date(flight.departureTime).toLocaleTimeString() }}
                </p>
              </div>

              <!-- Duration -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Duration</p>
                <p class="font-semibold text-blue-600">
                  {{ calculateDuration(flight.departureTime, flight.arrivalTime) }}
                </p>
              </div>

              <!-- Status -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Status</p>
                <span :class="[getStatusColor(flight.status), 'font-semibold text-sm']">
                  {{ flight.statusLabel }}
                </span>
              </div>
            </div>

            <!-- Expand/Collapse Icon -->
            <div class="ml-4">
              <svg
                class="w-6 h-6 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': isExpanded(flight.id) }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Expanded Details -->
        <div v-show="isExpanded(flight.id)" class="border-t border-gray-200 bg-gray-50 p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Flight Details -->
            <div class="bg-white p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Flight Details
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Airplane:</span>
                  <span class="font-medium text-gray-900">{{ flight.airplaneModel }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Airplane ID:</span>
                  <span class="font-medium text-gray-900">{{ flight.airplaneId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Terminal:</span>
                  <span class="font-medium text-gray-900">{{ flight.terminal || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Gate:</span>
                  <span class="font-medium text-gray-900">{{ flight.gate || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Baggage Allowance:</span>
                  <span class="font-medium text-gray-900">{{ flight.baggageAllowance || 'N/A' }} kg</span>
                </div>
              </div>
            </div>

            <!-- Schedule -->
            <div class="bg-white p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Schedule
              </h3>
              <div class="space-y-3 text-sm">
                <div>
                  <p class="text-gray-600 mb-1">Departure</p>
                  <p class="font-medium text-gray-900">{{ new Date(flight.departureTime).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Arrival</p>
                  <p class="font-medium text-gray-900">{{ new Date(flight.arrivalTime).toLocaleString() }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Duration</p>
                  <p class="font-medium text-gray-900">
                    {{ Math.floor((new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime()) / (1000 * 60 * 60)) }}h
                    {{ Math.floor(((new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime()) % (1000 * 60 * 60)) / (1000 * 60)) }}m
                  </p>
                </div>
              </div>
            </div>

            <!-- Facilities -->
            <div class="bg-white p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Facilities
              </h3>
              <div v-if="flight.facilities" class="flex flex-wrap gap-2">
                <span
                  v-for="(facility, index) in flight.facilities.split(',')"
                  :key="index"
                  class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  {{ facility.trim() }}
                </span>
              </div>
              <p v-else class="text-sm text-gray-500 italic">No facilities available</p>
            </div>
          </div>

          <!-- Classes Section -->
          <div class="mt-6 bg-white p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Available Classes
            </h3>
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

          <!-- Actions -->
          <div class="mt-6 flex flex-wrap gap-3">
            <button
              @click.stop="router.push(`/flights/${flight.id}`)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
            <button
              v-if="flight.status <= 2 && !flight.isDeleted"
              @click.stop="router.push(`/flights/${flight.id}/edit`)"
              class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Flight
            </button>
            <button
              v-if="(flight.status === 1 || flight.status === 2) && !flight.isDeleted"
              @click.stop="handleDeleteFlight(flight.id)"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Cancel Flight
            </button>
            <button
              @click.stop="selectFlightForBooking(flight.id)"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              {{ bookingMode === 'two-way' ? 'Select for Booking' : 'Book Flight' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
