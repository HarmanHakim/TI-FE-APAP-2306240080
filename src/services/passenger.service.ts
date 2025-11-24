import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  CreatePassengerDto,
  ReadPassengerDto,
  UpdatePassengerDto,
  PassengerQueryParams
} from '@/interfaces/passenger.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://2306240080-be.hafizmuh.site/api';

export class PassengerService {
  private static instance: PassengerService;

  public static getInstance(): PassengerService {
    if (!PassengerService.instance) {
      PassengerService.instance = new PassengerService();
    }
    return PassengerService.instance;
  }

  async getAllPassengers(params?: PassengerQueryParams): Promise<CommonResponseInterface<ReadPassengerDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/passengers/all`, { params });
    return response.data;
  }

  async getPassengerById(id: string): Promise<CommonResponseInterface<ReadPassengerDto>> {
    const response = await axios.get(`${API_BASE_URL}/passengers/${id}`);
    return response.data;
  }

  async createPassenger(passenger: CreatePassengerDto): Promise<CommonResponseInterface<ReadPassengerDto>> {
    const response = await axios.post(`${API_BASE_URL}/passengers/create`, passenger);
    return response.data;
  }

  async updatePassenger(id: string, passenger: UpdatePassengerDto): Promise<CommonResponseInterface<ReadPassengerDto>> {
    const response = await axios.put(`${API_BASE_URL}/passengers/${id}/update`, passenger);
    return response.data;
  }

  async deletePassenger(id: string): Promise<CommonResponseInterface<object>> {
    const response = await axios.delete(`${API_BASE_URL}/passengers/${id}/delete`);
    return response.data;
  }
}

export const passengerService = PassengerService.getInstance();
