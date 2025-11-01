<script setup lang="ts">
import { ref, computed, watch, onMounted, type PropType } from 'vue'
import VDropdown from '../common/VDropdown.vue'
import type { Post } from '@/interfaces/post.interface'
import { usePostStore } from '@/stores/post/post.store'
import { useUserProfileStore } from '@/stores/profile/profile.store'
import type { UserProfile } from '@/interfaces/profile.interface'

const postStore = usePostStore()
const profileStore = useUserProfileStore()

const props = defineProps({
  modelValue: {
    type: Object as PropType<{ user: string, sort: string }>,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'filtered'])

const profiles = ref<UserProfile[]>([])
const isLoadingProfiles = ref(false)
const posts = ref<Post[]>([])

const filterModel = ref({
  user: props.modelValue.user || '',
  sort: props.modelValue.sort || 'desc'
})

const userOptions = computed(() => [
  { value: '', label: 'All Users' },
  ...profiles.value.map(user => ({ 
    value: user.id, 
    label: `${user.name} (${user.nickname})` 
  }))
])

const sortOptions = [
  { value: 'desc', label: 'Newest First' },
  { value: 'asc', label: 'Oldest First' }
]

const fetchFilteredPosts = async () => {
  const userId = filterModel.value.user || undefined
  
  const result = await postStore.fetchPosts(userId) 
  posts.value = result ?? []
  
  if (posts.value.length > 0) {
    posts.value.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return filterModel.value.sort === 'desc' ? dateB - dateA : dateA - dateB
    })
  }
  
  emit('filtered', posts.value)
}

watch(filterModel, async () => {
  emit('update:modelValue', filterModel.value)
  await fetchFilteredPosts()
}, { deep: true })

onMounted(async () => {
  // Load user profiles
  try {
    isLoadingProfiles.value = true
    const result = await profileStore.fetchProfiles()
    profiles.value = result ?? []
  } catch (error) {
    console.error('Failed to load profiles:', error)
  } finally {
    isLoadingProfiles.value = false
  }
  
  // Load initial posts
  await fetchFilteredPosts()
})
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
    <div class="flex-1">
      <VDropdown 
        id="user-filter" 
        name="user-filter" 
        label="Filter by User"
        v-model="filterModel.user"
        :options="userOptions"
        :disabled="isLoadingProfiles"
        placeholder="All Users"
      />
    </div>
    
    <div class="flex-1">
      <VDropdown 
        id="sort-filter" 
        name="sort-filter" 
        label="Sort by Date"
        v-model="filterModel.sort"
        :options="sortOptions"
      />
    </div>
  </div>
</template>

<style scoped>
</style>