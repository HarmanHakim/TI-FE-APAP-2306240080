export interface HomeStatistics {
  activeFlightsToday: number;
  bookingsCreatedToday: number;
  totalAirlinesRegistered: number;
  [key: string]: number | string | boolean | object;
}
