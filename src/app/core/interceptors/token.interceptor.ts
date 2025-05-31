import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token del servicio de autenticación
    const token = this.authService.getToken();
    
    // Si existe un token, lo añadimos al header
    if (token) {
      // Las peticiones HTTP son inmutables, por lo que hay que clonarlas
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    // Pasamos la petición al siguiente interceptor o al backend
    return next.handle(request);
  }
}
