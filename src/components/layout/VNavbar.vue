<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const getLinkClass = (path: string) => route.path === path ? 'text-pink-600' : 'text-black hover:text-pink-600'
</script>

<template>
    <header class="fixed top-0 left-0 flex items-center w-full gap-4 px-3 py-4 bg-white z-50">
        <RouterLink to="/" class="text-xl font-bold text-pink-600">SiDating</RouterLink>
        <nav class="flex gap-4">
            <RouterLink to="/profiles" :class="getLinkClass('/profiles')">Profile</RouterLink>
            <RouterLink to="/posts" :class="getLinkClass('/post')">Post</RouterLink>
        </nav>
    </header>
</template>