import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type { CreateAirlineDto, ReadAirlineDto, UpdateAirlineDto } from '@/interfaces/airline.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class AirlineService {
  private static instance: AirlineService;

  public static getInstance(): AirlineService {
    if (!AirlineService.instance) {
      AirlineService.instance = new AirlineService();
    }
    return AirlineService.instance;
  }

  async getAllAirlines(country?: string): Promise<CommonResponseInterface<ReadAirlineDto[]>> {
    const params = country ? { country } : {};
    const response = await axios.get(`${API_BASE_URL}/airlines/all`, { params });
    return response.data;
  }

  async getAirlineById(id: string): Promise<CommonResponseInterface<ReadAirlineDto>> {
    const response = await axios.get(`${API_BASE_URL}/airlines/${id}`);
    return response.data;
  }

  async searchAirlines(name: string): Promise<CommonResponseInterface<ReadAirlineDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/airlines/search`, { params: { name } });
    return response.data;
  }

  async getDistinctCountries(): Promise<CommonResponseInterface<string[]>> {
    const response = await axios.get(`${API_BASE_URL}/airlines/countries`);
    return response.data;
  }

  async createAirline(airline: CreateAirlineDto): Promise<CommonResponseInterface<ReadAirlineDto>> {
    const response = await axios.post(`${API_BASE_URL}/airlines/create`, airline);
    return response.data;
  }

  async updateAirline(id: string, airline: UpdateAirlineDto): Promise<CommonResponseInterface<ReadAirlineDto>> {
    const response = await axios.put(`${API_BASE_URL}/airlines/${id}/update`, airline);
    return response.data;
  }

  async deleteAirline(id: string): Promise<CommonResponseInterface<object>> {
    const response = await axios.delete(`${API_BASE_URL}/airlines/${id}/delete`);
    return response.data;
  }
}

export const airlineService = AirlineService.getInstance();
