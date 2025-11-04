<script setup lang="ts">
import type { CreateBookingDto } from '@/interfaces/booking.interface'
import type { CreatePassengerDto } from '@/interfaces/passenger.interface'
import type { ReadSeatDto } from '@/interfaces/seat.interface'
import { passengerService } from '@/services/passenger.service'
import { seatService } from '@/services/seat.service'
import { useBookingStore } from '@/stores/booking/booking.store'
import { useFlightStore } from '@/stores/flight/flight.store'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const bookingStore = useBookingStore()
const flightStore = useFlightStore()

interface PassengerForm {
  fullName: string
  birthDate: string
  gender: number
  idPassport: string
  seatId: number | null
}

const selectedFlightId = ref<string>('')
const selectedClassFlightId = ref<number | null>(null)
const contactEmail = ref('')
const contactPhone = ref('')
const passengers = ref<PassengerForm[]>([
  {
    fullName: '',
    birthDate: '',
    gender: 1,
    idPassport: '',
    seatId: null
  }
])

const availableSeats = ref<ReadSeatDto[]>([])
const loading = ref(true)

const selectedFlight = computed(() => {
  return flightStore.flights.find(f => f.id === selectedFlightId.value)
})

const selectedClass = computed(() => {
  if (!selectedFlight.value || !selectedClassFlightId.value) return null
  return selectedFlight.value.classes.find(c => c.id === selectedClassFlightId.value)
})

const totalPrice = computed(() => {
  if (!selectedClass.value) return 0
  return selectedClass.value.price * passengers.value.length
})

const loadAvailableSeats = async () => {
  if (!selectedClassFlightId.value) {
    availableSeats.value = []
    return
  }

  try {
    const response = await seatService.getAvailableSeats(selectedClassFlightId.value)
    availableSeats.value = response.data
  } catch {
    toast.error('Failed to load available seats')
  }
}

const addPassenger = () => {
  if (passengers.value.length >= 10) {
    toast.error('Maximum 10 passengers allowed')
    return
  }

  passengers.value.push({
    fullName: '',
    birthDate: '',
    gender: 1,
    idPassport: '',
    seatId: null
  })
}

const removePassenger = (index: number) => {
  if (passengers.value.length === 1) {
    toast.error('At least one passenger is required')
    return
  }
  passengers.value.splice(index, 1)
}

const getAvailableSeatsForPassenger = (currentIndex: number) => {
  const selectedSeatIds = passengers.value
    .map((p, i) => i !== currentIndex ? p.seatId : null)
    .filter(id => id !== null)

  return availableSeats.value.filter(seat => !selectedSeatIds.includes(seat.id))
}

const validateForm = () => {
  if (!selectedFlightId.value) {
    toast.error('Please select a flight')
    return false
  }

  if (!selectedClassFlightId.value) {
    toast.error('Please select a class')
    return false
  }

  if (!contactEmail.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value)) {
    toast.error('Please enter a valid email address')
    return false
  }

  if (!contactPhone.value || contactPhone.value.length < 10) {
    toast.error('Please enter a valid phone number (min 10 digits)')
    return false
  }

  for (let i = 0; i < passengers.value.length; i++) {
    const p = passengers.value[i]

    if (!p.fullName || p.fullName.length > 255) {
      toast.error(`Passenger ${i + 1}: Full name is required (max 255 characters)`)
      return false
    }

    if (!p.birthDate) {
      toast.error(`Passenger ${i + 1}: Birth date is required`)
      return false
    }

    if (!p.idPassport || p.idPassport.length > 100) {
      toast.error(`Passenger ${i + 1}: ID/Passport is required (max 100 characters)`)
      return false
    }

    if (!p.seatId) {
      toast.error(`Passenger ${i + 1}: Please select a seat`)
      return false
    }
  }

  // Check for duplicate seats
  const seatIds = passengers.value.map(p => p.seatId)
  const uniqueSeats = new Set(seatIds)
  if (seatIds.length !== uniqueSeats.size) {
    toast.error('Each passenger must have a different seat')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // Step 1: Create all passengers and collect their IDs
    const passengerIds: string[] = []

    for (const p of passengers.value) {
      const passengerData: CreatePassengerDto = {
        fullName: p.fullName,
        birthDate: p.birthDate,
        gender: p.gender,
        idPassport: p.idPassport
      }

      const response = await passengerService.createPassenger(passengerData)
      passengerIds.push(response.data.id)

      // Assign seat to passenger
      if (p.seatId) {
        await seatService.assignSeat(p.seatId, response.data.id)
      }
    }

    // Step 2: Create booking with passenger IDs
    const bookingId = `BK-${Date.now().toString().slice(-8)}`
    const bookingData: CreateBookingDto = {
      id: bookingId,
      flightId: selectedFlightId.value,
      classFlightId: selectedClassFlightId.value!,
      contactEmail: contactEmail.value,
      contactPhone: contactPhone.value,
      passengerCount: passengers.value.length,
      totalPrice: totalPrice.value,
      passengerIds: passengerIds
    }

    await bookingStore.createBooking(bookingData)
    toast.success('Booking created successfully!')
    router.push('/bookings')
  } catch {
    // Error handled by store/services
    toast.error('Failed to create booking. Please try again.')
  }
}

onMounted(async () => {
  await flightStore.fetchAllFlights()

  // Pre-select flight if provided in query
  const flightId = route.query.flightId as string
  if (flightId) {
    selectedFlightId.value = flightId
  }

  loading.value = false
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Create Flight Booking</h1>
      <button @click="router.push('/bookings')" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
        Back to Bookings
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Flight Selection -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Flight Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Flight -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Flight *</label>
            <select
              v-model="selectedFlightId"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Flight</option>
              <option v-for="flight in flightStore.flights" :key="flight.id" :value="flight.id">
                {{ flight.id }} - {{ flight.originAirportCode }} → {{ flight.destinationAirportCode }}
                ({{ new Date(flight.departureTime).toLocaleDateString() }})
              </option>
            </select>
          </div>

          <!-- Class -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Class *</label>
            <select
              v-model="selectedClassFlightId"
              @change="loadAvailableSeats"
              required
              :disabled="!selectedFlightId"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option :value="null">Select Class</option>
              <option
                v-for="cls in selectedFlight?.classes"
                :key="cls.id"
                :value="cls.id"
                :disabled="cls.availableSeats === 0"
              >
                {{ cls.classType }} - ${{ cls.price.toFixed(2) }}
                ({{ cls.availableSeats }} seats available)
              </option>
            </select>
          </div>
        </div>

        <!-- Flight Summary -->
        <div v-if="selectedFlight" class="mt-4 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm font-medium text-blue-900">Selected Flight:</p>
          <p class="text-blue-800">
            {{ selectedFlight.airlineName }} - {{ selectedFlight.airplaneModel }}
          </p>
          <p class="text-sm text-blue-700">
            {{ selectedFlight.originAirportCode }} → {{ selectedFlight.destinationAirportCode }}
            • {{ new Date(selectedFlight.departureTime).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
            <input
              v-model="contactEmail"
              type="email"
              required
              placeholder="example@email.com"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
            <input
              v-model="contactPhone"
              type="tel"
              required
              placeholder="+1234567890"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Passengers -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Passengers ({{ passengers.length }}/10)</h2>
          <button
            type="button"
            @click="addPassenger"
            :disabled="passengers.length >= 10 || !selectedClassFlightId"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Passenger
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(passenger, index) in passengers"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 relative"
          >
            <button
              v-if="passengers.length > 1"
              type="button"
              @click="removePassenger(index)"
              class="absolute top-2 right-2 text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 class="font-semibold mb-3">Passenger {{ index + 1 }}</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Full Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  v-model="passenger.fullName"
                  type="text"
                  required
                  maxlength="255"
                  placeholder="John Doe"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Birth Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Birth Date *</label>
                <input
                  v-model="passenger.birthDate"
                  type="date"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Gender -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  v-model.number="passenger.gender"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="1">Male</option>
                  <option :value="2">Female</option>
                  <option :value="3">Other</option>
                </select>
              </div>

              <!-- ID/Passport -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ID/Passport Number *</label>
                <input
                  v-model="passenger.idPassport"
                  type="text"
                  required
                  maxlength="100"
                  placeholder="A1234567"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Seat Selection -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Seat *</label>
                <select
                  v-model.number="passenger.seatId"
                  required
                  :disabled="!selectedClassFlightId"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option :value="null">Select Seat</option>
                  <option
                    v-for="seat in getAvailableSeatsForPassenger(index)"
                    :key="seat.id"
                    :value="seat.id"
                  >
                    {{ seat.seatNumber }} ({{ seat.classType }})
                  </option>
                </select>
                <p v-if="!selectedClassFlightId" class="text-xs text-gray-500 mt-1">
                  Please select a class first
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Booking Summary</h2>
        <div class="space-y-2">
          <div class="flex justify-between text-gray-700">
            <span>Class:</span>
            <span class="font-medium">{{ selectedClass?.classType || '-' }}</span>
          </div>
          <div class="flex justify-between text-gray-700">
            <span>Price per passenger:</span>
            <span class="font-medium">${{ selectedClass?.price.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="flex justify-between text-gray-700">
            <span>Number of passengers:</span>
            <span class="font-medium">{{ passengers.length }}</span>
          </div>
          <div class="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
            <span>Total Price:</span>
            <span class="text-green-600">${{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex justify-end gap-4">
        <button
          type="button"
          @click="router.push('/bookings')"
          class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Booking
        </button>
      </div>
    </form>
  </div>
</template>
