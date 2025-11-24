import { defineStore } from 'pinia'
import { couponService } from '@/services/coupon.service'
import { toast } from 'vue-sonner'
import type { CouponDto, CreateCouponDto, UpdateCouponDto } from '@/interfaces/loyalty.interface'

export const useCouponStore = defineStore('coupon', {
  state: () => ({
    coupons: [] as CouponDto[],
    loading: false,
    saving: false,
    error: null as string | null,
    selectedCouponId: null as string | null,
  }),
  getters: {
    selectedCoupon(state): CouponDto | null {
      return state.coupons.find(coupon => coupon.id === state.selectedCouponId) ?? null
    }
  },
  actions: {
    selectCoupon(id: string | null) {
      this.selectedCouponId = id
    },
    async fetchCoupons() {
      this.loading = true
      this.error = null

      try {
        const response = await couponService.getCoupons()
        this.coupons = response.data
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to load coupons'
        this.error = message
        toast.error(message)
      } finally {
        this.loading = false
      }
    },
    async createCoupon(payload: CreateCouponDto) {
      this.saving = true
      this.error = null

      try {
        const response = await couponService.createCoupon(payload)
        this.coupons.unshift(response.data)
        toast.success('Coupon created successfully')
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to create coupon'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },
    async updateCoupon(id: string, payload: UpdateCouponDto) {
      this.saving = true
      this.error = null

      try {
        const response = await couponService.updateCoupon(id, payload)
        const index = this.coupons.findIndex(coupon => coupon.id === id)
        if (index !== -1) {
          this.coupons[index] = response.data
        }
        toast.success('Coupon updated successfully')
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to update coupon'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.saving = false
      }
    },
    async deleteCoupon(id: string) {
      this.loading = true
      this.error = null

      try {
        await couponService.deleteCoupon(id)
        this.coupons = this.coupons.filter(coupon => coupon.id !== id)
        toast.success('Coupon deleted successfully')
        if (this.selectedCouponId === id) {
          this.selectedCouponId = null
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to delete coupon'
        this.error = message
        toast.error(message)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
