export interface ReadSeatDto {
  id: number;
  classFlightId: number;
  classType: string;
  flightId: string;
  seatNumber: string;
  isAvailable: boolean;
  passengerId?: string;
  passengerName?: string;
}

export interface CreateSeatDto {
  classFlightId: number;
  seatNumber: string; // max 10 chars
  passengerId?: string;
}

export interface UpdateSeatDto {
  id: number;
  classFlightId: number;
  seatNumber: string; // max 10 chars
  isAvailable: boolean;
  passengerId?: string;
}

export interface SeatQueryParams {
  classFlightId?: number;
  isAvailable?: boolean;
}
