export interface ReadAirlineDto {
  id: string;
  name: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAirlineDto {
  id: string; // 3 characters
  name: string;
  country: string;
}

export interface UpdateAirlineDto {
  id: string; // 3 characters
  name: string;
  country: string;
}
