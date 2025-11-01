export interface ClassFlightSummary {
  id: number;
  classType: string;
  seatCapacity: number;
  availableSeats: number;
}

export interface ReadFlightDto {
  id: string;
  airlineId: string;
  airlineName: string;
  airlineCountry: string;
  airplaneId: string;
  airplaneModel: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: Date;
  arrivalTime: Date;
  terminal?: string;
  gate?: string;
  baggageAllowance?: number;
  facilities?: string;
  status: number; // 1=Scheduled, 2=Delayed, 3=Departed, 4=Arrived, 5=Cancelled
  statusLabel: string;
  classes: ClassFlightSummary[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateFlightDto {
  id: string;
  airlineId: string; // 3 characters
  airplaneId: string;
  originAirportCode: string; // max 10 chars
  destinationAirportCode: string; // max 10 chars
  departureTime: Date | string;
  arrivalTime: Date | string;
  terminal?: string; // max 50 chars
  gate?: string; // max 50 chars
  baggageAllowance?: number; // >= 0
  facilities?: string;
}

export interface UpdateFlightDto {
  id: string;
  airlineId: string; // 3 characters
  airplaneId: string;
  originAirportCode: string; // max 10 chars
  destinationAirportCode: string; // max 10 chars
  departureTime: Date | string;
  arrivalTime: Date | string;
  terminal?: string; // max 50 chars
  gate?: string; // max 50 chars
  baggageAllowance?: number; // >= 0
  facilities?: string;
  status: number; // 1-5
}

export interface FlightQueryParams {
  origin?: string;
  destination?: string;
  departureDate?: string;
  airlineId?: string;
  status?: number;
}

export enum FlightStatus {
  Scheduled = 1,
  Delayed = 2,
  Departed = 3,
  Arrived = 4,
  Cancelled = 5
}
