<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAirlineStore } from '@/stores/airline/airline.store'

const router = useRouter()
const airlineStore = useAirlineStore()

onMounted(() => airlineStore.fetchAllAirlines())
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Airlines</h1>
      <button @click="router.push('/airlines/add')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Add Airline
      </button>
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
          <tr v-for="airline in airlineStore.airlines" :key="airline.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airline.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airline.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ airline.country }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button @click="router.push(`/airlines/${airline.id}/edit`)" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
