<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const getLinkClass = (path: string) => route.path === path ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
</script>

<template>
    <header class="fixed top-0 left-0 flex items-center w-full gap-4 px-6 py-4 bg-white shadow-md z-50">
        <RouterLink to="/" class="text-xl font-bold text-blue-600">✈️ Flight Booking</RouterLink>
        <nav class="flex gap-6 ml-8">
            <RouterLink to="/flights" :class="getLinkClass('/flights')">Flights</RouterLink>
            <RouterLink to="/bookings" :class="getLinkClass('/bookings')">Bookings</RouterLink>
            <RouterLink to="/airplanes" :class="getLinkClass('/airplanes')">Airplanes</RouterLink>
            <RouterLink to="/airlines" :class="getLinkClass('/airlines')">Airlines</RouterLink>
            <RouterLink to="/statistics" :class="getLinkClass('/statistics')">Statistics</RouterLink>
        </nav>
    </header>
</template>
