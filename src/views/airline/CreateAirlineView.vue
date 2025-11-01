<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAirlineStore } from '@/stores/airline/airline.store'
import type { CreateAirlineDto } from '@/interfaces/airline.interface'

const router = useRouter()
const airlineStore = useAirlineStore()

const form = ref<CreateAirlineDto>({
  id: '',
  name: '',
  country: ''
})

const handleSubmit = async () => {
  try {
    await airlineStore.createAirline(form.value)
    router.push('/airlines')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Create Airline</h1>

    <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded shadow space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Airline ID (3 characters)</label>
        <input v-model="form.id" maxlength="3" required class="w-full px-4 py-2 border rounded" />
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
          Create
        </button>
        <button type="button" @click="router.push('/airlines')" class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
