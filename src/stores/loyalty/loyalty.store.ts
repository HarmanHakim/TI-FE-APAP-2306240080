import { defineStore } from 'pinia'
import { loyaltyService } from '@/services/loyalty.service'
import { toast } from 'vue-sonner'
import type {
  AddPointsRequestDto,
  LoyaltyDashboardDto,
  LoyaltyPointsDto,
  PurchaseCouponRequestDto,
  RedeemCouponRequestDto,
  RedeemCouponResponseDto
} from '@/interfaces/loyalty.interface'

const STORAGE_KEY = 'loyalty.selectedCustomerId'

const persistCustomerId = (customerId: string | null) => {
  if (typeof window === 'undefined') {
    return
  }
  if (customerId) {
    window.localStorage.setItem(STORAGE_KEY, customerId)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

const readCustomerId = () => {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.localStorage.getItem(STORAGE_KEY) ?? ''
}

export const useLoyaltyStore = defineStore('loyalty', {
  state: () => ({
    dashboard: null as LoyaltyDashboardDto | null,
    loading: false,
    actionLoading: false,
    error: null as string | null,
    customerId: readCustomerId(),
  }),
  getters: {
    balance(state): LoyaltyPointsDto | null {
      return state.dashboard?.balance ?? null
    },
    availableCoupons(state) {
      return state.dashboard?.availableCoupons ?? []
    },
    purchasedCoupons(state) {
      return state.dashboard?.purchasedCoupons ?? []
    },
    hasCustomerSelection(state): boolean {
      return Boolean(state.customerId)
    }
  },
  actions: {
    setCustomerId(customerId: string) {
      this.customerId = customerId
      persistCustomerId(customerId)
    },
    async loadDashboard(customerId?: string) {
      const targetCustomerId = customerId ?? this.customerId
      if (!targetCustomerId) {
        this.error = 'Customer ID is required'
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await loyaltyService.getDashboard(targetCustomerId)
        this.dashboard = response.data
        this.customerId = targetCustomerId
        persistCustomerId(targetCustomerId)
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to load dashboard'
        this.error = message
        toast.error(message)
      } finally {
        this.loading = false
      }
    },
    async addPoints(payload: AddPointsRequestDto, apiKey: string) {
      if (!apiKey) {
        toast.error('API key is required to add points')
        return
      }

      this.actionLoading = true
      try {
        await loyaltyService.addPoints(payload, apiKey)
        toast.success('Points added successfully')
        await this.loadDashboard(payload.customerId)
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to add points'
        toast.error(message)
      } finally {
        this.actionLoading = false
      }
    },
    async purchaseCoupon(payload: PurchaseCouponRequestDto) {
      this.actionLoading = true
      try {
        await loyaltyService.purchaseCoupon(payload)
        toast.success('Coupon purchased successfully')
        await this.loadDashboard(payload.customerId)
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to purchase coupon'
        toast.error(message)
      } finally {
        this.actionLoading = false
      }
    },
    async redeemCoupon(payload: RedeemCouponRequestDto, apiKey: string) {
      if (!apiKey) {
        toast.error('API key is required to redeem coupons')
        return
      }

      this.actionLoading = true
      try {
        const response = await loyaltyService.redeemCoupon(payload, apiKey)
        const data: RedeemCouponResponseDto = response.data
        if (data.valid) {
          toast.success(`Coupon ${data.code} redeemed!`)
        } else {
          toast.warning(`Coupon ${data.code} is not valid`)
        }
        await this.loadDashboard(payload.customerId)
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to redeem coupon'
        toast.error(message)
      } finally {
        this.actionLoading = false
      }
    },
    async generateData() {
      this.actionLoading = true
      try {
        await loyaltyService.generateData()
      } finally {
        this.actionLoading = false
      }
    }
  }
})
