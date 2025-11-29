export interface FlightReminderDto {
    flightNumber: string
    airline: string
    origin: string
    destination: string
    departureTime: Date
    remainingMinutes: number
    remainingTime: string
    status: number
    statusLabel: string
    totalPaidBookings: number
    totalUnpaidBookings: number
}
