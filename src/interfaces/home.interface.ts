export interface HomeStatistics {
  activeFlightsToday: number;
  bookingsCreatedToday: number;
  totalRegisteredAirlines: number;
  [key: string]: number | string | boolean | object;
}
