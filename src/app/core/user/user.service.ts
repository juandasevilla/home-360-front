import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from 'src/app/shared/models/User';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `http://localhost:8082/api/v1/user`;
  
  constructor(private http: HttpClient) { }

  /**
   * Crea un nuevo usuario
   * @param userData Datos del usuario a crear
   * @returns Observable con la respuesta del servidor
   */
  createUser(userData: User): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  
}
