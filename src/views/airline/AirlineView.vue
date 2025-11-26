<script setup lang="ts">
import VButton from '@/components/common/VButton.vue'
import { useAirlineStore } from '@/stores/airline/airline.store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const airlineStore = useAirlineStore()

// Filter states
const filterCountry = ref<string>('')
const filterName = ref<string>('')
const universalSearch = ref<string>('')
const sortBy = ref<string>('name-asc')

onMounted(async () => {
  await airlineStore.fetchAllAirlines()
  await airlineStore.fetchCountries()
})

// Get unique countries from airlines
const availableCountries = computed(() => {
  const countries = [...new Set(airlineStore.airlines.map(a => a.country))]
  return countries.sort()
})

const filteredAirlines = computed(() => {
  return airlineStore.airlines.filter(airline => {
    // Universal search - searches across all columns
    if (universalSearch.value) {
      const searchLower = universalSearch.value.toLowerCase()
      const matchesUniversal =
        airline.id.toLowerCase().includes(searchLower) ||
        airline.name.toLowerCase().includes(searchLower) ||
        airline.country.toLowerCase().includes(searchLower)

      if (!matchesUniversal) return false
    }

    // Filter by country
    if (filterCountry.value && airline.country !== filterCountry.value) {
      return false
    }

    // Filter by name (case-insensitive search)
    if (filterName.value && !airline.name.toLowerCase().includes(filterName.value.toLowerCase())) {
      return false
    }

    return true
  })
})

const sortedAirlines = computed(() => {
  const filtered = [...filteredAirlines.value]
  
  switch (sortBy.value) {
    case 'name-asc':
      return filtered.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return filtered.sort((a, b) => b.name.localeCompare(a.name))
    case 'country-asc':
      return filtered.sort((a, b) => a.country.localeCompare(b.country))
    case 'country-desc':
      return filtered.sort((a, b) => b.country.localeCompare(a.country))
    default:
      return filtered
  }
})

const clearFilters = () => {
  filterCountry.value = ''
  filterName.value = ''
  universalSearch.value = ''
}

const handleEdit = (id: string) => {
  router.push(`/airlines/${id}/edit`)
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this airline?')) {
    await airlineStore.deleteAirline(id)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Airlines</h1>
      <VButton @click="router.push('/airlines/add')" class="bg-blue-600 text-white max-w-xs">
        Add Airline
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
        <input v-model="universalSearch" type="text" placeholder="Search across all fields (ID, Name, Country)..."
          class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <button v-if="universalSearch" @click="universalSearch = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Filters</h2>
        <button @click="clearFilters" class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded">
          Clear All Filters
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Country</label>
          <select v-model="filterCountry" class="w-full px-4 py-2 border rounded-lg">
            <option value="">All Countries</option>
            <option v-for="country in availableCountries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Name</label>
          <input v-model="filterName" type="text" placeholder="Search name..."
            class="w-full px-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium mb-2">Sort By</label>
        <select v-model="sortBy" class="w-full px-4 py-2 border rounded-lg">
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="country-asc">Country (A-Z)</option>
          <option value="country-desc">Country (Z-A)</option>
        </select>
      </div>

      <div class="mt-4 text-sm text-gray-600">
        Showing {{ sortedAirlines.length }} of {{ airlineStore.airlines.length }} airlines
      </div>
    </div>

    <div class="bg-white rounded shadow overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="sortedAirlines.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-lg font-medium">No airlines found</p>
                <p class="text-sm mt-1">Try adjusting your filters or clear all filters to see results</p>
              </div>
            </td>
          </tr>
          <tr v-for="airline in sortedAirlines" :key="airline.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airline.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airline.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airline.country }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex gap-2">
                <button @click="handleEdit(airline.id)"
                  class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button @click="handleDelete(airline.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
