export interface ReadPassengerDto {
  id: string;
  fullName: string;
  birthDate: Date;
  age: number;
  gender: number; // 1=Male, 2=Female, 3=Other
  genderLabel: string;
  idPassport: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePassengerDto {
  fullName: string; // max 255 chars
  birthDate: string | Date;
  gender: number; // 1-3
  idPassport: string; // max 100 chars
}

export interface UpdatePassengerDto {
  id: string;
  fullName: string; // max 255 chars
  birthDate: string | Date;
  gender: number; // 1-3
  idPassport: string; // max 100 chars
}

export interface PassengerQueryParams {
  gender?: number;
  name?: string;
  email?: string;
  age?: number;
}

export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3
}
