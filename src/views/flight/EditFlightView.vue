<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flight.store'
import type { UpdateFlightDto } from '@/interfaces/flight.interface'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const flightStore = useFlightStore()

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

onMounted(async () => {
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
  }

  loading.value = false
})

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

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await flightStore.updateFlight(formData.value.id, formData.value)
    toast.success('Flight updated successfully!')
    router.push(`/flights/${formData.value.id}`)
  } catch {
    // Error handled by store
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
            <input
              v-model="formData.id"
              type="text"
              readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <!-- Airline ID (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Airline ID</label>
            <input
              v-model="formData.airlineId"
              type="text"
              readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <!-- Airplane ID (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Airplane ID</label>
            <input
              v-model="formData.airplaneId"
              type="text"
              readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <!-- Origin Airport (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Origin Airport Code</label>
            <input
              v-model="formData.originAirportCode"
              type="text"
              readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <!-- Destination Airport (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Destination Airport Code</label>
            <input
              v-model="formData.destinationAirportCode"
              type="text"
              readonly
              class="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model.number="formData.status"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
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

      <!-- Note about Class Configuration -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          <strong>Note:</strong> Class configuration (Economy, Business, First Class) and pricing can only be modified through the detail view.
          This form focuses on schedule, terminal/gate information, and flight facilities.
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
          Update Flight
        </button>
      </div>
    </form>
  </div>
</template>
