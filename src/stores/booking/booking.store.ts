import type { BookingQueryParams, BookingStatistics, CreateBookingDto, ReadBookingDto, UpdateBookingDto } from '@/interfaces/booking.interface';
import { bookingService } from '@/services/booking.service';
import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';

export const useBookingStore = defineStore('booking', {
  state: () => ({
    bookings: [] as ReadBookingDto[],
    currentBooking: null as ReadBookingDto | null,
    statistics: null as BookingStatistics | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAllBookings(params?: BookingQueryParams) {
      this.loading = true;
      this.error = null;

      try {
        const response = await bookingService.getAllBookings(params);
        this.bookings = response.data;

        if (this.bookings.length === 0) {
          toast.warning('No bookings found');
        }

        return this.bookings;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading bookings: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBookingById(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await bookingService.getBookingById(id);
        this.currentBooking = response.data;
        return this.currentBooking;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading booking: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchStatistics(start: string, end: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await bookingService.getBookingStatistics(start, end);
        this.statistics = response.data as BookingStatistics;
        return this.statistics;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading statistics: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createBooking(booking: CreateBookingDto) {
      this.loading = true;
      this.error = null;

      try {
        const response = await bookingService.createBooking(booking);
        this.bookings.push(response.data);
        toast.success('Booking created successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error creating booking: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateBooking(id: string, booking: UpdateBookingDto) {
      this.loading = true;
      this.error = null;

      try {
        const response = await bookingService.updateBooking(id, booking);
        const index = this.bookings.findIndex(b => b.id === id);
        if (index !== -1) {
          this.bookings[index] = response.data;
        }
        toast.success('Booking updated successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error updating booking: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelBooking(id: string) {
      this.loading = true;
      this.error = null;

      try {
        await bookingService.cancelBooking(id);
        const index = this.bookings.findIndex(b => b.id === id);
        if (index !== -1) {
          this.bookings[index].isDeleted = true;
        }
        toast.success('Booking cancelled successfully');
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error cancelling booking: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
