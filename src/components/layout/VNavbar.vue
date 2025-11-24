<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute()
const mobileMenuOpen = ref(false)

const getLinkClass = (path: string) =>
  route.path.startsWith(path)
    ? 'text-blue-600 font-semibold'
    : 'text-gray-700 hover:text-blue-600'

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
    <header class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div class="flex items-center justify-between px-4 md:px-6 py-4">
            <RouterLink to="/" class="text-xl font-bold text-blue-600 flex items-center gap-2">
                <span>✈️</span>
                <span class="hidden sm:inline">Flight Booking</span>
                <span class="sm:hidden">Flight</span>
            </RouterLink>

            <!-- Desktop Navigation -->
            <nav class="hidden md:flex gap-6 ml-8">
                <RouterLink to="/flights" :class="getLinkClass('/flights')">Flights</RouterLink>
                <RouterLink to="/bookings" :class="getLinkClass('/bookings')">Bookings</RouterLink>
                <RouterLink to="/airplanes" :class="getLinkClass('/airplanes')">Airplanes</RouterLink>
                <RouterLink to="/airlines" :class="getLinkClass('/airlines')">Airlines</RouterLink>
                <RouterLink to="/statistics" :class="getLinkClass('/statistics')">Statistics</RouterLink>
                <RouterLink to="/coupons" :class="getLinkClass('/coupons')">Coupons</RouterLink>
                <RouterLink to="/loyalty" :class="getLinkClass('/loyalty')">Loyalty</RouterLink>
            </nav>

            <!-- Mobile Menu Button -->
            <button
                @click="toggleMobileMenu"
                class="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
            >
                <svg v-if="!mobileMenuOpen" class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg v-else class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Mobile Navigation -->
        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <nav v-show="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
                <div class="px-4 py-2 space-y-1">
                    <RouterLink
                        to="/flights"
                        :class="getLinkClass('/flights')"
                        class="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        @click="closeMobileMenu"
                    >
                        Flights
                    </RouterLink>
                    <RouterLink
                        to="/bookings"
                        :class="getLinkClass('/bookings')"
                        class="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        @click="closeMobileMenu"
                    >
                        Bookings
                    </RouterLink>
                    <RouterLink
                        to="/airplanes"
                        :class="getLinkClass('/airplanes')"
                        class="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        @click="closeMobileMenu"
                    >
                        Airplanes
                    </RouterLink>
                    <RouterLink
                        to="/airlines"
                        :class="getLinkClass('/airlines')"
                        class="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        @click="closeMobileMenu"
                    >
                        Airlines
                    </RouterLink>
                    <RouterLink
                        to="/statistics"
                        :class="getLinkClass('/statistics')"
                        class="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        @click="closeMobileMenu"
                    >
                        Statistics
                    </RouterLink>
                    <RouterLink
                        to="/coupons"
                        :class="getLinkClass('/coupons')"
                        class="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        @click="closeMobileMenu"
                    >
                        Coupons
                    </RouterLink>
                    <RouterLink
                        to="/loyalty"
                        :class="getLinkClass('/loyalty')"
                        class="block px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        @click="closeMobileMenu"
                    >
                        Loyalty
                    </RouterLink>
                </div>
            </nav>
        </Transition>
    </header>
</template>
