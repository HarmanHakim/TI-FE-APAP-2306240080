export interface CouponDto {
  id: string
  name: string
  description?: string | null
  points: number
  percentOff: number
  createdDate?: string
  updatedDate?: string
}

export interface CreateCouponDto {
  name: string
  description?: string
  points: number
  percentOff: number
}

export interface UpdateCouponDto extends CreateCouponDto {}

export interface LoyaltyPointsDto {
  customerId: string
  points: number
}

export interface PurchasedCouponDto {
  id: string
  code: string
  customerId: string
  couponId: string
  couponName?: string | null
  points?: number | null
  percentOff?: number | null
  purchasedDate?: string
  usedDate?: string | null
}

export interface LoyaltyDashboardDto {
  customerId: string
  balance: LoyaltyPointsDto
  purchasedCoupons: PurchasedCouponDto[]
  availableCoupons: CouponDto[]
  totalPurchasedCoupons: number
  activeCoupons: number
  redeemedCoupons: number
  availableCouponCount: number
}

export interface AddPointsRequestDto {
  customerId: string
  points: number
  reference?: string
}

export interface PurchaseCouponRequestDto {
  customerId: string
  couponId: string
}

export interface RedeemCouponRequestDto {
  customerId: string
  code: string
}

export interface RedeemCouponResponseDto {
  code: string
  customerId: string
  couponId: string
  percentOff: number
  valid: boolean
}
