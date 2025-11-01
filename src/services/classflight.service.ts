import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  CreateClassFlightDto,
  ReadClassFlightDto,
  UpdateClassFlightDto
} from '@/interfaces/classflight.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class ClassFlightService {
  private static instance: ClassFlightService;

  public static getInstance(): ClassFlightService {
    if (!ClassFlightService.instance) {
      ClassFlightService.instance = new ClassFlightService();
    }
    return ClassFlightService.instance;
  }

  async getAllClassFlights(flightId?: string): Promise<CommonResponseInterface<ReadClassFlightDto[]>> {
    const params = flightId ? { flightId } : {};
    const response = await axios.get(`${API_BASE_URL}/class-flights/all`, { params });
    return response.data;
  }

  async getClassFlightById(id: number): Promise<CommonResponseInterface<ReadClassFlightDto>> {
    const response = await axios.get(`${API_BASE_URL}/class-flights/${id}`);
    return response.data;
  }

  async getAvailableClassFlights(flightId: string): Promise<CommonResponseInterface<ReadClassFlightDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/class-flights/available`, { params: { flightId } });
    return response.data;
  }

  async createClassFlight(classFlight: CreateClassFlightDto): Promise<CommonResponseInterface<ReadClassFlightDto>> {
    const response = await axios.post(`${API_BASE_URL}/class-flights/create`, classFlight);
    return response.data;
  }

  async updateClassFlight(id: number, classFlight: UpdateClassFlightDto): Promise<CommonResponseInterface<ReadClassFlightDto>> {
    const response = await axios.put(`${API_BASE_URL}/class-flights/${id}/update`, classFlight);
    return response.data;
  }

  async deleteClassFlight(id: number): Promise<CommonResponseInterface<object>> {
    const response = await axios.delete(`${API_BASE_URL}/class-flights/${id}/delete`);
    return response.data;
  }
}

export const classFlightService = ClassFlightService.getInstance();
