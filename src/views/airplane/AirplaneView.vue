<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAirplaneStore } from '@/stores/airplane/airplane.store'
import { useAirlineStore } from '@/stores/airline/airline.store'
import VButton from '@/components/common/VButton.vue'

const router = useRouter()
const airplaneStore = useAirplaneStore()
const airlineStore = useAirlineStore()
const filterIsDeleted = ref<boolean | undefined>(undefined)

onMounted(async () => {
  await airplaneStore.fetchAllAirplanes()
  await airlineStore.fetchAllAirlines()
})

const filteredAirplanes = computed(() => {
  if (filterIsDeleted.value === undefined) return airplaneStore.airplanes
  return airplaneStore.airplanes.filter(a => a.isDeleted === filterIsDeleted.value)
})

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
      <VButton @click="router.push('/airplanes/add')" class="bg-blue-600 text-white">
        Register New Airplane
      </VButton>
    </div>

    <div class="bg-white p-4 rounded-lg shadow mb-4">
      <label class="block text-sm font-medium mb-2">Filter by Status</label>
      <select v-model="filterIsDeleted" class="px-4 py-2 border rounded-lg">
        <option :value="undefined">All</option>
        <option :value="false">Active</option>
        <option :value="true">Inactive</option>
      </select>
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
                <button @click="handleEdit(airplane.id)" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
                <button
                  v-if="!airplane.isDeleted"
                  @click="handleDelete(airplane.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Deactivate
                </button>
                <button
                  v-else
                  @click="handleActivate(airplane.id)"
                  class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
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
