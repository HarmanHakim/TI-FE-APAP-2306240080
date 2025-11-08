import type { CreateAirlineDto, ReadAirlineDto, UpdateAirlineDto } from '@/interfaces/airline.interface';
import { airlineService } from '@/services/airline.service';
import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';

export const useAirlineStore = defineStore('airline', {
  state: () => ({
    airlines: [] as ReadAirlineDto[],
    currentAirline: null as ReadAirlineDto | null,
    countries: [] as string[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAllAirlines(country?: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airlineService.getAllAirlines(country);
        this.airlines = response.data;

        if (this.airlines.length === 0) {
          toast.warning('No airlines found');
        }

        return this.airlines;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading airlines: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAirlineById(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airlineService.getAirlineById(id);
        this.currentAirline = response.data;
        return this.currentAirline;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading airline: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchAirlines(name: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airlineService.searchAirlines(name);
        this.airlines = response.data;
        return this.airlines;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error searching airlines: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCountries() {
      this.loading = true;
      this.error = null;

      try {
        const response = await airlineService.getDistinctCountries();
        this.countries = response.data;
        return this.countries;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading countries: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createAirline(airline: CreateAirlineDto) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airlineService.createAirline(airline);
        this.airlines.push(response.data);
        toast.success('Airline created successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error creating airline: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateAirline(id: string, airline: UpdateAirlineDto) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airlineService.updateAirline(id, airline);
        const index = this.airlines.findIndex(a => a.id === id);
        if (index !== -1) {
          this.airlines[index] = response.data;
        }
        toast.success('Airline updated successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error updating airline: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAirline(id: string) {
      this.loading = true;
      this.error = null;

      try {
        await airlineService.deleteAirline(id);
        this.airlines = this.airlines.filter(a => a.id !== id);
        toast.success('Airline deleted successfully');
      } catch (error) {
        this.error = error instanceof Error ? error.response.data.message : 'Unknown error';
        toast.error(`Error deleting airline: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
