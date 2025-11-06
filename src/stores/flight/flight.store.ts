import type { CreateFlightDto, FlightQueryParams, ReadFlightDto, UpdateFlightDto } from '@/interfaces/flight.interface';
import { classFlightService } from '@/services/classflight.service';
import { flightService } from '@/services/flight.service';
import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';

interface ClassConfig {
  classType: string;
  seatCapacity: number;
  price: number;
}

export const useFlightStore = defineStore('flight', {
  state: () => ({
    flights: [] as ReadFlightDto[],
    currentFlight: null as ReadFlightDto | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAllFlights(params?: FlightQueryParams) {
      this.loading = true;
      this.error = null;

      try {
        const response = await flightService.getAllFlights(params);
        this.flights = response.data;
        console.log(response.data)

        if (this.flights.length === 0) {
          toast.warning('No flights found');
        } else {
          toast.success('Flights loaded successfully');
        }

        return this.flights;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading flights: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchFlightById(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await flightService.getFlightById(id);
        this.currentFlight = response.data;
        return this.currentFlight;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading flight: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTodayFlights() {
      this.loading = true;
      this.error = null;

      try {
        const response = await flightService.getFlightsDepartingToday();
        this.flights = response.data;
        return this.flights;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading today's flights: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUpcomingFlights() {
      this.loading = true;
      this.error = null;

      try {
        const response = await flightService.getUpcomingFlights();
        this.flights = response.data;
        return this.flights;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading upcoming flights: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAvailableFlights() {
      this.loading = true;
      this.error = null;

      try {
        const response = await flightService.getFlightsWithAvailableSeats();
        this.flights = response.data;
        return this.flights;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading available flights: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createFlight(flight: CreateFlightDto, classes?: ClassConfig[]) {
      this.loading = true;
      this.error = null;

      try {
        // First, create the flight
        const response = await flightService.createFlight(flight);

        // If classes are provided, create them
        if (classes && classes.length > 0) {
          const classPromises = classes.map(cls =>
            classFlightService.createClassFlight({
              flightId: flight.id,
              classType: cls.classType,
              seatCapacity: cls.seatCapacity,
              price: cls.price
            })
          );

          await Promise.all(classPromises);

          // Refresh the flight data to include the newly created classes
          const updatedFlight = await flightService.getFlightById(flight.id);
          this.flights.push(updatedFlight.data);
        } else {
          this.flights.push(response.data);
        }

        toast.success('Flight created successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error creating flight: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateFlight(id: string, flight: UpdateFlightDto) {
      this.loading = true;
      this.error = null;

      try {
        const response = await flightService.updateFlight(id, flight);
        const index = this.flights.findIndex(f => f.id === id);
        if (index !== -1) {
          this.flights[index] = response.data;
        }
        toast.success('Flight updated successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error updating flight: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelFlight(id: string) {
      this.loading = true;
      this.error = null;

      try {
        await flightService.cancelFlight(id);
        const index = this.flights.findIndex(f => f.id === id);
        if (index !== -1) {
          this.flights[index].isDeleted = true;
        }
        toast.success('Flight cancelled successfully');
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        this.error = err?.response?.data?.message || err?.message || 'Unknown error';
        toast.error(`Error cancelling flight: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
