import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
    id: string
    username: string
    name: string
    email: string
    role: string
    gender?: string
    saldo?: number
    phone?: string
    locations?: string[]
}

interface LoginResponse {
    status: number
    message: string
    timestamp: string
    data: {
        token: string
        id: string
        username: string
        name: string
        email: string
        role: string
        gender?: string
        saldo?: number
        phone?: string
        locations?: string[]
    }
}

export const useAuthStore = defineStore('auth', () => {
    // Safe initialization from localStorage with try-catch
    let storedToken: string | null = null
    let storedUser: string | null = null

    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            storedToken = localStorage.getItem('token')
            storedUser = localStorage.getItem('user')
        }
    } catch (error) {
        console.error('Error reading from localStorage:', error)
    }

    const token = ref<string | null>(storedToken)
    const user = ref<User | null>(storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null)

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const userRole = computed(() => user.value?.role || null)

    async function login(username: string, password: string) {
        try {
            console.log('🔵 Starting login process...')
            console.log('🔵 localStorage available?', typeof localStorage !== 'undefined')

            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Login failed')
            }

            const data: LoginResponse = await response.json()

            console.log('=== LOGIN RESPONSE DEBUG ===')
            console.log('Full response:', JSON.stringify(data, null, 2))
            console.log('============================')

            // Validate response structure
            if (!data.data || !data.data.token) {
                throw new Error('Invalid login response format: missing token')
            }

            // Extract token
            const tokenValue = data.data.token

            // Build user object from data.data properties
            const userData: User = {
                id: data.data.id,
                username: data.data.username,
                name: data.data.name,
                email: data.data.email,
                role: data.data.role,
                gender: data.data.gender,
                saldo: data.data.saldo,
                phone: data.data.phone,
                locations: data.data.locations
            }

            console.log('Extracted token:', tokenValue)
            console.log('Extracted user:', userData)
            console.log('User role:', userData.role)

            // Validate user data
            if (!userData.role) {
                throw new Error('User role is missing from response')
            }

            console.log('🔵 About to save to localStorage...')
            console.log('🔵 Current localStorage length:', localStorage.length)

            // Save token and user to store and localStorage
            token.value = tokenValue
            user.value = userData

            try {
                localStorage.setItem('token', tokenValue)
                console.log('🔵 Token saved to localStorage')
                localStorage.setItem('user', JSON.stringify(userData))
                console.log('🔵 User saved to localStorage')
            } catch (storageError) {
                console.error('❌ localStorage error:', storageError)
                throw new Error('Failed to save to localStorage: ' + storageError)
            }

            console.log('✅ Login successful')
            console.log('🔵 localStorage.length after save:', localStorage.length)
            console.log('🔵 Token exists in localStorage:', !!localStorage.getItem('token'))
            console.log('🔵 Token value from localStorage:', localStorage.getItem('token')?.substring(0, 50) + '...')
            console.log('🔵 User from localStorage:', localStorage.getItem('user'))
            console.log('🔵 Store token.value:', token.value?.substring(0, 50) + '...')
            console.log('🔵 Store user.value:', user.value)

            return data
        } catch (error) {
            console.error('❌ Login error:', error)
            throw error
        }
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    function hasRole(...roles: string[]): boolean {
        if (!user.value) {
            console.log('hasRole: No user found')
            return false
        }
        const hasIt = roles.includes(user.value.role)
        console.log(`hasRole check: ${user.value.role} in [${roles.join(', ')}] = ${hasIt}`)
        return hasIt
    }

    function hasAnyRole(...roles: string[]): boolean {
        return hasRole(...roles)
    }

    function getAuthHeader(): string {
        return token.value ? `Bearer ${token.value}` : ''
    }

    return {
        token,
        user,
        isAuthenticated,
        userRole,
        login,
        logout,
        hasRole,
        hasAnyRole,
        getAuthHeader,
    }
})
