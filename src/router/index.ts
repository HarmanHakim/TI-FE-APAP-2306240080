import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '@/views/profile/ProfileView.vue'
import CreateProfileView from '@/views/profile/CreateProfileView.vue'
import EditProfileView from '@/views/profile/EditProfileView.vue'
import DetailProfileView from '@/views/profile/DetailProfileView.vue'
import PostView from '@/views/post/PostView.vue'
import CreatePostView from '@/views/post/CreatePostView.vue'
import EditPostView from '@/views/post/EditPostView.vue'
import DetailPostView from '@/views/post/DetailPostView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profiles',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/profiles/add',
      name: 'create-profile',
      component: CreateProfileView,
    },
    {
      path: '/profiles/:id/edit',
      name: 'edit-profile',
      component: EditProfileView,
    },
    {
      path: '/profiles/:id',
      name: 'detail-profile',
      component: DetailProfileView,
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostView,
    },
    {
      path: '/posts/add',
      name: 'create-post',
      component: CreatePostView,
    },
    {
      path: '/posts/:id/edit',
      name: 'edit-post',
      component: EditPostView,
    },
    {
      path: '/posts/:id',
      name: 'detail-post',
      component: DetailPostView,
    },
  ],
})

export default router
