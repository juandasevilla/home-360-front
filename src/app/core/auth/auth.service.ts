import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Login } from 'src/app/shared/models/Login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'user_role';
  private apiUrl = `http://localhost:8080/api/v1/auth`;

  constructor(private http: HttpClient) { }

  /**
   * Inicia sesión de un usuario
   * @param loginData Datos de inicio de sesión
   * @returns Observable con la respuesta del servidor
   */
  login(loginData: Login): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          // Guardar token y rol en localStorage
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.ROLE_KEY, response.role);
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    // Puedes añadir redirección al login u otras operaciones
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el rol del usuario
   */
  getUserRole(): string {
    return localStorage.getItem(this.ROLE_KEY) || '';
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Opcionalmente verificar si el token está expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }
}

