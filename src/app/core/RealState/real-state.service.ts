import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RealState } from 'src/app/shared/models/RealState';
import { Page } from 'src/app/shared/models/Page';
import { HttpParams } from '@angular/common/http'; // Asegúrate de importar HttpParams

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
    getRealStates(page: number = 0, size: number = 10, orderAsc: boolean = false): Observable<Page<RealState>> {
      const paginationUrl = `${this.apiUrl}/page`;
      
      let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('orderAsc', orderAsc.toString())
        
        
      return this.http.get<Page<RealState>>(paginationUrl, { params });
    }
    
}
