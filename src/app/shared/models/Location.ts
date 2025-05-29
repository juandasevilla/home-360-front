import { City } from "./City";

export interface Location {
  id?: number;
  name: string;
  description: string;
  cityId: number;
  city?: City;
}