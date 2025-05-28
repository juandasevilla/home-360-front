import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorInterceptor } from './error.interceptor';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let httpClient: HttpClient;
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;

  beforeEach(() => {
    // Crear mocks para las dependencias
    authServiceMock = {
      logout: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ErrorInterceptor,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });

    interceptor = TestBed.inject(ErrorInterceptor);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should handle 401 Unauthorized error', () => {
    // Sobreescribir el método get para que devuelva un error 401
    jest.spyOn(httpClient, 'get').mockImplementation(() => {
      return throwError(() => new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized'
      }));
    });

    // Realizar la solicitud HTTP
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        // Verificar que se llamó a logout
        expect(authServiceMock.logout).toHaveBeenCalled();
        
        // Verificar que se navegó a la página de login
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        
        // Verificar que el error se propagó correctamente
        expect(error.status).toBe(401);
      }
    });
  });

  it('should handle 403 Forbidden error', () => {
    // Sobreescribir el método get para que devuelva un error 403
    jest.spyOn(httpClient, 'get').mockImplementation(() => {
      return throwError(() => new HttpErrorResponse({
        error: 'Forbidden',
        status: 403,
        statusText: 'Forbidden'
      }));
    });

    // Realizar la solicitud HTTP
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        // Verificar que NO se llamó a logout
        expect(authServiceMock.logout).not.toHaveBeenCalled();
        
        // Verificar que se navegó a la página de forbidden
        expect(routerMock.navigate).toHaveBeenCalledWith(['/forbidden']);
        
        // Verificar que el error se propagó correctamente
        expect(error.status).toBe(403);
      }
    });
  });

  it('should pass through other errors without navigation', () => {
    // Sobreescribir el método get para que devuelva un error 500
    jest.spyOn(httpClient, 'get').mockImplementation(() => {
      return throwError(() => new HttpErrorResponse({
        error: 'Server Error',
        status: 500,
        statusText: 'Internal Server Error'
      }));
    });

    // Realizar la solicitud HTTP
    httpClient.get('/api/test').subscribe({
      error: (error) => {
        // Verificar que NO se llamó a logout
        expect(authServiceMock.logout).not.toHaveBeenCalled();
        
        // Verificar que NO se navegó a ninguna página
        expect(routerMock.navigate).not.toHaveBeenCalled();
        
        // Verificar que el error se propagó correctamente
        expect(error.status).toBe(500);
      }
    });
  });
});
