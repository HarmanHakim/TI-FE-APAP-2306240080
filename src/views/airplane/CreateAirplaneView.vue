<script setup lang="ts">
import type { CreateAirplaneDto } from '@/interfaces/airplane.interface'
import { useAirlineStore } from '@/stores/airline/airline.store'
import { useAirplaneStore } from '@/stores/airplane/airplane.store'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import VButton from '@/components/common/VButton.vue'

const router = useRouter()
const airplaneStore = useAirplaneStore()
const airlineStore = useAirlineStore()

const form = ref<CreateAirplaneDto>({
  airlineId: '',
  model: '',
  seatCapacity: 0,
  manufactureYear: new Date().getFullYear()
})

onMounted(async () => {
  await airlineStore.fetchAllAirlines()
})

const handleSubmit = async () => {
  try {
    await airplaneStore.createAirplane(form.value)
    router.push('/airplanes')
  } catch (error) {
    console.error('Failed to create airplane:', error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Register New Airplane</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow space-y-4">
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
        <input v-model.number="form.seatCapacity" type="number" min="1" required
          class="w-full px-4 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Manufacture Year</label>
        <input v-model.number="form.manufactureYear" type="number" :min="1900" :max="new Date().getFullYear()" required
          class="w-full px-4 py-2 border rounded" />
      </div>

      <div class="flex gap-4">
        <VButton type="submit" class="flex-1 bg-blue-600 text-white hover:bg-blue-700">
          Register Airplane
        </VButton>
        <VButton type="button" @click="router.push('/airplanes')"
          class="flex-1 bg-gray-500 text-white hover:bg-gray-600">
          Cancel
        </VButton>
      </div>
    </form>
  </div>
</template>
