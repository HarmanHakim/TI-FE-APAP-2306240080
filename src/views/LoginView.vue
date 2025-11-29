<template>
  <div class="login-container">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
    </div>

    <div class="relative login-card">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <div class="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
      </div>

      <h1
        class="text-center text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome Back
      </h1>
      <p class="subtitle">Sign in to Flight Apap Management System</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>

        <BaseInput v-model="username" label="Username" type="text" placeholder="Enter your username" required />

        <BaseInput v-model="password" label="Password" type="password" placeholder="Enter your password" required />

        <BaseButton type="submit" :disabled="loading" class="login-button">
          <span v-if="!loading">Sign In</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            Signing in...
          </span>
        </BaseButton>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        <p>© 2025 Flight Apap. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BaseCard, BaseInput, BaseButton } from '@/components/common'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(username.value, password.value)

    // Redirect based on role
    const role = authStore.userRole
    if (role === 'SUPERADMIN') {
      router.push('/')
    } else if (role === 'CUSTOMER') {
      router.push('/')
    } else if (role === 'FLIGHT_AIRLINE') {
      router.push('/')
    } else {
      router.push('/')
    }
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 48px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
  font-size: 15px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
  color: #c33;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #fcc;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.login-button {
  margin-top: 10px;
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
