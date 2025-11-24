import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type { HomeStatistics } from '@/interfaces/home.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://2306240080-be.hafizmuh.site/api';

export class HomeService {
  private static instance: HomeService;

  public static getInstance(): HomeService {
    if (!HomeService.instance) {
      HomeService.instance = new HomeService();
    }
    return HomeService.instance;
  }

  async getHomeStatistics(): Promise<CommonResponseInterface<HomeStatistics>> {
    const response = await axios.get(`${API_BASE_URL}/home`);
    return response.data;
  }
}

export const homeService = HomeService.getInstance();
