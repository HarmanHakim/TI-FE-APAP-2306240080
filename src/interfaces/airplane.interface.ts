export interface ReadAirplaneDto {
  id: string;
  airlineId: string;
  airlineName: string;
  model: string;
  seatCapacity: number;
  manufactureYear: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateAirplaneDto {
  airlineId: string; // 3 characters
  model: string;
  seatCapacity: number; // > 0
  manufactureYear: number; // >= 1900, <= current year
}

export interface UpdateAirplaneDto {
  id: string;
  airlineId: string; // 3 characters
  model: string;
  seatCapacity: number; // > 0
  manufactureYear: number; // >= 1900, <= current year
}

export interface AirplaneQueryParams {
  airlineId?: string;
  model?: string;
  manufactureYear?: number;
  isDeleted?: boolean;
}
