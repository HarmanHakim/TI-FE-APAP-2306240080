<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { homeService } from '@/services/home.service'
import type { HomeStatistics } from '@/interfaces/home.interface'
import { useAuthStore } from '@/stores/auth'
import FlightReminder from '@/components/FlightReminder.vue'

const router = useRouter()
const authStore = useAuthStore()
const statistics = ref<HomeStatistics | null>(null)
const loading = ref(false)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    loading.value = true
    try {
      const response = await homeService.getHomeStatistics()
      statistics.value = response.data
    } catch (error) {
      console.error('Failed to load statistics:', error)
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div class="relative container mx-auto px-4 py-16 md:py-24">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Main Heading -->
          <h1
            class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in">
            Welcome to Flight Apap
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in-delay">
            Your journey begins here. Book flights, manage bookings, and explore the world.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-delay-2">
            <button @click="router.push('/flights')"
              class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search Flights</span>
            </button>
            <button v-if="authStore.hasRole('CUSTOMER', 'SUPERADMIN')" @click="router.push('/bookings')"
              class="px-8 py-4 bg-white text-gray-800 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>My Bookings</span>
            </button>
          </div>

          <!-- Decorative Airplane -->
          <div class="relative h-32 mb-8">
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="w-24 h-24 text-blue-600 opacity-20 animate-float" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section v-if="authStore.isAuthenticated && statistics" class="py-12 bg-white/50 backdrop-blur-sm">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">Live Statistics</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <!-- Active Flights -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
            <h3 class="text-gray-600 text-sm font-medium uppercase mb-2">Active Flights Today</h3>
            <p class="text-4xl font-bold text-gray-900">{{ statistics.activeFlightsToday }}</p>
            <p class="text-sm text-gray-500 mt-2">Currently in operation</p>
          </div>

          <!-- Today's Bookings -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 class="text-gray-600 text-sm font-medium uppercase mb-2">Bookings Created Today</h3>
            <p class="text-4xl font-bold text-gray-900">{{ statistics.bookingsCreatedToday }}</p>
            <p class="text-sm text-gray-500 mt-2">New reservations</p>
          </div>

          <!-- Total Airlines -->
          <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 class="text-gray-600 text-sm font-medium uppercase mb-2">Airlines Registered</h3>
            <p class="text-4xl font-bold text-gray-900">{{ statistics.totalRegisteredAirlines }}</p>
            <p class="text-sm text-gray-500 mt-2">Partner airlines</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Flight Reminders for Admin Roles -->
    <section v-if="authStore.hasRole('SUPERADMIN', 'FLIGHT_AIRLINE')" class="py-12">
      <div class="container mx-auto px-4">
        <FlightReminder :interval="3" :showForCustomer="false" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Flight Apap?</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- Feature 1 -->
          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900">Fast Booking</h3>
            <p class="text-gray-600">Book your flights in seconds with our streamlined process</p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900">Secure Payments</h3>
            <p class="text-gray-600">Your transactions are protected with industry-leading security</p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center p-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-900">24/7 Support</h3>
            <p class="text-gray-600">Our team is always here to help you with your journey</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 0.8s ease-out 0.2s both;
}

.animate-fade-in-delay-2 {
  animation: fade-in 0.8s ease-out 0.4s both;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
