import type { AirplaneQueryParams, CreateAirplaneDto, ReadAirplaneDto, UpdateAirplaneDto } from '@/interfaces/airplane.interface';
import { airplaneService } from '@/services/airplane.service';
import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';

export const useAirplaneStore = defineStore('airplane', {
  state: () => ({
    airplanes: [] as ReadAirplaneDto[],
    currentAirplane: null as ReadAirplaneDto | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAllAirplanes(params?: AirplaneQueryParams) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airplaneService.getAllAirplanes(params);
        this.airplanes = response.data;

        if (this.airplanes.length === 0) {
          toast.warning('No airplanes found');
        }

        return this.airplanes;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading airplanes: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAirplaneById(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airplaneService.getAirplaneById(id);
        this.currentAirplane = response.data;
        return this.currentAirplane;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading airplane: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createAirplane(airplane: CreateAirplaneDto) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airplaneService.createAirplane(airplane);
        this.airplanes.push(response.data);
        toast.success('Airplane registered successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error registering airplane: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateAirplane(id: string, airplane: UpdateAirplaneDto) {
      this.loading = true;
      this.error = null;

      try {
        const response = await airplaneService.updateAirplane(id, airplane);
        const index = this.airplanes.findIndex(a => a.id === id);
        if (index !== -1) {
          this.airplanes[index] = response.data;
        }
        toast.success('Airplane updated successfully');
        return response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error updating airplane: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAirplane(id: string) {
      this.loading = true;
      this.error = null;

      try {
        await airplaneService.deleteAirplane(id);
        const index = this.airplanes.findIndex(a => a.id === id);
        if (index !== -1) {
          this.airplanes[index].isDeleted = true;
        }
        toast.success('Airplane deactivated successfully');
      } catch (error) {
        this.error = error instanceof Error ? error.response.data.message : 'Unknown error';

        toast.error(`Error deactivating airplane: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async activateAirplane(id: string) {
      this.loading = true;
      this.error = null;

      try {
        await airplaneService.activateAirplane(id);
        const index = this.airplanes.findIndex(a => a.id === id);
        if (index !== -1) {
          this.airplanes[index].isDeleted = false;
        }
        toast.success('Airplane activated successfully');
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error activating airplane: ${this.error}`);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
