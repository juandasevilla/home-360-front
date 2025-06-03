import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schedule } from 'src/app/shared/models/Schedule';
import { VisitResponse } from 'src/app/shared/models/VisitResponse';
import { VisitFilter } from 'src/app/shared/models/VisitFilter';
import { HttpParams } from '@angular/common/http';

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

  getVisitsByRealState(realStateId: number, filter?: VisitFilter): Observable<VisitResponse> {
    let params = new HttpParams()
      .set('realStateId', realStateId.toString())
      .set('page', (filter?.page || 0).toString())
      .set('size', (filter?.size || 10).toString());

    if (filter?.initialDate) {
      params = params.set('initialDate', filter.initialDate);
    }

    if (filter?.finalDate) {
      params = params.set('finalDate', filter.finalDate);
    }

    return this.http.get<VisitResponse>(this.apiUrl, { params });
  }
}
