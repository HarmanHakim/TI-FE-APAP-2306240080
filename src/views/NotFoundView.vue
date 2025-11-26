<script setup lang="ts">
import { useRouter } from 'vue-router'
import VButton from '@/components/common/VButton.vue'

const router = useRouter()

const goHome = () => {
    router.push('/')
}

const goBack = () => {
    router.back()
}
</script>

<template>
    <main class="container mx-auto px-4 py-16">
        <div class="max-w-2xl mx-auto text-center">
            <!-- 404 Illustration -->
            <div class="mb-8">
                <div class="text-9xl font-bold text-blue-600 mb-4">404</div>
                <div class="text-6xl mb-4">✈️</div>
            </div>

            <!-- Error Message -->
            <h1 class="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
            <p class="text-xl text-gray-600 mb-8">
                Oops! It looks like this flight has been cancelled or the destination doesn't exist.
            </p>
            <p class="text-gray-500 mb-12">
                The page you're looking for might have been removed, had its name changed, or is
                temporarily unavailable.
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <VButton @click="goBack" class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium">
                    ← Go Back
                </VButton>
                <VButton @click="goHome" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    🏠 Go to Home
                </VButton>
            </div>

            <!-- Helpful Links -->
            <div class="mt-16 pt-8 border-t border-gray-200">
                <p class="text-gray-600 mb-4">You might want to check out:</p>
                <div class="flex flex-wrap justify-center gap-4">
                    <router-link to="/flights" class="text-blue-600 hover:text-blue-800 hover:underline">
                        Browse Flights
                    </router-link>
                    <router-link to="/bookings" class="text-blue-600 hover:text-blue-800 hover:underline">
                        View Bookings
                    </router-link>
                    <router-link to="/airlines" class="text-blue-600 hover:text-blue-800 hover:underline">
                        Airlines
                    </router-link>
                    <router-link to="/airplanes" class="text-blue-600 hover:text-blue-800 hover:underline">
                        Airplanes
                    </router-link>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
@reference "@/assets/main.css";
</style>
