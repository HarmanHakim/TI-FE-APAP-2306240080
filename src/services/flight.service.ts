import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  CreateFlightDto,
  ReadFlightDto,
  UpdateFlightDto,
  FlightQueryParams
} from '@/interfaces/flight.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class FlightService {
  private static instance: FlightService;

  public static getInstance(): FlightService {
    if (!FlightService.instance) {
      FlightService.instance = new FlightService();
    }
    return FlightService.instance;
  }

  async getAllFlights(params?: FlightQueryParams): Promise<CommonResponseInterface<ReadFlightDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/flights/all`, { params });
    return response.data;
  }

  async getFlightById(id: string): Promise<CommonResponseInterface<ReadFlightDto>> {
    const response = await axios.get(`${API_BASE_URL}/flights/${id}`);
    return response.data;
  }

  async getFlightsDepartingToday(): Promise<CommonResponseInterface<ReadFlightDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/flights/today`);
    return response.data;
  }

  async getUpcomingFlights(): Promise<CommonResponseInterface<ReadFlightDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/flights/upcoming`);
    return response.data;
  }

  async getFlightsWithAvailableSeats(): Promise<CommonResponseInterface<ReadFlightDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/flights/available`);
    return response.data;
  }

  async createFlight(flight: CreateFlightDto): Promise<CommonResponseInterface<ReadFlightDto>> {
    const response = await axios.post(`${API_BASE_URL}/flights/create`, flight);
    return response.data;
  }

  async updateFlight(id: string, flight: UpdateFlightDto): Promise<CommonResponseInterface<ReadFlightDto>> {
    const response = await axios.put(`${API_BASE_URL}/flights/${id}/update`, flight);
    return response.data;
  }

  async cancelFlight(id: string): Promise<CommonResponseInterface<object>> {
    const response = await axios.post(`${API_BASE_URL}/flights/${id}/delete`);
    return response.data;
  }
}

export const flightService = FlightService.getInstance();
