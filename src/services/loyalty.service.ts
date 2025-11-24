import type { CommonResponseInterface } from '@/interfaces/common.response.interface'
import type {
  AddPointsRequestDto,
  CouponDto,
  LoyaltyDashboardDto,
  LoyaltyPointsDto,
  PurchaseCouponRequestDto,
  PurchasedCouponDto,
  RedeemCouponRequestDto,
  RedeemCouponResponseDto
} from '@/interfaces/loyalty.interface'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const LOYALTY_BASE_URL = `${API_BASE_URL}/loyalty`

export class LoyaltyService {
  private static instance: LoyaltyService

  public static getInstance(): LoyaltyService {
    if (!LoyaltyService.instance) {
      LoyaltyService.instance = new LoyaltyService()
    }
    return LoyaltyService.instance
  }

  async getDashboard(customerId: string): Promise<CommonResponseInterface<LoyaltyDashboardDto>> {
    const response = await axios.get(`${LOYALTY_BASE_URL}/customers/${customerId}/dashboard`)
    return response.data
  }

  async getBalance(customerId: string): Promise<CommonResponseInterface<LoyaltyPointsDto>> {
    const response = await axios.get(`${LOYALTY_BASE_URL}/customers/${customerId}/balance`)
    return response.data
  }

  async getPurchasedCoupons(customerId: string): Promise<CommonResponseInterface<PurchasedCouponDto[]>> {
    const response = await axios.get(`${LOYALTY_BASE_URL}/customers/${customerId}/purchased-coupons`)
    return response.data
  }

  async getAvailableCoupons(): Promise<CommonResponseInterface<CouponDto[]>> {
    const response = await axios.get(`${LOYALTY_BASE_URL}/coupons/available`)
    return response.data
  }

  async addPoints(request: AddPointsRequestDto, apiKey: string): Promise<CommonResponseInterface<LoyaltyPointsDto>> {
    const response = await axios.post(`${LOYALTY_BASE_URL}/points`, request, {
      headers: {
        'X-API-KEY': apiKey
      }
    })
    return response.data
  }

  async purchaseCoupon(request: PurchaseCouponRequestDto): Promise<CommonResponseInterface<PurchasedCouponDto>> {
    const response = await axios.post(`${LOYALTY_BASE_URL}/coupons/purchase`, request)
    return response.data
  }

  async redeemCoupon(
    request: RedeemCouponRequestDto,
    apiKey: string
  ): Promise<CommonResponseInterface<RedeemCouponResponseDto>> {
    const response = await axios.post(`${LOYALTY_BASE_URL}/coupons/redeem`, request, {
      headers: {
        'X-API-KEY': apiKey
      }
    })
    return response.data
  }

  async generateData(): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/generate-data`)
    return response.data
  }
}

export const loyaltyService = LoyaltyService.getInstance()
