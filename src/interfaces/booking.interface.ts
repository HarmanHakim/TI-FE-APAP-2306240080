export interface PassengerSummary {
  id: string;
  fullName: string;
  seatNumber: string;
}

export interface ReadBookingDto {
  id: string;
  flightId: string;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: Date;
  arrivalTime: Date;
  classFlightId: number;
  classType: string;
  contactEmail: string;
  contactPhone: string;
  passengerCount: number;
  status: number; // 1=Unpaid, 2=Paid, 3=Cancelled, 4=Rescheduled
  statusLabel: string;
  totalPrice: number;
  passengers: PassengerSummary[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateBookingDto {
  id: string;
  flightId: string;
  classFlightId: number;
  contactEmail: string; // max 255 chars
  contactPhone: string; // max 20 chars
  passengerCount: number; // >= 1, max 10
  totalPrice: number; // >= 0
  passengerIds: string[]; // min 1 item
}

export interface UpdateBookingDto {
  id: string;
  flightId: string;
  classFlightId: number;
  contactEmail: string; // max 255 chars
  contactPhone: string; // max 20 chars
  passengerCount: number; // >= 1
  status: number; // 1-4
  totalPrice: number; // >= 0
  passengerIds?: string[];
}

export interface BookingQueryParams {
  isActive?: boolean;
  status?: number;
  email?: string;
}

export enum BookingStatus {
  Unpaid = 1,
  Paid = 2,
  Cancelled = 3,
  Rescheduled = 4
}

export interface FlightStatistics {
  flightId: string;
  flightNumber: string;
  route: string;
  bookingCount: number;
  potentialRevenue: number;
}

export interface BookingStatistics {
  totalBookings: number;
  potentialRevenue: number;
  flightStats?: FlightStatistics[];
}
