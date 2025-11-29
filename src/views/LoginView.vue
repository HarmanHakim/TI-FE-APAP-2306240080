<template>
  <div class="login-container">
    <BaseCard class="login-card">
      <h1>Login</h1>
      <p class="subtitle">Travel APAP Management System</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <BaseInput
          v-model="username"
          label="Username"
          type="text"
          placeholder="Enter your username"
          required
        />

        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <BaseButton type="submit" :disabled="loading" class="login-button">
          {{ loading ? 'Logging in...' : 'Login' }}
        </BaseButton>
      </form>
    </BaseCard>
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
      router.push('/flights')
    } else if (role === 'CUSTOMER') {
      router.push('/bookings')
    } else if (role === 'RENTAL_VENDOR') {
      router.push('/flights')
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
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 32px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #fcc;
  font-size: 14px;
}

.login-button {
  margin-top: 10px;
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
}
</style>
