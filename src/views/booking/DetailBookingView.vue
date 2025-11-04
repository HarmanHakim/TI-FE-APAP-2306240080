<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBookingStore } from '@/stores/booking/booking.store'
import type { ReadBookingDto } from '@/interfaces/booking.interface'
import { passengerService } from '@/services/passenger.service'
import type { ReadPassengerDto } from '@/interfaces/passenger.interface'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const bookingStore = useBookingStore()
const booking = ref<ReadBookingDto | null>(null)
const passengersDetail = ref<Array<ReadPassengerDto & { seatNumber?: string }>>([])
const loading = ref(true)

const canUpdate = computed(() => {
  if (!booking.value) return false
  // Can only update Unpaid or Paid bookings
  return booking.value.status === 1 || booking.value.status === 2
})

const canCancel = computed(() => {
  if (!booking.value) return false
  // Can only cancel Unpaid or Paid bookings (not already cancelled or rescheduled)
  return booking.value.status === 1 || booking.value.status === 2
})

const loadPassengerDetails = async () => {
  if (!booking.value) return

  const details = await Promise.all(
    booking.value.passengers.map(async (p) => {
      const passengerResponse = await passengerService.getPassengerById(p.id)
      return {
        ...passengerResponse.data,
        seatNumber: p.seatNumber
      }
    })
  )

  passengersDetail.value = details
}

const handleCancelBooking = async () => {
  if (!booking.value) return

  const confirmed = confirm(
    `Are you sure you want to cancel booking ${booking.value.id}?\n\n` +
    `This will release all seat assignments for this booking.`
  )

  if (!confirmed) return

  try {
    // Update booking status to Cancelled (3)
    await bookingStore.updateBooking(booking.value.id, {
      id: booking.value.id,
      flightId: booking.value.flightId,
      classFlightId: booking.value.classFlightId,
      contactEmail: booking.value.contactEmail,
      contactPhone: booking.value.contactPhone,
      passengerCount: booking.value.passengerCount,
      status: 3, // Cancelled
      totalPrice: booking.value.totalPrice
    })

    toast.success('Booking cancelled successfully')
    booking.value.status = 3
    booking.value.statusLabel = 'Cancelled'
  } catch {
    toast.error('Failed to cancel booking')
  }
}

onMounted(async () => {
  booking.value = await bookingStore.fetchBookingById(route.params.id as string)
  if (booking.value) {
    await loadPassengerDetails()
  }
  loading.value = false
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Booking Details</h1>
      <button @click="router.push('/bookings')" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
        Back to Bookings
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-600">Loading booking details...</p>
    </div>

    <div v-else-if="booking" class="space-y-6">
      <!-- Booking Code & Status -->
      <div class="bg-linear-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90 mb-1">Booking Code</p>
            <h2 class="text-3xl font-bold">{{ booking.id }}</h2>
          </div>
          <div class="text-right">
            <p class="text-sm opacity-90 mb-1">Status</p>
            <span
              class="inline-block px-4 py-2 rounded-full font-semibold text-sm"
              :class="{
                'bg-yellow-400 text-yellow-900': booking.status === 1,
                'bg-green-400 text-green-900': booking.status === 2,
                'bg-red-400 text-red-900': booking.status === 3,
                'bg-orange-400 text-orange-900': booking.status === 4
              }"
            >
              {{ booking.statusLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Flight Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Flight Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-600">Flight Number</p>
            <p class="font-semibold text-lg">{{ booking.flightNumber }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Route</p>
            <p class="font-semibold text-lg">{{ booking.originAirportCode }} → {{ booking.destinationAirportCode }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Class</p>
            <p class="font-semibold text-lg">{{ booking.classType }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Departure</p>
            <p class="font-semibold">{{ new Date(booking.departureTime).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Arrival</p>
            <p class="font-semibold">{{ new Date(booking.arrivalTime).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Booked On</p>
            <p class="font-semibold">{{ new Date(booking.createdAt).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <!-- Passengers -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Passengers ({{ booking.passengerCount }})
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birth Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID/Passport</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(passenger, index) in passengersDetail" :key="passenger.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm">{{ index + 1 }}</td>
                <td class="px-4 py-3 font-medium">{{ passenger.fullName }}</td>
                <td class="px-4 py-3 text-sm">{{ new Date(passenger.birthDate).toLocaleDateString() }}</td>
                <td class="px-4 py-3 text-sm">{{ passenger.age }}</td>
                <td class="px-4 py-3 text-sm">{{ passenger.genderLabel }}</td>
                <td class="px-4 py-3 text-sm font-mono">{{ passenger.idPassport }}</td>
                <td class="px-4 py-3">
                  <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {{ passenger.seatNumber }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Payment Summary
        </h2>
        <div class="space-y-3">
          <div class="flex justify-between text-gray-700">
            <span>Number of passengers:</span>
            <span class="font-medium">{{ booking.passengerCount }}</span>
          </div>
          <div class="flex justify-between text-gray-700">
            <span>Price per passenger:</span>
            <span class="font-medium">${{ (booking.totalPrice / booking.passengerCount).toFixed(2) }}</span>
          </div>
          <div class="border-t pt-3 flex justify-between items-center">
            <span class="text-xl font-semibold">Total Price:</span>
            <span class="text-3xl font-bold text-green-600">${{ booking.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4">
        <button
          v-if="canCancel"
          @click="handleCancelBooking"
          class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel Booking
        </button>

        <button
          v-if="canUpdate"
          @click="router.push(`/bookings/${booking.id}/edit`)"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Booking
        </button>
      </div>

      <!-- Additional Info -->
      <div class="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <p class="mb-2">
          <strong>Last Updated:</strong> {{ new Date(booking.updatedAt).toLocaleString() }}
        </p>
        <p v-if="!canUpdate && !canCancel" class="text-orange-600">
          ℹ️ This booking cannot be modified because its status is "{{ booking.statusLabel }}".
        </p>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-600 text-lg">Booking not found</p>
      <button
        @click="router.push('/bookings')"
        class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go to Bookings
      </button>
    </div>
  </div>
</template>
