import type { CommonResponseInterface } from '@/interfaces/common.response.interface'
import type { CouponDto, CreateCouponDto, UpdateCouponDto } from '@/interfaces/loyalty.interface'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const COUPON_BASE_URL = `${API_BASE_URL}/coupons`

export class CouponService {
  private static instance: CouponService

  public static getInstance(): CouponService {
    if (!CouponService.instance) {
      CouponService.instance = new CouponService()
    }
    return CouponService.instance
  }

  async getCoupons(): Promise<CommonResponseInterface<CouponDto[]>> {
    const response = await axios.get(COUPON_BASE_URL)
    return response.data
  }

  async getCoupon(id: string): Promise<CommonResponseInterface<CouponDto>> {
    const response = await axios.get(`${COUPON_BASE_URL}/${id}`)
    return response.data
  }

  async createCoupon(payload: CreateCouponDto): Promise<CommonResponseInterface<CouponDto>> {
    const response = await axios.post(COUPON_BASE_URL, payload)
    return response.data
  }

  async updateCoupon(id: string, payload: UpdateCouponDto): Promise<CommonResponseInterface<CouponDto>> {
    const response = await axios.put(`${COUPON_BASE_URL}/${id}`, payload)
    return response.data
  }

  async deleteCoupon(id: string): Promise<void> {
    await axios.delete(`${COUPON_BASE_URL}/${id}`)
  }
}

export const couponService = CouponService.getInstance()
