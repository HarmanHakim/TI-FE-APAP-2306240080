<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import VNavbar from './components/layout/VNavbar.vue';
</script>

<template>
  <Toaster position="top-center" richColors />
  <VNavbar />
  <main class="pt-16 md:pt-20 w-full min-h-screen">
    <RouterView />
  </main>
</template>
