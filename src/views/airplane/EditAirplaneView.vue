<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAirplaneStore } from '@/stores/airplane/airplane.store'
import { useAirlineStore } from '@/stores/airline/airline.store'
import type { UpdateAirplaneDto } from '@/interfaces/airplane.interface'

const router = useRouter()
const route = useRoute()
const airplaneStore = useAirplaneStore()
const airlineStore = useAirlineStore()

const form = ref<UpdateAirplaneDto>({
  id: '',
  airlineId: '',
  model: '',
  seatCapacity: 0,
  manufactureYear: new Date().getFullYear()
})

onMounted(async () => {
  await airlineStore.fetchAllAirlines()
  const airplane = await airplaneStore.fetchAirplaneById(route.params.id as string)
  if (airplane) {
    form.value = {
      id: airplane.id,
      airlineId: airplane.airlineId,
      model: airplane.model,
      seatCapacity: airplane.seatCapacity,
      manufactureYear: airplane.manufactureYear
    }
  }
})

const handleSubmit = async () => {
  try {
    await airplaneStore.updateAirplane(form.value.id, form.value)
    router.push('/airplanes')
  } catch (error) {
    console.error('Failed to update airplane:', error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Edit Airplane</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Airplane ID</label>
        <input v-model="form.id" disabled class="w-full px-4 py-2 border rounded bg-gray-100" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Airline</label>
        <select v-model="form.airlineId" required class="w-full px-4 py-2 border rounded">
          <option value="">Select Airline</option>
          <option v-for="airline in airlineStore.airlines" :key="airline.id" :value="airline.id">
            {{ airline.name }} ({{ airline.id }})
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Model</label>
        <input v-model="form.model" required class="w-full px-4 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Seat Capacity</label>
        <input v-model.number="form.seatCapacity" type="number" min="1" required class="w-full px-4 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Manufacture Year</label>
        <input v-model.number="form.manufactureYear" type="number" :min="1900" :max="new Date().getFullYear()" required class="w-full px-4 py-2 border rounded" />
      </div>

      <div class="flex gap-4">
        <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Update Airplane
        </button>
        <button type="button" @click="router.push('/airplanes')" class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
