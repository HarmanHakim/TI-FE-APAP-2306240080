import { defineStore } from 'pinia';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

interface User {
    id: string;
    username: string;
    role: string;
    email: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: localStorage.getItem('token'),
        user: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'Superadmin',
        isCustomer: (state) => state.user?.role === 'Customer',
        isAirline: (state) => state.user?.role === 'Flight Airline',
    },
    actions: {
        setToken(token: string) {
            this.token = token;
            localStorage.setItem('token', token);
            this.decodeToken(token);
        },
        decodeToken(token: string) {
            try {
                const decoded: any = jwtDecode(token);
                this.user = {
                    id: decoded.id,
                    username: decoded.sub, // 'sub' usually holds the username
                    role: decoded.role,
                    email: decoded.email
                };
            } catch (error) {
                console.error("Invalid token", error);
                this.logout();
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            // Redirect to login or home
            window.location.href = '/login';
        },
        initialize() {
            if (this.token) {
                this.decodeToken(this.token);
            }
        }
    },
});
