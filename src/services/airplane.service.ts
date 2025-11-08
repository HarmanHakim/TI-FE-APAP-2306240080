import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  CreateAirplaneDto,
  ReadAirplaneDto,
  UpdateAirplaneDto,
  AirplaneQueryParams
} from '@/interfaces/airplane.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class AirplaneService {
  private static instance: AirplaneService;

  public static getInstance(): AirplaneService {
    if (!AirplaneService.instance) {
      AirplaneService.instance = new AirplaneService();
    }
    return AirplaneService.instance;
  }

  async getAllAirplanes(params?: AirplaneQueryParams): Promise<CommonResponseInterface<ReadAirplaneDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/airplanes/all`, { params });
    return response.data;
  }

  async getAirplaneById(id: string): Promise<CommonResponseInterface<ReadAirplaneDto>> {
    const response = await axios.get(`${API_BASE_URL}/airplanes/${id}`);
    return response.data;
  }

  async createAirplane(airplane: CreateAirplaneDto): Promise<CommonResponseInterface<ReadAirplaneDto>> {
    const response = await axios.post(`${API_BASE_URL}/airplanes/create`, airplane);
    return response.data;
  }

  async updateAirplane(id: string, airplane: UpdateAirplaneDto): Promise<CommonResponseInterface<ReadAirplaneDto>> {
    const response = await axios.put(`${API_BASE_URL}/airplanes/${id}/update`, airplane);
    return response.data;
  }

  async deleteAirplane(id: string): Promise<CommonResponseInterface<object>> {
    const response = await axios.delete(`${API_BASE_URL}/airplanes/${id}/delete`);
    return response.data;
  }

  async activateAirplane(id: string): Promise<CommonResponseInterface<object>> {
    const response = await axios.post(`${API_BASE_URL}/airplanes/${id}/activate`);
    return response.data;
  }
}

export const airplaneService = AirplaneService.getInstance();
