import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import type {
  CreateBookingDto,
  ReadBookingDto,
  UpdateBookingDto,
  BookingQueryParams,
  BookingStatistics
} from '@/interfaces/booking.interface';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class BookingService {
  private static instance: BookingService;

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  async getAllBookings(params?: BookingQueryParams): Promise<CommonResponseInterface<ReadBookingDto[]>> {
    const response = await axios.get(`${API_BASE_URL}/bookings`, { params });
    return response.data;
  }

  async getBookingById(id: string): Promise<CommonResponseInterface<ReadBookingDto>> {
    const response = await axios.get(`${API_BASE_URL}/bookings/${id}`);
    return response.data;
  }

  async getBookingStatistics(start: string, end: string): Promise<CommonResponseInterface<BookingStatistics>> {
    const response = await axios.get(`${API_BASE_URL}/bookings/statistics`, {
      params: { start, end }
    });
    return response.data;
  }

  async createBooking(booking: CreateBookingDto): Promise<CommonResponseInterface<ReadBookingDto>> {
    const response = await axios.post(`${API_BASE_URL}/bookings/create`, booking);
    return response.data;
  }

  async updateBooking(id: string, booking: UpdateBookingDto): Promise<CommonResponseInterface<ReadBookingDto>> {
    const response = await axios.put(`${API_BASE_URL}/bookings/${id}/update`, booking);
    return response.data;
  }

  async cancelBooking(id: string): Promise<CommonResponseInterface<object>> {
    const response = await axios.post(`${API_BASE_URL}/bookings/${id}/delete`);
    return response.data;
  }
}

export const bookingService = BookingService.getInstance();
