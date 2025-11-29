<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty/loyalty.store'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const loyaltyStore = useLoyaltyStore()
const authStore = useAuthStore()

const customerIdInput = ref(loyaltyStore.customerId)

// Search and filter state
const availableCouponsSearch = ref('')
const availableCouponsSortBy = ref<'name' | 'points' | 'percentOff'>('points')

const purchasedCouponsSearch = ref('')
const purchasedCouponsSortBy = ref<'purchasedDate' | 'percentOff' | 'name'>('purchasedDate')
const purchasedCouponsFilter = ref<'all' | 'active' | 'redeemed'>('all')

const addPointsForm = reactive({
  customerId: loyaltyStore.customerId,
  points: 100,
  reference: '',
  apiKey: ''
})

const purchaseForm = reactive({
  customerId: loyaltyStore.customerId,
  couponId: ''
})

const redeemForm = reactive({
  customerId: loyaltyStore.customerId,
  code: '',
  apiKey: ''
})

const hasDashboardData = computed(() => Boolean(loyaltyStore.dashboard))
const activeCoupons = computed(() => loyaltyStore.purchasedCoupons.filter(coupon => !coupon.usedDate))
const redeemedCoupons = computed(() => loyaltyStore.purchasedCoupons.filter(coupon => coupon.usedDate))

const isSuperAdmin = computed(() => authStore.hasRole('SUPERADMIN'))
const isCustomer = computed(() => authStore.hasRole('CUSTOMER'))

const syncCustomerId = (customerId?: string) => {
  addPointsForm.customerId = customerId || ''
  purchaseForm.customerId = customerId || ''
  redeemForm.customerId = customerId || ''
  if (!purchaseForm.couponId && loyaltyStore.availableCoupons.length > 0) {
    purchaseForm.couponId = loyaltyStore.availableCoupons[0].id
  }
}

watch(
  () => loyaltyStore.customerId,
  value => {
    customerIdInput.value = value
    syncCustomerId(value)
  }
)

watch(
  () => loyaltyStore.availableCoupons,
  coupons => {
    if (!coupons.length) {
      purchaseForm.couponId = ''
      return
    }
    if (!purchaseForm.couponId || !coupons.some(coupon => coupon.id === purchaseForm.couponId)) {
      purchaseForm.couponId = coupons[0].id
    }
  },
  { deep: true }
)

const handleLoadDashboard = async () => {
  if (!customerIdInput.value) {
    toast.error('Please provide a customer ID')
    return
  }
  await loyaltyStore.loadDashboard(customerIdInput.value)
}

const handleAddPoints = async () => {
  if (!addPointsForm.customerId) {
    toast.error('Customer ID is required to add points')
    return
  }
  if (!addPointsForm.apiKey) {
    toast.error('API key is required')
    return
  }
  await loyaltyStore.addPoints(
    {
      customerId: addPointsForm.customerId,
      points: Number(addPointsForm.points),
      reference: addPointsForm.reference
    },
    addPointsForm.apiKey
  )
}

const handlePurchase = async () => {
  if (!purchaseForm.customerId) {
    toast.error('Customer ID is required to purchase a coupon')
    return
  }
  if (!purchaseForm.couponId) {
    toast.error('Please select a coupon to purchase')
    return
  }
  await loyaltyStore.purchaseCoupon({
    customerId: purchaseForm.customerId,
    couponId: purchaseForm.couponId
  })
}

const handleRedeem = async () => {
  if (!redeemForm.customerId) {
    toast.error('Customer ID is required to redeem a coupon')
    return
  }
  if (!redeemForm.code) {
    toast.error('Coupon code is required')
    return
  }
  if (!redeemForm.apiKey) {
    toast.error('API key is required')
    return
  }
  await loyaltyStore.redeemCoupon(
    {
      customerId: redeemForm.customerId,
      code: redeemForm.code.trim()
    },
    redeemForm.apiKey
  )
  redeemForm.code = ''
}

const handleGenerateData = async () => {
  try {
    await loyaltyStore.generateData()
    toast.success('Dummy data generated successfully')
    if (customerIdInput.value) {
      await loyaltyStore.loadDashboard(customerIdInput.value)
    }
  } catch (error) {
    toast.error('Failed to generate data')
  }
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—'
  }
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

// Filtered and sorted available coupons
const filteredAndSortedAvailableCoupons = computed(() => {
  let result = [...loyaltyStore.availableCoupons]

  // Apply search filter
  if (availableCouponsSearch.value.trim()) {
    const query = availableCouponsSearch.value.toLowerCase()
    result = result.filter(
      (coupon) =>
        coupon.name.toLowerCase().includes(query) ||
        (coupon.description && coupon.description.toLowerCase().includes(query))
    )
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (availableCouponsSortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'points':
        return b.points - a.points // Descending (most expensive first)
      case 'percentOff':
        return b.percentOff - a.percentOff // Descending (highest discount first)
      default:
        return 0
    }
  })

  return result
})

// Filtered and sorted purchased coupons
const filteredAndSortedPurchasedCoupons = computed(() => {
  let result = [...loyaltyStore.purchasedCoupons]

  // Apply status filter
  if (purchasedCouponsFilter.value === 'active') {
    result = result.filter(coupon => !coupon.usedDate)
  } else if (purchasedCouponsFilter.value === 'redeemed') {
    result = result.filter(coupon => coupon.usedDate)
  }

  // Apply search filter
  if (purchasedCouponsSearch.value.trim()) {
    const query = purchasedCouponsSearch.value.toLowerCase()
    result = result.filter(
      (coupon) =>
        (coupon.couponName && coupon.couponName.toLowerCase().includes(query)) ||
        coupon.code.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (purchasedCouponsSortBy.value) {
      case 'purchasedDate':
        if (!a.purchasedDate) return 1
        if (!b.purchasedDate) return -1
        return new Date(b.purchasedDate).getTime() - new Date(a.purchasedDate).getTime() // Newest first
      case 'percentOff':
        return (b.percentOff ?? 0) - (a.percentOff ?? 0) // Descending
      case 'name':
        const nameA = a.couponName ?? a.code
        const nameB = b.couponName ?? b.code
        return nameA.localeCompare(nameB)
      default:
        return 0
    }
  })

  return result
})

onMounted(() => {
  // If customer, auto-load their dashboard
  if (isCustomer.value && authStore.user?.id) {
    customerIdInput.value = authStore.user.id
    loyaltyStore.loadDashboard(authStore.user.id)
  } else if (loyaltyStore.customerId) {
    loyaltyStore.loadDashboard()
  }
})

syncCustomerId(loyaltyStore.customerId)
</script>

<template>
  <div class="container mx-auto px-4 py-8 space-y-8">
    <section class="bg-white shadow-sm rounded-xl p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Loyalty</p>
          <h1 class="text-3xl font-bold text-gray-900">Customer Loyalty Dashboard</h1>
          <p class="text-gray-500 mt-1">Track balances, manage coupons, and help customers redeem their rewards.</p>
        </div>

        <!-- Customer ID Input - Only visible/editable for Superadmin -->
        <div v-if="isSuperAdmin" class="flex flex-col gap-3 md:flex-row md:items-center">
          <input v-model="customerIdInput" type="text" placeholder="Customer UUID"
            class="w-full md:w-80 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <button
            class="inline-flex justify-center items-center rounded-lg bg-indigo-600 text-white px-6 py-2 font-semibold shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            :disabled="loyaltyStore.loading || !customerIdInput" @click="handleLoadDashboard">
            {{ loyaltyStore.loading ? 'Loading...' : hasDashboardData ? 'Refresh' : 'Load Dashboard' }}
          </button>
        </div>
      </div>
      <p v-if="loyaltyStore.error" class="text-sm text-red-600 mt-4">{{ loyaltyStore.error }}</p>
    </section>

    <section v-if="loyaltyStore.loading" class="bg-white rounded-xl shadow-sm p-12 text-center">
      <div class="inline-flex flex-col items-center gap-3 text-gray-500">
        <span class="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
        <p>Loading loyalty data...</p>
      </div>
    </section>

    <section v-else-if="hasDashboardData" class="space-y-8">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article class="bg-white rounded-xl shadow-sm p-5 border border-indigo-50">
          <p class="text-sm text-gray-500">Available Points</p>
          <p class="text-4xl font-bold text-indigo-600 mt-2">{{ loyaltyStore.balance?.points ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-1">Customer ID: {{ loyaltyStore.dashboard?.customerId }}</p>
        </article>
        <article class="bg-white rounded-xl shadow-sm p-5 border border-green-50">
          <p class="text-sm text-gray-500">Active Coupons</p>
          <p class="text-4xl font-bold text-green-600 mt-2">{{ loyaltyStore.dashboard?.activeCoupons ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-1">Ready to redeem</p>
        </article>
        <article class="bg-white rounded-xl shadow-sm p-5 border border-amber-50">
          <p class="text-sm text-gray-500">Redeemed Coupons</p>
          <p class="text-4xl font-bold text-amber-500 mt-2">{{ loyaltyStore.dashboard?.redeemedCoupons ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-1">Successfully used</p>
        </article>
        <article class="bg-white rounded-xl shadow-sm p-5 border border-purple-50">
          <p class="text-sm text-gray-500">Available Offers</p>
          <p class="text-4xl font-bold text-purple-600 mt-2">{{ loyaltyStore.dashboard?.availableCouponCount ?? 0 }}</p>
          <p class="text-xs text-gray-400 mt-1">Curated for purchase</p>
        </article>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Add Points Form - Superadmin Only -->
        <form v-if="isSuperAdmin" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
          @submit.prevent="handleAddPoints">
          <div>
            <p class="text-sm font-semibold text-gray-900">Add Points</p>
            <p class="text-xs text-gray-500">Requires billing API key (X-API-KEY)</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Points</label>
            <input v-model.number="addPointsForm.points" type="number" min="1"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Reference</label>
            <input v-model="addPointsForm.reference" type="text" placeholder="Campaign or note"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Billing API Key</label>
            <input v-model="addPointsForm.apiKey" type="password"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required />
          </div>
          <button type="submit"
            class="w-full rounded-lg bg-indigo-600 text-white py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
            :disabled="loyaltyStore.actionLoading">
            {{ loyaltyStore.actionLoading ? 'Processing...' : 'Add Points' }}
          </button>
        </form>

        <!-- Purchase Form - Visible to All (Customer uses own points, Admin can test) -->
        <form class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
          @submit.prevent="handlePurchase">
          <div>
            <p class="text-sm font-semibold text-gray-900">Purchase Coupon</p>
            <p class="text-xs text-gray-500">Spends available points immediately</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Select Coupon</label>
            <select v-model="purchaseForm.couponId"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              <option value="" disabled>Select a coupon</option>
              <option v-for="coupon in loyaltyStore.availableCoupons" :key="coupon.id" :value="coupon.id">
                {{ coupon.name }} • {{ coupon.points }} pts
              </option>
            </select>
          </div>
          <button type="submit"
            class="w-full rounded-lg bg-green-600 text-white py-2 font-semibold hover:bg-green-500 disabled:opacity-60"
            :disabled="loyaltyStore.actionLoading || !loyaltyStore.availableCoupons.length">
            {{ loyaltyStore.actionLoading ? 'Processing...' : 'Purchase Coupon' }}
          </button>
        </form>

        <!-- Redeem Form - Superadmin Only -->
        <form v-if="isSuperAdmin" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
          @submit.prevent="handleRedeem">
          <div>
            <p class="text-sm font-semibold text-gray-900">Redeem Coupon</p>
            <p class="text-xs text-gray-500">Validate codes with billing API key</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Coupon Code</label>
            <input v-model="redeemForm.code" type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="ABCDEF-USER-1" required />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Billing API Key</label>
            <input v-model="redeemForm.apiKey" type="password"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required />
          </div>
          <button type="submit"
            class="w-full rounded-lg bg-amber-500 text-white py-2 font-semibold hover:bg-amber-400 disabled:opacity-60"
            :disabled="loyaltyStore.actionLoading">
            {{ loyaltyStore.actionLoading ? 'Processing...' : 'Redeem Coupon' }}
          </button>
        </form>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <header class="space-y-4 mb-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Available Coupons</h2>
                <p class="text-sm text-gray-500">{{ filteredAndSortedAvailableCoupons.length }} of {{
                  loyaltyStore.availableCoupons.length }} offers</p>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="flex-1">
                <input v-model="availableCouponsSearch" type="text" placeholder="Search available coupons..."
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div class="sm:w-48">
                <select v-model="availableCouponsSortBy"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="points">Sort by: Points</option>
                  <option value="percentOff">Sort by: Discount</option>
                  <option value="name">Sort by: Name</option>
                </select>
              </div>
            </div>
          </header>
          <div v-if="filteredAndSortedAvailableCoupons.length" class="space-y-4 max-h-[420px] overflow-y-auto pr-2">
            <article v-for="coupon in filteredAndSortedAvailableCoupons" :key="coupon.id"
              class="border border-gray-100 rounded-lg p-4 hover:border-indigo-200 transition">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-lg font-semibold text-gray-900">{{ coupon.name }}</p>
                  <p class="text-sm text-gray-500">{{ coupon.description || 'No description provided' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">Cost</p>
                  <p class="text-xl font-bold text-gray-900">{{ coupon.points }} pts</p>
                  <p class="text-xs text-green-600">{{ coupon.percentOff }}% off</p>
                </div>
              </div>
              <button
                class="mt-4 w-full rounded-lg border border-indigo-200 text-indigo-600 py-2 font-medium hover:bg-indigo-50"
                @click="purchaseForm.couponId = coupon.id; handlePurchase()">
                Purchase for {{ coupon.points }} pts
              </button>
            </article>
          </div>
          <p v-else-if="!loyaltyStore.availableCoupons.length" class="text-sm text-gray-500">No coupons available.
            Create one from the Coupons section.</p>
          <p v-else class="text-sm text-gray-500">No coupons match your search criteria.</p>
        </section>

        <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <header class="space-y-4 mb-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Purchased Coupons</h2>
                <p class="text-sm text-gray-500">{{ filteredAndSortedPurchasedCoupons.length }} of {{
                  loyaltyStore.purchasedCoupons.length }} entries</p>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="flex-1">
                <input v-model="purchasedCouponsSearch" type="text" placeholder="Search purchased coupons..."
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div class="sm:w-48">
                <select v-model="purchasedCouponsFilter"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="all">All Coupons</option>
                  <option value="active">Active Only</option>
                  <option value="redeemed">Redeemed Only</option>
                </select>
              </div>
              <div class="sm:w-48">
                <select v-model="purchasedCouponsSortBy"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="purchasedDate">Sort by: Newest</option>
                  <option value="percentOff">Sort by: Discount</option>
                  <option value="name">Sort by: Name</option>
                </select>
              </div>
            </div>
          </header>
          <div v-if="filteredAndSortedPurchasedCoupons.length" class="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            <article v-for="coupon in filteredAndSortedPurchasedCoupons" :key="coupon.id"
              class="border border-gray-100 rounded-lg p-4">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="text-lg font-semibold text-gray-900">{{ coupon.couponName ?? coupon.code }}</p>
                  <p class="text-sm text-gray-500">Code: <span class="font-mono tracking-wide">{{ coupon.code }}</span>
                  </p>
                  <p class="text-sm text-gray-500">Purchased: {{ formatDate(coupon.purchasedDate) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">Value</p>
                  <p class="text-xl font-bold text-gray-900">{{ coupon.percentOff ?? 0 }}%</p>
                  <p class="text-xs text-gray-400">Cost: {{ coupon.points ?? 0 }} pts</p>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between text-sm">
                <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                  :class="coupon.usedDate ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
                  {{ coupon.usedDate ? `Redeemed on ${formatDate(coupon.usedDate)}` : 'Active and unused' }}
                </span>
                <span class="text-xs text-gray-500">{{ coupon.couponId }}</span>
              </div>
            </article>
          </div>
          <p v-else-if="!loyaltyStore.purchasedCoupons.length" class="text-sm text-gray-500">No coupons purchased yet
            for this customer.</p>
          <p v-else class="text-sm text-gray-500">No coupons match your search or filter criteria.</p>
        </section>
      </div>

      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <header class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Coupon Activity</h2>
            <p class="text-sm text-gray-500">Snapshot of recent coupon lifecycle</p>
          </div>
        </header>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Active Coupons</h3>
            <ul class="space-y-3">
              <li v-for="coupon in activeCoupons" :key="coupon.id"
                class="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ coupon.couponName ?? coupon.code }}</p>
                  <p class="text-xs text-gray-500">Code {{ coupon.code }}</p>
                </div>
                <span class="text-xs font-semibold text-indigo-600">{{ coupon.percentOff ?? 0 }}% off</span>
              </li>
              <li v-if="!activeCoupons.length" class="text-sm text-gray-500">No active coupons.</li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Redeemed Coupons</h3>
            <ul class="space-y-3">
              <li v-for="coupon in redeemedCoupons" :key="coupon.id"
                class="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ coupon.couponName ?? coupon.code }}</p>
                  <p class="text-xs text-gray-500">Redeemed {{ formatDate(coupon.usedDate) }}</p>
                </div>
                <span class="text-xs font-semibold text-green-600">{{ coupon.percentOff ?? 0 }}% off</span>
              </li>
              <li v-if="!redeemedCoupons.length" class="text-sm text-gray-500">No coupons redeemed yet.</li>
            </ul>
          </div>
        </div>
      </section>
    </section>

    <section v-else class="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
      <p>No customer selected yet. Enter a customer ID above to load loyalty data.</p>
    </section>
  </div>
</template>
