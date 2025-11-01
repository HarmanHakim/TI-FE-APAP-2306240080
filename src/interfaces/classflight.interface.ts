export interface ReadClassFlightDto {
  id: number;
  flightId: string;
  flightNumber: string;
  classType: string;
  seatCapacity: number;
  availableSeats: number;
  price: number;
}

export interface CreateClassFlightDto {
  flightId: string;
  classType: string; // max 50 chars
  seatCapacity: number; // >= 1
  price: number; // >= 0
}

export interface UpdateClassFlightDto {
  id: number;
  flightId: string;
  classType: string; // max 50 chars
  seatCapacity: number; // >= 1
  availableSeats: number; // >= 0
  price: number; // >= 0
}
