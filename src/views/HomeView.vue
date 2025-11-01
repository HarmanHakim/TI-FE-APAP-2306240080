<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { homeService } from '@/services/home.service'
import type { HomeStatistics } from '@/interfaces/home.interface'
import VButton from '@/components/common/VButton.vue'
import { RouterLink } from 'vue-router'

const statistics = ref<HomeStatistics | null>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await homeService.getHomeStatistics()
    statistics.value = response.data as HomeStatistics
  } catch (error) {
    console.error('Failed to load statistics:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">
        Welcome to <span class="text-blue-600">Flight Booking System</span>
      </h1>
      <p class="text-gray-600">Manage flights, bookings, and airlines</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading statistics...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
        <h3 class="text-gray-600 text-sm font-medium">Active Flights Today</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">
          {{ statistics?.activeFlightsToday ?? 0 }}
        </p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
        <h3 class="text-gray-600 text-sm font-medium">Bookings Created Today</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">
          {{ statistics?.bookingsCreatedToday ?? 0 }}
        </p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
        <h3 class="text-gray-600 text-sm font-medium">Airlines Registered</h3>
        <p class="text-3xl font-bold text-purple-600 mt-2">
          {{ statistics?.totalAirlinesRegistered ?? 0 }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      <RouterLink to="/flights">
        <VButton class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white">
          Browse Flights
        </VButton>
      </RouterLink>

      <RouterLink to="/bookings">
        <VButton class="w-full py-4 bg-green-600 hover:bg-green-700 text-white">
          View Bookings
        </VButton>
      </RouterLink>

      <RouterLink to="/airplanes">
        <VButton class="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white">
          Manage Airplanes
        </VButton>
      </RouterLink>

      <RouterLink to="/statistics">
        <VButton class="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white">
          View Statistics
        </VButton>
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
@reference "@/assets/main.css";
</style>
