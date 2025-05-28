import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;
  let routeSnapshot: ActivatedRouteSnapshot;
  let stateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    // Crear mocks para las dependencias
    authServiceMock = {
      isAuthenticated: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    // Objetos vacíos para los snapshots
    routeSnapshot = {} as ActivatedRouteSnapshot;
    stateSnapshot = { url: '/test' } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should allow access when user is authenticated', () => {
    // Configurar el mock para devolver true (autenticado)
    authServiceMock.isAuthenticated.mockReturnValue(true);

    // Ejecutar el guard en el contexto de inyección
    TestBed.runInInjectionContext(() => {
      const result = authGuard(routeSnapshot, stateSnapshot);
      
      // Verificar que permite el acceso
      expect(result).toBe(true);
      
      // Verificar que no intenta navegar
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  it('should redirect to login when user is not authenticated', () => {
    // Configurar el mock para devolver false (no autenticado)
    authServiceMock.isAuthenticated.mockReturnValue(false);

    // Ejecutar el guard en el contexto de inyección
    TestBed.runInInjectionContext(() => {
      const result = authGuard(routeSnapshot, stateSnapshot);
      
      // Verificar que no permite el acceso
      expect(result).toBe(false);
      
      // Verificar que redirige al login
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
