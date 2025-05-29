import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RealState } from 'src/app/shared/models/RealState';
import { Page } from 'src/app/shared/models/Page';
import { HttpParams } from '@angular/common/http'; 
import { RealStateFilter } from 'src/app/shared/models/RealStateFilter';

@Injectable({
  providedIn: 'root'
})
export class RealStateService {
  private apiUrl = `http://localhost:8080/api/v1/real-state`;
  private apigetlocations = `http://localhost:8080/api/v1/real-state?size=50`; //para crear horarios
  
    constructor(private http: HttpClient) { }
  
    /**
     * Crea un nuevo usuario
     * @param userData Datos del usuario a crear
     * @returns Observable con la respuesta del servidor
     */
    createRealState(realStateData: RealState): Observable<any> {
      return this.http.post<any>(this.apiUrl, realStateData);
    }

    /**
     * Obtiene una lista de propiedades
     * @returns Observable con la lista de propiedades
     */
    getRealStates(page: number = 0, size: number = 10, 
      orderAsc: boolean = false, filters?: RealStateFilter): Observable<Page<RealState>> {
      const paginationUrl = `${this.apiUrl}`;
      
      let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('orderAsc', orderAsc.toString())

      if (filters) {
        if (filters.categoryName) {
          params = params.set('categoryName', filters.categoryName);
        }
        if (filters.bathrooms !== undefined) {
          params = params.set('bathrooms', filters.bathrooms.toString());
        }
        if (filters.rooms !== undefined) {
          params = params.set('rooms', filters.rooms.toString());
        }
        if (filters.locationName) {
          params = params.set('locationName', filters.locationName);
        }
        if (filters.minPrice !== undefined) {
          params = params.set('minPrice', filters.minPrice.toString());
        }
        if (filters.maxPrice !== undefined) {
          params = params.set('maxPrice', filters.maxPrice.toString());
        }
      }
        
        
      return this.http.get<Page<RealState>>(paginationUrl, { params });
    }
    
}
