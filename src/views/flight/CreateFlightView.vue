<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flight.store'
import { useAirlineStore } from '@/stores/airline/airline.store'
import { useAirplaneStore } from '@/stores/airplane/airplane.store'
import type { CreateFlightDto } from '@/interfaces/flight.interface'
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

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // Note: Backend akan handle pembuatan ClassFlight dari informasi yang dikirim
    // Sesuaikan dengan API backend Anda
    await flightStore.createFlight(formData.value)
    toast.success('Flight created successfully!')
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
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Flight
        </button>
      </div>
    </form>
  </div>
</template>
