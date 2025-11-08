<script setup lang="ts">
import VButton from '@/components/common/VButton.vue'
import type { BookingStatistics } from '@/interfaces/booking.interface'
import { bookingService } from '@/services/booking.service'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js'
import { computed, onMounted, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import { useRouter } from 'vue-router'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()

const statistics = ref<BookingStatistics | null>(null)
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
    // Convert date to ISO string with time (start of day for start, end of day for end)
    const startDateTime = new Date(startDate.value)
    startDateTime.setHours(0, 0, 0, 0)

    const endDateTime = new Date(endDate.value)
    endDateTime.setHours(23, 59, 59, 999)

    const response = await bookingService.getBookingStatistics(
      startDateTime.toISOString(),
      endDateTime.toISOString()
    )
    statistics.value = response.data
  } catch (error) {
    console.error('Failed to load statistics:', error)
  } finally {
    loading.value = false
  }
}

// Chart data for Booking Count
const bookingCountChartData = computed(() => {
  if (!statistics.value?.flightStats) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: statistics.value.flightStats.map(f => `${f.flightNumber}\n${f.route}`),
    datasets: [
      {
        label: 'Number of Bookings',
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
        data: statistics.value.flightStats.map(f => f.bookingCount)
      }
    ]
  }
})

// Chart data for Revenue
const revenueChartData = computed(() => {
  if (!statistics.value?.flightStats) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: statistics.value.flightStats.map(f => `${f.flightNumber}\n${f.route}`),
    datasets: [
      {
        label: 'Potential Revenue ($)',
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
        data: statistics.value.flightStats.map(f => f.potentialRevenue)
      }
    ]
  }
})

// Chart options for booking count
const bookingChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
}

// Chart options for revenue
const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => {
          return '$' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      }
    }
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
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">Date Range Filter</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Start Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">End Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-end">
          <VButton
            @click="loadStatistics"
            :disabled="loading"
            class="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ loading ? 'Loading...' : 'Load Statistics' }}
          </VButton>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-500 mt-4">Loading statistics...</p>
    </div>

    <div v-else-if="statistics" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-600 text-sm font-medium uppercase">Total Bookings</h3>
              <p class="text-3xl font-bold text-blue-600 mt-2">
                {{ statistics.totalBookings ?? 0 }}
              </p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-600 text-sm font-medium uppercase">Total Revenue</h3>
              <p class="text-3xl font-bold text-green-600 mt-2">
                ${{ (statistics.potentialRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-gray-600 text-sm font-medium uppercase">Flights with Bookings</h3>
              <p class="text-3xl font-bold text-purple-600 mt-2">
                {{ statistics.flightStats?.length ?? 0 }}
              </p>
            </div>
            <div class="bg-purple-100 p-3 rounded-full">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div v-if="statistics.flightStats && statistics.flightStats.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Booking Count Chart -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Booking Count per Flight
          </h2>
          <div class="h-96">
            <Bar :data="bookingCountChartData" :options="bookingChartOptions" />
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Potential Revenue per Flight
          </h2>
          <div class="h-96">
            <Bar :data="revenueChartData" :options="revenueChartOptions" />
          </div>
        </div>
      </div>

      <!-- Flight Details Table -->
      <div v-if="statistics.flightStats && statistics.flightStats.length > 0" class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Flight Statistics Details</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flight Number</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bookings</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg/Booking</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(flight, index) in statistics.flightStats" :key="flight.flightId" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm">{{ index + 1 }}</td>
                <td class="px-4 py-3 font-medium">{{ flight.flightNumber }}</td>
                <td class="px-4 py-3 text-sm">{{ flight.route }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {{ flight.bookingCount }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-green-600">
                  ${{ flight.potentialRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>
                <td class="px-4 py-3 text-right text-sm text-gray-600">
                  ${{ (flight.potentialRevenue / flight.bookingCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-semibold">
              <tr>
                <td colspan="3" class="px-4 py-3 text-right">Total:</td>
                <td class="px-4 py-3 text-right">
                  <span class="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                    {{ statistics.totalBookings }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-green-600">
                  ${{ (statistics.potentialRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>
                <td class="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white p-12 rounded-lg shadow-md text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
        <p class="text-gray-500">
          No bookings found for the selected date range. Try selecting a different time period.
        </p>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Select a date range and click "Load Statistics" to view the data.</p>
    </div>
  </div>
</template>
