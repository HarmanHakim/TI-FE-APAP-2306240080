import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  CreateSeatDto,
  ReadSeatDto,
  UpdateSeatDto,
  SeatQueryParams
} from '@/interfaces/seat.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class SeatService {
  private static instance: SeatService;

  public static getInstance(): SeatService {
    if (!SeatService.instance) {
      SeatService.instance = new SeatService();
    }
    return SeatService.instance;
  }

  async getAllSeats(params?: SeatQueryParams): Promise<CommonResponseInterface<ReadSeatDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/seats/all`, { params });
    return response.data;
  }

  async getSeatById(id: number): Promise<CommonResponseInterface<ReadSeatDto>> {
    const response = await axios.get(`${API_BASE_URL}/seats/${id}`);
    return response.data;
  }

  async getAvailableSeats(classFlightId: number): Promise<CommonResponseInterface<ReadSeatDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/seats/all`, { params: { classFlightId } });
    return response.data;
  }

  async createSeat(seat: CreateSeatDto): Promise<CommonResponseInterface<ReadSeatDto>> {
    const response = await axios.post(`${API_BASE_URL}/seats/create`, seat);
    return response.data;
  }

  async updateSeat(id: number, seat: UpdateSeatDto): Promise<CommonResponseInterface<ReadSeatDto>> {
    const response = await axios.put(`${API_BASE_URL}/seats/${id}/update`, seat);
    return response.data;
  }

  async assignSeat(id: number, passengerId: string, classFlightId: number): Promise<CommonResponseInterface<ReadSeatDto>> {
    const response = await axios.post(`${API_BASE_URL}/seats/${id}/assign`, null, {
      params: { passengerId, classFlightId }
    });
    return response.data;
  }

  async releaseSeat(id: number): Promise<CommonResponseInterface<ReadSeatDto>> {
    const response = await axios.post(`${API_BASE_URL}/seats/${id}/release`);
    return response.data;
  }

  async deleteSeat(id: number): Promise<CommonResponseInterface<object>> {
    const response = await axios.delete(`${API_BASE_URL}/seats/${id}/delete`);
    return response.data;
  }
}

export const seatService = SeatService.getInstance();
