<script setup lang="ts">
import VButton from '@/components/common/VButton.vue'
import { useAirlineStore } from '@/stores/airline/airline.store'
import { useAirplaneStore } from '@/stores/airplane/airplane.store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const airplaneStore = useAirplaneStore()
const airlineStore = useAirlineStore()

// Filter states
const filterIsDeleted = ref<boolean | undefined>(undefined)
const filterAirlineId = ref<string>('')
const filterModel = ref<string>('')
const filterManufactureYear = ref<number | undefined>(undefined)
const universalSearch = ref<string>('')

onMounted(async () => {
  await airplaneStore.fetchAllAirplanes()
  await airlineStore.fetchAllAirlines()
})

// Get unique manufacture years from airplanes
const availableYears = computed(() => {
  const years = [...new Set(airplaneStore.airplanes.map(a => a.manufactureYear))]
  return years.sort((a, b) => b - a)
})

const filteredAirplanes = computed(() => {
  return airplaneStore.airplanes.filter(airplane => {
    // Universal search - searches across all columns
    if (universalSearch.value) {
      const searchLower = universalSearch.value.toLowerCase()
      const matchesUniversal =
        airplane.id.toLowerCase().includes(searchLower) ||
        airplane.model.toLowerCase().includes(searchLower) ||
        airplane.airlineName.toLowerCase().includes(searchLower) ||
        airplane.seatCapacity.toString().includes(searchLower) ||
        airplane.manufactureYear.toString().includes(searchLower) ||
        (airplane.isDeleted ? 'inactive' : 'active').includes(searchLower)

      if (!matchesUniversal) return false
    }

    // Filter by status (isDeleted)
    if (filterIsDeleted.value !== undefined && airplane.isDeleted !== filterIsDeleted.value) {
      return false
    }

    // Filter by airline
    if (filterAirlineId.value && airplane.airlineId !== filterAirlineId.value) {
      return false
    }

    // Filter by model (case-insensitive search)
    if (filterModel.value && !airplane.model.toLowerCase().includes(filterModel.value.toLowerCase())) {
      return false
    }

    // Filter by manufacture year
    if (filterManufactureYear.value && airplane.manufactureYear !== filterManufactureYear.value) {
      return false
    }

    return true
  })
})

const clearFilters = () => {
  filterIsDeleted.value = undefined
  filterAirlineId.value = ''
  filterModel.value = ''
  filterManufactureYear.value = undefined
  universalSearch.value = ''
}

const handleEdit = (id: string) => {
  router.push(`/airplanes/${id}/edit`)
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to deactivate this airplane?')) {
    await airplaneStore.deleteAirplane(id)
  }
}

const handleActivate = async (id: string) => {
  if (confirm('Are you sure you want to activate this airplane?')) {
    await airplaneStore.activateAirplane(id)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Airplane Management</h1>
      <VButton @click="router.push('/airplanes/add')" class="bg-blue-600 text-white max-w-xs">
        Register New Airplane
      </VButton>
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
          placeholder="Search across all fields (ID, Model, Airline, Capacity, Year, Status)..."
          class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <button v-if="universalSearch" @click="universalSearch = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow mb-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Filters</h2>
        <button @click="clearFilters" class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded">
          Clear All Filters
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select v-model="filterIsDeleted" class="w-full px-4 py-2 border rounded-lg">
            <option :value="undefined">All Status</option>
            <option :value="false">Active</option>
            <option :value="true">Inactive</option>
          </select>
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
          <label class="block text-sm font-medium mb-2">Model</label>
          <input v-model="filterModel" type="text" placeholder="Search model..."
            class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Manufacture Year</label>
          <select v-model="filterManufactureYear" class="w-full px-4 py-2 border rounded-lg">
            <option :value="undefined">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-4 text-sm text-gray-600">
        Showing {{ filteredAirplanes.length }} of {{ airplaneStore.airplanes.length }} airplanes
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Airline</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="filteredAirplanes.length === 0">
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-lg font-medium">No airplanes found</p>
                <p class="text-sm mt-1">Try adjusting your filters or clear all filters to see results</p>
              </div>
            </td>
          </tr>
          <tr v-for="airplane in filteredAirplanes" :key="airplane.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airplane.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airplane.model }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airplane.airlineName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airplane.seatCapacity }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airplane.manufactureYear }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="airplane.isDeleted ? 'text-red-600' : 'text-green-600'">
                {{ airplane.isDeleted ? 'Inactive' : 'Active' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex gap-2">
                <button @click="handleEdit(airplane.id)"
                  class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button v-if="!airplane.isDeleted" @click="handleDelete(airplane.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Deactivate
                </button>
                <button v-else @click="handleActivate(airplane.id)"
                  class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  Activate
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
