<script setup lang="ts">
import type { CreateFlightDto } from '@/interfaces/flight.interface'
import { useAirlineStore } from '@/stores/airline/airline.store'
import { useAirplaneStore } from '@/stores/airplane/airplane.store'
import { useFlightStore } from '@/stores/flight/flight.store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const flightStore = useFlightStore()
const airlineStore = useAirlineStore()
const airplaneStore = useAirplaneStore()

// Form data
const formData = ref<CreateFlightDto>({
  id: '',
  airlineId: '',
  airplaneId: '',
  originAirportCode: '',
  destinationAirportCode: '',
  departureTime: '',
  arrivalTime: '',
  terminal: '',
  gate: '',
  baggageAllowance: 20,
  facilities: ''
})

// Class configuration
interface ClassConfig {
  classType: string
  seatCapacity: number
  price: number
}

const classes = ref<ClassConfig[]>([
  { classType: 'Economy', seatCapacity: 0, price: 0 }
])

const availableAirplanes = computed(() => {
  if (!formData.value.airlineId) return []
  return airplaneStore.airplanes.filter(
    plane => plane.airlineId === formData.value.airlineId && !plane.isDeleted
  )
})

const selectedAirplane = computed(() => {
  if (!formData.value.airplaneId) return null
  return airplaneStore.airplanes.find(plane => plane.id === formData.value.airplaneId)
})

const totalClassSeats = computed(() => {
  return classes.value.reduce((sum, cls) => sum + (cls.seatCapacity || 0), 0)
})

const remainingSeats = computed(() => {
  if (!selectedAirplane.value) return 0
  return selectedAirplane.value.seatCapacity - totalClassSeats.value
})

const isSeatCapacityValid = computed(() => {
  if (!selectedAirplane.value) return true
  return totalClassSeats.value <= selectedAirplane.value.seatCapacity
})

onMounted(async () => {
  await airlineStore.fetchAllAirlines()
  await airplaneStore.fetchAllAirplanes()

  // Generate unique flight ID
  generateFlightId()
})

const generateFlightId = () => {
  const timestamp = Date.now().toString().slice(-6)
  formData.value.id = `FL-${timestamp}`
}

const addClass = () => {
  classes.value.push({ classType: 'Business', seatCapacity: 0, price: 0 })
}

const removeClass = (index: number) => {
  if (classes.value.length > 1) {
    classes.value.splice(index, 1)
  } else {
    toast.error('At least one class is required')
  }
}

const validateForm = () => {
  if (!formData.value.airlineId) {
    toast.error('Please select an airline')
    return false
  }
  if (!formData.value.airplaneId) {
    toast.error('Please select an airplane')
    return false
  }
  if (!formData.value.originAirportCode || formData.value.originAirportCode.length > 10) {
    toast.error('Origin airport code is required (max 10 characters)')
    return false
  }
  if (!formData.value.destinationAirportCode || formData.value.destinationAirportCode.length > 10) {
    toast.error('Destination airport code is required (max 10 characters)')
    return false
  }
  if (!formData.value.departureTime) {
    toast.error('Departure time is required')
    return false
  }
  if (!formData.value.arrivalTime) {
    toast.error('Arrival time is required')
    return false
  }

  const departure = new Date(formData.value.departureTime)
  const arrival = new Date(formData.value.arrivalTime)
  if (arrival <= departure) {
    toast.error('Arrival time must be after departure time')
    return false
  }

  // Validate classes
  for (const cls of classes.value) {
    if (!cls.classType || cls.classType.length > 50) {
      toast.error('Class type is required (max 50 characters)')
      return false
    }
    if (cls.seatCapacity < 1) {
      toast.error('Seat capacity must be at least 1')
      return false
    }
    if (cls.price < 0) {
      toast.error('Price must be non-negative')
      return false
    }
  }

  // Validate total seat capacity doesn't exceed airplane capacity
  if (!isSeatCapacityValid.value) {
    const airplaneCapacity = selectedAirplane.value?.seatCapacity || 0
    toast.error(
      `Total class seats (${totalClassSeats.value}) exceeds airplane capacity (${airplaneCapacity}). ` +
      `Please reduce seat allocation.`
    )
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // Create flight with classes
    await flightStore.createFlight(formData.value, classes.value)
    router.push('/flights')
  } catch {
    // Error handled by store
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Create New Flight</h1>
      <button @click="router.push('/flights')" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
        Back to Flights
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Flight Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Flight Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Flight ID -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Flight ID</label>
            <input
              v-model="formData.id"
              type="text"
              readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <!-- Airline -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Airline *</label>
            <select
              v-model="formData.airlineId"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Airline</option>
              <option v-for="airline in airlineStore.airlines" :key="airline.id" :value="airline.id">
                {{ airline.name }} ({{ airline.id }})
              </option>
            </select>
          </div>

          <!-- Airplane -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Airplane *</label>
            <select
              v-model="formData.airplaneId"
              required
              :disabled="!formData.airlineId"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Airplane</option>
              <option v-for="airplane in availableAirplanes" :key="airplane.id" :value="airplane.id">
                {{ airplane.model }} ({{ airplane.id }}) - {{ airplane.seatCapacity }} seats
              </option>
            </select>
          </div>

          <!-- Origin Airport -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Origin Airport Code *</label>
            <input
              v-model="formData.originAirportCode"
              type="text"
              required
              maxlength="10"
              placeholder="e.g., CGK, DPS"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Destination Airport -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Destination Airport Code *</label>
            <input
              v-model="formData.destinationAirportCode"
              type="text"
              required
              maxlength="10"
              placeholder="e.g., SUB, JOG"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Departure Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Departure Time *</label>
            <input
              v-model="formData.departureTime"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Arrival Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Arrival Time *</label>
            <input
              v-model="formData.arrivalTime"
              type="datetime-local"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Terminal -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Terminal</label>
            <input
              v-model="formData.terminal"
              type="text"
              maxlength="50"
              placeholder="e.g., 1A, 2B"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Gate -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Gate</label>
            <input
              v-model="formData.gate"
              type="text"
              maxlength="50"
              placeholder="e.g., A1, B5"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Baggage Allowance -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Baggage Allowance (kg)</label>
            <input
              v-model.number="formData.baggageAllowance"
              type="number"
              min="0"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Facilities -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Facilities (comma-separated)</label>
          <textarea
            v-model="formData.facilities"
            rows="3"
            placeholder="e.g., WiFi, In-flight Entertainment, Meal, Blanket, Pillow"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>

      <!-- Class Configuration -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Class Configuration</h2>
          <button
            type="button"
            @click="addClass"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Class
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(cls, index) in classes"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 relative"
          >
            <button
              v-if="classes.length > 1"
              type="button"
              @click="removeClass(index)"
              class="absolute top-2 right-2 text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Class Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Class Type *</label>
                <select
                  v-model="cls.classType"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class</option>
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>

              <!-- Seat Capacity -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Seat Capacity *</label>
                <input
                  v-model.number="cls.seatCapacity"
                  type="number"
                  required
                  min="1"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
                <input
                  v-model.number="cls.price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <p class="text-sm text-gray-500 mt-4">
          * Note: Total seat capacity across all classes should not exceed airplane capacity
        </p>

        <!-- Seat Capacity Summary -->
        <div v-if="selectedAirplane" class="mt-4 p-4 rounded-lg border" :class="[
          isSeatCapacityValid ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
        ]">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium" :class="isSeatCapacityValid ? 'text-green-800' : 'text-red-800'">
                Seat Capacity Summary
              </p>
              <p class="text-sm mt-1" :class="isSeatCapacityValid ? 'text-green-700' : 'text-red-700'">
                Total class seats: <span class="font-semibold">{{ totalClassSeats }}</span> /
                Airplane capacity: <span class="font-semibold">{{ selectedAirplane.seatCapacity }}</span>
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium" :class="isSeatCapacityValid ? 'text-green-700' : 'text-red-700'">
                {{ isSeatCapacityValid ? 'Remaining' : 'Exceeded by' }}:
              </p>
              <p class="text-2xl font-bold" :class="isSeatCapacityValid ? 'text-green-800' : 'text-red-800'">
                {{ Math.abs(remainingSeats) }} seats
              </p>
            </div>
          </div>
          <div v-if="!isSeatCapacityValid" class="mt-2 flex items-center text-sm text-red-700">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please reduce the total seat allocation to match or be under the airplane capacity.
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end gap-4">
        <button
          type="button"
          @click="router.push('/flights')"
          class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!isSeatCapacityValid"
          :class="[
            'px-6 py-3 rounded-lg transition-all',
            isSeatCapacityValid
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          Create Flight
        </button>
      </div>
    </form>
  </div>
</template>
