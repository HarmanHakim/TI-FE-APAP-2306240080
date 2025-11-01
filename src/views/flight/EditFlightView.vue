<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">Edit Flight</h1>

    <div class="bg-white p-6 rounded shadow">
      <p class="text-gray-600 mb-4">Flight edit form - To be implemented</p>
      <button @click="router.push('/flights')" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
        Back to Flights
      </button>
    </div>
  </div>
</template>
