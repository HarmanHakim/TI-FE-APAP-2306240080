<script setup lang="ts">
import type { ReadClassFlightDto, UpdateClassFlightDto } from '@/interfaces/classflight.interface'
import type { UpdateFlightDto } from '@/interfaces/flight.interface'
import { classFlightService } from '@/services/classflight.service'
import { useAirlineStore } from '@/stores/airline/airline.store'
import { useAirplaneStore } from '@/stores/airplane/airplane.store'
import { useFlightStore } from '@/stores/flight/flight.store'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const flightStore = useFlightStore()
const airlineStore = useAirlineStore()
const airplaneStore = useAirplaneStore()

const loading = ref(true)

// Form data
const formData = ref<UpdateFlightDto>({
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
  facilities: '',
  status: 1
})

// Class configuration
interface ClassEdit {
  id?: number
  classType: string
  seatCapacity: number
  availableSeats: number
  price: number
  isNew?: boolean
  isDeleted?: boolean
}

const classes = ref<ClassEdit[]>([])
const originalClasses = ref<ReadClassFlightDto[]>([])

const selectedAirplane = computed(() => {
  if (!formData.value.airplaneId) return null
  return airplaneStore.airplanes.find(plane => plane.id === formData.value.airplaneId)
})

const totalClassSeats = computed(() => {
  return classes.value
    .filter(cls => !cls.isDeleted)
    .reduce((sum, cls) => sum + (cls.seatCapacity || 0), 0)
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

  const flightId = route.params.id as string
  const flight = await flightStore.fetchFlightById(flightId)

  if (flight) {
    // Pre-fill form with existing data
    formData.value = {
      id: flight.id,
      airlineId: flight.airlineId,
      airplaneId: flight.airplaneId,
      originAirportCode: flight.originAirportCode,
      destinationAirportCode: flight.destinationAirportCode,
      departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
      terminal: flight.terminal || '',
      gate: flight.gate || '',
      baggageAllowance: flight.baggageAllowance || 20,
      facilities: flight.facilities || '',
      status: flight.status
    }

    // Load existing classes
    if (flight.classes && flight.classes.length > 0) {
      const classFlightsResponse = await classFlightService.getAllClassFlights(flight.id)
      originalClasses.value = classFlightsResponse.data
      classes.value = classFlightsResponse.data.map(cls => ({
        id: cls.id,
        classType: cls.classType,
        seatCapacity: cls.seatCapacity,
        availableSeats: cls.availableSeats,
        price: cls.price,
        isNew: false,
        isDeleted: false
      }))
    }
  }

  loading.value = false
})

const addClass = () => {
  classes.value.push({
    classType: 'Economy',
    seatCapacity: 0,
    availableSeats: 0,
    price: 0,
    isNew: true,
    isDeleted: false
  })
}

const removeClass = (index: number) => {
  const cls = classes.value[index]

  if (cls.isNew) {
    // If it's a new class, just remove it from the array
    classes.value.splice(index, 1)
  } else {
    // If it's an existing class, mark it as deleted
    cls.isDeleted = true
  }

  // Check if we need at least one class
  const activeClasses = classes.value.filter(c => !c.isDeleted)
  if (activeClasses.length === 0) {
    toast.error('At least one class is required')
    if (!cls.isNew) {
      cls.isDeleted = false
    } else {
      classes.value.push(cls)
    }
  }
}

const validateForm = () => {
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
  const activeClasses = classes.value.filter(c => !c.isDeleted)
  for (const cls of activeClasses) {
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

    // Check if availableSeats is valid
    if (cls.availableSeats > cls.seatCapacity) {
      toast.error(`Available seats cannot exceed seat capacity for ${cls.classType}`)
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

const adjustAvailableSeats = (cls: ClassEdit) => {
  // Auto-adjust availableSeats if it exceeds new capacity
  if (cls.availableSeats > cls.seatCapacity) {
    cls.availableSeats = cls.seatCapacity
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // Update flight basic information
    await flightStore.updateFlight(formData.value.id, formData.value)

    // Handle class updates
    const updatePromises: Promise<unknown>[] = []

    for (const cls of classes.value) {
      if (cls.isDeleted && cls.id) {
        // Delete existing class
        updatePromises.push(classFlightService.deleteClassFlight(cls.id))
      } else if (cls.isNew) {
        // Create new class
        updatePromises.push(classFlightService.createClassFlight({
          flightId: formData.value.id,
          classType: cls.classType,
          seatCapacity: cls.seatCapacity,
          price: cls.price
        }))
      } else if (cls.id) {
        // Update existing class
        const updateData: UpdateClassFlightDto = {
          id: cls.id,
          flightId: formData.value.id,
          classType: cls.classType,
          seatCapacity: cls.seatCapacity,
          availableSeats: cls.availableSeats,
          price: cls.price
        }
        updatePromises.push(classFlightService.updateClassFlight(cls.id, updateData))
      }
    }

    await Promise.all(updatePromises)

    toast.success('Flight and classes updated successfully!')
    router.push(`/flights/${formData.value.id}`)
  } catch (error) {
    // Error already handled by services/store
    console.error('Error updating flight:', error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Edit Flight</h1>
      <button @click="router.push('/flights')" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
        Back to Flights
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading flight data...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Flight Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Flight Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Flight ID (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Flight ID</label>
            <input v-model="formData.id" type="text" readonly class="w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>

          <!-- Airline ID (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Airline ID</label>
            <input v-model="formData.airlineId" type="text" readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>

          <!-- Airplane ID (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Airplane ID</label>
            <input v-model="formData.airplaneId" type="text" readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>

          <!-- Origin Airport (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Origin Airport Code</label>
            <input v-model="formData.originAirportCode" type="text" readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>

          <!-- Destination Airport (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Destination Airport Code</label>
            <input v-model="formData.destinationAirportCode" type="text" readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100" />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model.number="formData.status"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option :value="1">Scheduled</option>
              <option :value="2">Delayed</option>
              <option :value="3">Departed</option>
              <option :value="4">Arrived</option>
              <option :value="5">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Schedule (Editable) -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Schedule & Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Departure Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Departure Time *</label>
            <input v-model="formData.departureTime" type="datetime-local" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Arrival Time -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Arrival Time *</label>
            <input v-model="formData.arrivalTime" type="datetime-local" required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Terminal -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Terminal</label>
            <input v-model="formData.terminal" type="text" maxlength="50" placeholder="e.g., 1A, 2B"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Gate -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Gate</label>
            <input v-model="formData.gate" type="text" maxlength="50" placeholder="e.g., A1, B5"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Baggage Allowance -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Baggage Allowance (kg)</label>
            <input v-model.number="formData.baggageAllowance" type="number" min="0"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <!-- Facilities -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Facilities (comma-separated)</label>
          <textarea v-model="formData.facilities" rows="3"
            placeholder="e.g., WiFi, In-flight Entertainment, Meal, Blanket, Pillow"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
      </div>

      <!-- Class Configuration -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Class Configuration</h2>
          <button type="button" @click="addClass"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Class
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="(cls, index) in classes" :key="index" v-show="!cls.isDeleted"
            class="border border-gray-200 rounded-lg p-4 relative"
            :class="cls.isNew ? 'border-green-300 bg-green-50' : ''">
            <div v-if="cls.isNew" class="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
              NEW
            </div>

            <button type="button" @click="removeClass(index)"
              class="absolute top-2 right-2 text-red-600 hover:text-red-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- Class Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Class Type *</label>
                <select v-model="cls.classType" required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Class</option>
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>

              <!-- Seat Capacity -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Seat Capacity *</label>
                <input v-model.number="cls.seatCapacity" type="number" required min="1"
                  @input="adjustAvailableSeats(cls)"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <!-- Available Seats -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Available Seats *</label>
                <input v-model.number="cls.availableSeats" type="number" required min="0" :max="cls.seatCapacity"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  :class="cls.availableSeats > cls.seatCapacity ? 'border-red-500' : ''" />
                <p v-if="cls.availableSeats > cls.seatCapacity" class="text-xs text-red-600 mt-1">
                  Cannot exceed capacity
                </p>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price (IDR) *</label>
                <input v-model.number="cls.price" type="number" required min="0" step="0.01"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div v-if="!cls.isNew" class="mt-2 text-xs text-gray-500">
              Booked seats: {{ cls.seatCapacity - cls.availableSeats }}
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please reduce the total seat allocation to match or be under the airplane capacity.
          </div>
        </div>
      </div>

      <!-- Note about Editing -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm text-blue-800">
          <strong>Note:</strong> You can add new classes, modify existing ones, or remove classes.
          When reducing seat capacity, ensure available seats don't exceed the new capacity.
          Classes marked as "NEW" will be created, and removed classes will be deleted upon saving.
        </p>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end gap-4">
        <button type="button" @click="router.push('/flights')"
          class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
          Cancel
        </button>
        <button type="submit" :disabled="!isSeatCapacityValid" :class="[
          'px-6 py-3 rounded-lg transition-all',
          isSeatCapacityValid
            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]">
          Update Flight
        </button>
      </div>
    </form>
  </div>
</template>
