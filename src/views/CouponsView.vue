<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useCouponStore } from '@/stores/coupon/coupon.store'
import type { CouponDto } from '@/interfaces/loyalty.interface'
import { toast } from 'vue-sonner'

const couponStore = useCouponStore()

const form = reactive({
  id: '',
  name: '',
  description: '',
  points: 100,
  percentOff: 5
})

const isEditing = computed(() => Boolean(form.id))

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.description = ''
  form.points = 100
  form.percentOff = 5
  couponStore.selectCoupon(null)
}

const handleSubmit = async () => {
  if (!form.name) {
    toast.error('Coupon name is required')
    return
  }
  if (form.points <= 0) {
    toast.error('Points must be greater than 0')
    return
  }
  if (form.percentOff <= 0) {
    toast.error('Discount must be greater than 0')
    return
  }

  const payload = {
    name: form.name,
    description: form.description,
    points: Number(form.points),
    percentOff: Number(form.percentOff)
  }

  if (isEditing.value) {
    await couponStore.updateCoupon(form.id, payload)
  } else {
    await couponStore.createCoupon(payload)
  }

  resetForm()
}

const handleEdit = (coupon: CouponDto) => {
  form.id = coupon.id
  form.name = coupon.name
  form.description = coupon.description ?? ''
  form.points = coupon.points
  form.percentOff = coupon.percentOff
  couponStore.selectCoupon(coupon.id)
}

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this coupon?')) {
    await couponStore.deleteCoupon(id)
  }
}

const totalPointsValue = computed(() => couponStore.coupons.reduce((sum, coupon) => sum + coupon.points, 0))

onMounted(() => {
  couponStore.fetchCoupons()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 space-y-8">
    <section class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-wide text-indigo-600 font-semibold">Coupons</p>
        <h1 class="text-3xl font-bold text-gray-900">Coupon Catalog</h1>
        <p class="text-gray-500">Create and maintain loyalty coupons that customers can purchase with their points.</p>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <p class="text-sm font-semibold text-gray-900">{{ isEditing ? 'Update' : 'Create' }} Coupon</p>
          <p class="text-xs text-gray-500">Provide details for the reward you want to offer.</p>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Name</label>
          <input v-model="form.name" type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="e.g. Winter Escape 20%" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="form.description" rows="3"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Share promotion context"></textarea>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Points Required</label>
            <input v-model.number="form.points" type="number" min="1"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Percent Off</label>
            <input v-model.number="form.percentOff" type="number" min="1" max="100"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button type="submit"
            class="flex-1 rounded-lg bg-indigo-600 text-white py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
            :disabled="couponStore.saving">
            {{ couponStore.saving ? 'Saving...' : isEditing ? 'Update Coupon' : 'Create Coupon' }}
          </button>
          <button type="button" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="resetForm">
            Reset
          </button>
        </div>
      </form>

      <section class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <header class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Existing Coupons</h2>
            <p class="text-sm text-gray-500">{{ couponStore.coupons.length }} total coupons • {{ totalPointsValue }} pts
              combined</p>
          </div>
          <button class="text-sm font-semibold text-indigo-600 hover:text-indigo-500" :disabled="couponStore.loading"
            @click="couponStore.fetchCoupons()">
            Refresh
          </button>
        </header>
        <div v-if="couponStore.loading" class="py-8 text-center text-gray-500">
          Loading coupons...
        </div>
        <div v-else-if="couponStore.coupons.length" class="space-y-4">
          <article v-for="coupon in couponStore.coupons" :key="coupon.id"
            class="border border-gray-100 rounded-lg p-4 hover:border-indigo-200 transition">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-lg font-semibold text-gray-900">{{ coupon.name }}</p>
                <p class="text-sm text-gray-500">{{ coupon.description || 'No description provided' }}</p>
                <p class="text-xs text-gray-400 mt-2">Created: {{ coupon.createdDate ? new
                  Date(coupon.createdDate).toLocaleString() : '—' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">Points</p>
                <p class="text-2xl font-bold text-gray-900">{{ coupon.points }}</p>
                <p class="text-sm text-green-600">{{ coupon.percentOff }}% off</p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between">
              <p class="text-xs text-gray-500">ID: {{ coupon.id }}</p>
              <div class="flex items-center gap-3">
                <button class="text-sm font-semibold text-red-600 hover:text-red-500" @click="handleDelete(coupon.id)">
                  Delete
                </button>
                <button class="text-sm font-semibold text-indigo-600 hover:text-indigo-500" @click="handleEdit(coupon)">
                  Edit Coupon
                </button>
              </div>
            </div>
          </article>
        </div>
        <p v-else class="text-sm text-gray-500">No coupons yet. Create your first coupon using the form.</p>
      </section>
    </section>
  </div>
</template>
