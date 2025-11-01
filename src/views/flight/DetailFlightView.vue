<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flight.store'
import type { ReadFlightDto } from '@/interfaces/flight.interface'

const router = useRouter()
const route = useRoute()
const flightStore = useFlightStore()
const flight = ref<ReadFlightDto | null>(null)

onMounted(async () => {
  flight.value = await flightStore.fetchFlightById(route.params.id as string)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Flight Details</h1>
      <button @click="router.push('/flights')" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
        Back
      </button>
    </div>

    <div v-if="flight" class="bg-white p-6 rounded shadow">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-600">Flight ID</p>
          <p class="font-semibold">{{ flight.id }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Airline</p>
          <p class="font-semibold">{{ flight.airlineName }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Route</p>
          <p class="font-semibold">{{ flight.originAirportCode }} → {{ flight.destinationAirportCode }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Status</p>
          <p class="font-semibold">{{ flight.statusLabel }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Departure</p>
          <p class="font-semibold">{{ new Date(flight.departureTime).toLocaleString() }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Arrival</p>
          <p class="font-semibold">{{ new Date(flight.arrivalTime).toLocaleString() }}</p>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-3">Classes</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="cls in flight.classes" :key="cls.id" class="border p-4 rounded">
            <p class="font-semibold">{{ cls.classType }}</p>
            <p class="text-sm text-gray-600">Available: {{ cls.availableSeats }}/{{ cls.seatCapacity }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button @click="router.push(`/bookings/add?flightId=${flight.id}`)" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Book This Flight
        </button>
      </div>
    </div>
  </div>
</template>
