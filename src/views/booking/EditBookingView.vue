<script setup lang="ts">
import type { ReadSeatDto } from '@/interfaces/seat.interface'
import type { UpdateBookingDto } from '@/interfaces/booking.interface'
import type { CreatePassengerDto, UpdatePassengerDto } from '@/interfaces/passenger.interface'
import { seatService } from '@/services/seat.service'
import { passengerService } from '@/services/passenger.service'
import { useBookingStore } from '@/stores/booking/booking.store'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const bookingStore = useBookingStore()

interface PassengerForm {
  id?: string
  fullName: string
  birthDate: string
  gender: number
  idPassport: string
  seatId: number | null
  originalSeatId?: number | null
}

interface FlightInfo {
  flightNumber: string
  route: string
  departureTime: Date
}

interface ClassInfo {
  classType: string
  price: number
}

const bookingId = ref<string>('')
const flightId = ref<string>('')
const classFlightId = ref<number | null>(null)
const contactEmail = ref('')
const contactPhone = ref('')
const bookingStatus = ref<number>(1)
const passengers = ref<PassengerForm[]>([])
const availableSeats = ref<ReadSeatDto[]>([])
const loading = ref(true)
const flightInfo = ref<FlightInfo | null>(null)
const classInfo = ref<ClassInfo | null>(null)

const totalPrice = computed(() => {
  if (!classInfo.value) return 0
  return classInfo.value.price * passengers.value.length
})

const loadBookingData = async () => {
  const booking = await bookingStore.fetchBookingById(route.params.id as string)
  if (!booking) {
    toast.error('Booking not found')
    router.push('/bookings')
    return
  }

  bookingId.value = booking.id
  flightId.value = booking.flightId
  classFlightId.value = booking.classFlightId
  contactEmail.value = booking.contactEmail
  contactPhone.value = booking.contactPhone
  bookingStatus.value = booking.status

  // Store flight and class info for display
  flightInfo.value = {
    flightNumber: booking.flightNumber,
    route: `${booking.originAirportCode} → ${booking.destinationAirportCode}`,
    departureTime: booking.departureTime
  }
  classInfo.value = {
    classType: booking.classType,
    price: booking.totalPrice / booking.passengerCount
  }

  // Load passengers with full details
  const passengerDetailsPromises = booking.passengers.map(p =>
    passengerService.getPassengerById(p.id)
  )
  const passengerDetailsResponses = await Promise.all(passengerDetailsPromises)

  passengers.value = passengerDetailsResponses.map(response => {
    const pDetail = response.data

    return {
      id: pDetail.id,
      fullName: pDetail.fullName,
      birthDate: pDetail.birthDate instanceof Date
        ? pDetail.birthDate.toISOString().split('T')[0]
        : String(pDetail.birthDate).split('T')[0],
      gender: pDetail.gender,
      idPassport: pDetail.idPassport,
      seatId: null, // Will be fetched from seat mapping
      originalSeatId: null
    }
  })

  // TODO: Fetch seat assignments for passengers
  // For now, seats are not pre-loaded in edit mode

  await loadAvailableSeats()
  loading.value = false
}

const loadAvailableSeats = async () => {
  if (!classFlightId.value) return

  try {
    const response = await seatService.getAvailableSeats(classFlightId.value)

    // Include currently assigned seats in available list
    const currentSeatIds = passengers.value.map(p => p.seatId).filter(id => id !== null)
    const currentSeatsResponse = await Promise.all(
      currentSeatIds.map(id => seatService.getSeatById(id!))
    )

    const currentSeats = currentSeatsResponse.map(r => r.data)
    const availableSeatsData = response.data

    // Combine and deduplicate
    const allSeats = [...currentSeats, ...availableSeatsData]
    const uniqueSeats = allSeats.filter((seat, index, self) =>
      index === self.findIndex(s => s.id === seat.id)
    )

    availableSeats.value = uniqueSeats
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

const removePassenger = async (index: number) => {
  if (passengers.value.length === 1) {
    toast.error('At least one passenger is required')
    return
  }

  const passenger = passengers.value[index]

  // If passenger exists in DB, delete it
  if (passenger.id) {
    try {
      await passengerService.deletePassenger(passenger.id)

      // Release seat if assigned
      if (passenger.seatId) {
        await seatService.releaseSeat(passenger.seatId)
      }
    } catch {
      toast.error('Failed to remove passenger')
      return
    }
  }

  passengers.value.splice(index, 1)
  await loadAvailableSeats()
}

const getAvailableSeatsForPassenger = (currentIndex: number) => {
  const selectedSeatIds = passengers.value
    .map((p, i) => i !== currentIndex ? p.seatId : null)
    .filter(id => id !== null)

  return availableSeats.value.filter(seat => !selectedSeatIds.includes(seat.id))
}

const validateForm = () => {
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
    const passengerIds: string[] = []

    for (const p of passengers.value) {
      let passengerId = p.id

      if (p.id) {
        // Update existing passenger
        const updateData: UpdatePassengerDto = {
          id: p.id,
          fullName: p.fullName,
          birthDate: p.birthDate,
          gender: p.gender,
          idPassport: p.idPassport
        }
        await passengerService.updatePassenger(p.id, updateData)
      } else {
        // Create new passenger
        const createData: CreatePassengerDto = {
          fullName: p.fullName,
          birthDate: p.birthDate,
          gender: p.gender,
          idPassport: p.idPassport
        }
        const response = await passengerService.createPassenger(createData)
        passengerId = response.data.id
      }

      // Handle seat reassignment if seat changed
      if (p.seatId !== p.originalSeatId) {
        // Release old seat if exists
        if (p.originalSeatId) {
          await seatService.releaseSeat(p.originalSeatId)
        }

        // Assign new seat
        if (p.seatId) {
          await seatService.assignSeat(p.seatId, passengerId!)
        }
      }

      passengerIds.push(passengerId!)
    }

    // Update booking
    const updateData: UpdateBookingDto = {
      id: bookingId.value,
      flightId: flightId.value,
      classFlightId: classFlightId.value!,
      contactEmail: contactEmail.value,
      contactPhone: contactPhone.value,
      passengerCount: passengers.value.length,
      status: bookingStatus.value,
      totalPrice: totalPrice.value,
      passengerIds: passengerIds
    }

    await bookingStore.updateBooking(bookingId.value, updateData)
    toast.success('Booking updated successfully!')
    router.push(`/bookings/${bookingId.value}`)
  } catch {
    toast.error('Failed to update booking. Please try again.')
  }
}

onMounted(() => {
  loadBookingData()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Edit Booking</h1>
      <button @click="router.push('/bookings')" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
        Back to Bookings
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading booking data...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Flight Information (Read-only) -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Flight Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
            <p class="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 font-medium">{{ bookingId }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Flight</label>
            <p class="px-4 py-2 bg-gray-100 rounded-lg text-gray-800">{{ flightInfo?.flightNumber }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <p class="px-4 py-2 bg-gray-100 rounded-lg text-gray-800">{{ flightInfo?.route }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <p class="px-4 py-2 bg-gray-100 rounded-lg text-gray-800">{{ classInfo?.classType }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Departure</label>
            <p class="px-4 py-2 bg-gray-100 rounded-lg text-gray-800">
              {{ flightInfo?.departureTime ? new Date(flightInfo.departureTime).toLocaleString() : '-' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price per Seat</label>
            <p class="px-4 py-2 bg-gray-100 rounded-lg text-gray-800">${{ classInfo?.price.toFixed(2) }}</p>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          ℹ️ Flight and class information cannot be changed. To change flight, please cancel and create a new booking.
        </p>
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
            :disabled="passengers.length >= 10"
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
            :key="passenger.id || index"
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

            <h3 class="font-semibold mb-3">
              Passenger {{ index + 1 }}
              <span v-if="passenger.id" class="text-xs text-gray-500 ml-2">(Existing)</span>
              <span v-else class="text-xs text-green-600 ml-2">(New)</span>
            </h3>

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
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <span class="font-medium">{{ classInfo?.classType || '-' }}</span>
          </div>
          <div class="flex justify-between text-gray-700">
            <span>Price per passenger:</span>
            <span class="font-medium">${{ classInfo?.price.toFixed(2) || '0.00' }}</span>
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
          Update Booking
        </button>
      </div>
    </form>
  </div>
</template>
