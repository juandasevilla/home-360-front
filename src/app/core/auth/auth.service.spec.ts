import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Login } from 'src/app/shared/models/Login';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and store token and role in localStorage', () => {
      const loginData: Login = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { token: 'mock-token-value', role: 'ADMIN' };

      service.login(loginData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('auth_token')).toBe('mock-token-value');
        expect(localStorage.getItem('user_role')).toBe('ADMIN');
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should remove token and role from localStorage', () => {
      // Preparar datos
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user_role', 'ADMIN');
      
      service.logout();
      
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_role')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored-token-value');
      
      const token = service.getToken();
      
      expect(token).toBe('stored-token-value');
    });

    it('should return null if token is not in localStorage', () => {
      const token = service.getToken();
      
      expect(token).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should return role from localStorage', () => {
      localStorage.setItem('user_role', 'ADMIN');
      
      const role = service.getUserRole();
      
      expect(role).toBe('ADMIN');
    });

    it('should return empty string if role is not in localStorage', () => {
      const role = service.getUserRole();
      
      expect(role).toBe('');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if token is not in localStorage', () => {
      const isAuth = service.isAuthenticated();
      
      expect(isAuth).toBe(false); // Cambiado para Jest
    });

    it('should return true if token exists and is valid', () => {
      // Crear un token JWT válido (expiración en el futuro)
      const futureDate = Math.floor(Date.now() / 1000) + 3600; // Una hora en el futuro
      const validToken = createMockJwt(futureDate);
      
      localStorage.setItem('auth_token', validToken);
      
      const isAuth = service.isAuthenticated();
      
      expect(isAuth).toBe(true); // Cambiado para Jest
    });

    it('should return false if token is expired', () => {
      // Crear un token JWT expirado
      const pastDate = Math.floor(Date.now() / 1000) - 3600; // Una hora en el pasado
      const expiredToken = createMockJwt(pastDate);
      
      localStorage.setItem('auth_token', expiredToken);
      
      const isAuth = service.isAuthenticated();
      
      expect(isAuth).toBe(false); // Cambiado para Jest
    });

    it('should return false if token cannot be decoded', () => {
      localStorage.setItem('auth_token', 'invalid-token');
      
      const isAuth = service.isAuthenticated();
      
      expect(isAuth).toBe(false); // Cambiado para Jest
    });
  });
});

// Función auxiliar para crear un mock de token JWT
function createMockJwt(expTime: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 'user123', exp: expTime }));
  const signature = 'mock-signature';
  
  return `${header}.${payload}.${signature}`;
}