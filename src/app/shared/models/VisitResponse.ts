import { Schedule } from "./Schedule";

export interface VisitResponse {
  content: Schedule[];
  page: number;
  size: number;
  orderAsc: boolean;
  totalObjects: number;
  totalElements: number;
  totalPages: number;
}