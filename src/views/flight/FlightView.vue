<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightStore } from '@/stores/flight/flight.store'

const router = useRouter()
const flightStore = useFlightStore()
const searchOrigin = ref('')
const searchDestination = ref('')

onMounted(() => flightStore.fetchAllFlights())

const filteredFlights = computed(() => {
  return flightStore.flights.filter(f => {
    const matchOrigin = !searchOrigin.value || f.originAirportCode.toLowerCase().includes(searchOrigin.value.toLowerCase())
    const matchDest = !searchDestination.value || f.destinationAirportCode.toLowerCase().includes(searchDestination.value.toLowerCase())
    return matchOrigin && matchDest
  })
})

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
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Flights</h1>
      <button @click="router.push('/flights/add')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Create Flight
      </button>
    </div>

    <div class="bg-white p-4 rounded shadow mb-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">Origin</label>
        <input v-model="searchOrigin" placeholder="Search origin..." class="w-full px-4 py-2 border rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Destination</label>
        <input v-model="searchDestination" placeholder="Search destination..." class="w-full px-4 py-2 border rounded" />
      </div>
    </div>

    <div class="bg-white rounded shadow overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Airline</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departure</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="flight in filteredFlights" :key="flight.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ flight.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              {{ flight.originAirportCode }} → {{ flight.destinationAirportCode }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ flight.airlineName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              {{ new Date(flight.departureTime).toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="getStatusColor(flight.status)">{{ flight.statusLabel }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button @click="router.push(`/flights/${flight.id}`)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">
                View
              </button>
              <button v-if="flight.status <= 2" @click="router.push(`/flights/${flight.id}/edit`)" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
