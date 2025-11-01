<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { bookingService } from '@/services/booking.service'
import VButton from '@/components/common/VButton.vue'

const router = useRouter()
const statistics = ref<Record<string, number | string | boolean | object> | null>(null)
const loading = ref(false)
const startDate = ref('')
const endDate = ref('')

// Set default dates (last 30 days)
const setDefaultDates = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)

  endDate.value = end.toISOString().split('T')[0]
  startDate.value = start.toISOString().split('T')[0]
}

const loadStatistics = async () => {
  if (!startDate.value || !endDate.value) return

  loading.value = true
  try {
    const response = await bookingService.getBookingStatistics(
      new Date(startDate.value).toISOString(),
      new Date(endDate.value).toISOString()
    )
    statistics.value = response.data
  } catch (error) {
    console.error('Failed to load statistics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setDefaultDates()
  loadStatistics()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Booking Statistics</h1>
      <VButton @click="router.push('/')">Back to Home</VButton>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">Date Range Filter</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Start Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">End Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div class="flex items-end">
          <VButton @click="loadStatistics" class="w-full bg-blue-600 text-white">
            Load Statistics
          </VButton>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading statistics...</p>
    </div>

    <div v-else-if="statistics" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-600 text-sm font-medium">Total Bookings</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">
          {{ statistics.totalBookings ?? 0 }}
        </p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-gray-600 text-sm font-medium">Potential Revenue</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">
          ${{ (statistics.potentialRevenue ?? 0).toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>
