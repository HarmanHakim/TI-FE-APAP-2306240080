import HomeView from '@/views/HomeView.vue'
import StatisticsView from '@/views/StatisticsView.vue'
import AirlineView from '@/views/airline/AirlineView.vue'
import CreateAirlineView from '@/views/airline/CreateAirlineView.vue'
import EditAirlineView from '@/views/airline/EditAirlineView.vue'
import AirplaneView from '@/views/airplane/AirplaneView.vue'
import CreateAirplaneView from '@/views/airplane/CreateAirplaneView.vue'
import EditAirplaneView from '@/views/airplane/EditAirplaneView.vue'
import BookingView from '@/views/booking/BookingView.vue'
import CreateBookingView from '@/views/booking/CreateBookingView.vue'
import DetailBookingView from '@/views/booking/DetailBookingView.vue'
import EditBookingView from '@/views/booking/EditBookingView.vue'
import CreateFlightView from '@/views/flight/CreateFlightView.vue'
import DetailFlightView from '@/views/flight/DetailFlightView.vue'
import EditFlightView from '@/views/flight/EditFlightView.vue'
import FlightView from '@/views/flight/FlightView.vue'
import CouponsView from '@/views/CouponsView.vue'
import LoyaltyDashboardView from '@/views/LoyaltyDashboardView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/airlines',
      name: 'airlines',
      component: AirlineView,
    },
    {
      path: '/airlines/add',
      name: 'create-airline',
      component: CreateAirlineView,
    },
    {
      path: '/airlines/:id/edit',
      name: 'edit-airline',
      component: EditAirlineView,
    },
    {
      path: '/airplanes',
      name: 'airplanes',
      component: AirplaneView,
    },
    {
      path: '/airplanes/add',
      name: 'create-airplane',
      component: CreateAirplaneView,
    },
    {
      path: '/airplanes/:id/edit',
      name: 'edit-airplane',
      component: EditAirplaneView,
    },
    {
      path: '/flights',
      name: 'flights',
      component: FlightView,
    },
    {
      path: '/flights/add',
      name: 'create-flight',
      component: CreateFlightView,
    },
    {
      path: '/flights/:id',
      name: 'detail-flight',
      component: DetailFlightView,
    },
    {
      path: '/flights/:id/edit',
      name: 'edit-flight',
      component: EditFlightView,
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: BookingView,
    },
    {
      path: '/bookings/add',
      name: 'create-booking',
      component: CreateBookingView,
    },
    {
      path: '/bookings/:id',
      name: 'detail-booking',
      component: DetailBookingView,
    },
    {
      path: '/bookings/:id/edit',
      name: 'edit-booking',
      component: EditBookingView,
    },
    {
      path: '/coupons',
      name: 'coupons',
      component: CouponsView,
    },
    {
      path: '/loyalty',
      name: 'loyalty',
      component: LoyaltyDashboardView,
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router
