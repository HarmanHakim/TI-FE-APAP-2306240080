<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBookingStore } from '@/stores/booking/booking.store'
import type { ReadBookingDto } from '@/interfaces/booking.interface'

const router = useRouter()
const route = useRoute()
const bookingStore = useBookingStore()
const booking = ref<ReadBookingDto | null>(null)

onMounted(async () => {
  booking.value = await bookingStore.fetchBookingById(route.params.id as string)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Booking Details</h1>
      <button @click="router.push('/bookings')" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
        Back
      </button>
    </div>

    <div v-if="booking" class="space-y-6">
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-semibold mb-4">Flight Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Flight Number</p>
            <p class="font-semibold">{{ booking.flightNumber }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Route</p>
            <p class="font-semibold">{{ booking.originAirportCode }} → {{ booking.destinationAirportCode }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Class</p>
            <p class="font-semibold">{{ booking.classType }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Status</p>
            <p class="font-semibold">{{ booking.statusLabel }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Email</p>
            <p class="font-semibold">{{ booking.contactEmail }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Phone</p>
            <p class="font-semibold">{{ booking.contactPhone }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-semibold mb-4">Passengers ({{ booking.passengerCount }})</h2>
        <div class="space-y-2">
          <div v-for="passenger in booking.passengers" :key="passenger.id" class="flex justify-between border-b pb-2">
            <span>{{ passenger.fullName }}</span>
            <span class="text-gray-600">Seat: {{ passenger.seatNumber }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded shadow">
        <div class="flex justify-between items-center">
          <span class="text-xl font-semibold">Total Price</span>
          <span class="text-2xl font-bold text-green-600">${{ booking.totalPrice.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
