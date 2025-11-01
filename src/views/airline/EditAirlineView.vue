<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAirlineStore } from '@/stores/airline/airline.store'
import type { UpdateAirlineDto } from '@/interfaces/airline.interface'

const router = useRouter()
const route = useRoute()
const airlineStore = useAirlineStore()

const form = ref<UpdateAirlineDto>({
  id: '',
  name: '',
  country: ''
})

onMounted(async () => {
  const airline = await airlineStore.fetchAirlineById(route.params.id as string)
  if (airline) {
    form.value = { id: airline.id, name: airline.name, country: airline.country }
  }
})

const handleSubmit = async () => {
  try {
    await airlineStore.updateAirline(form.value.id, form.value)
    router.push('/airlines')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Edit Airline</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded shadow space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Airline ID</label>
        <input v-model="form.id" disabled class="w-full px-4 py-2 border rounded bg-gray-100" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Name</label>
        <input v-model="form.name" required class="w-full px-4 py-2 border rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Country</label>
        <input v-model="form.country" required class="w-full px-4 py-2 border rounded" />
      </div>

      <div class="flex gap-4">
        <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Update
        </button>
        <button type="button" @click="router.push('/airlines')" class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
