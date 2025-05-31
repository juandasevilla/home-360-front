import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schedule } from 'src/app/shared/models/Schedule';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private apiUrl = `http://localhost:8081/api/v1/schedule`;
    
  
  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo usuario
   * @param scheduleData Datos del usuario a crear
   * @returns Observable con la respuesta del servidor
   */
  createSchedule(scheduleData: Schedule): Observable<any> {
    return this.http.post<any>(this.apiUrl, scheduleData);
  }
}
