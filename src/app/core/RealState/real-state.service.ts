import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RealState } from 'src/app/shared/models/RealState';

@Injectable({
  providedIn: 'root'
})
export class RealStateService {
  private apiUrl = `http://localhost:8080/api/v1/real-state`;
  
    constructor(private http: HttpClient) { }
  
    /**
     * Crea un nuevo usuario
     * @param userData Datos del usuario a crear
     * @returns Observable con la respuesta del servidor
     */
    createRealState(realStateData: RealState): Observable<any> {
      return this.http.post<any>(this.apiUrl, realStateData);
    }
}
