import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;
  let routeSnapshot: ActivatedRouteSnapshot;
  let stateSnapshot: RouterStateSnapshot;

  beforeEach(() => {
    // Crear mocks para las dependencias
    authServiceMock = {
      getUserRole: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    // Configurar el route snapshot con datos de prueba
    routeSnapshot = { 
      data: {} 
    } as ActivatedRouteSnapshot;
    
    stateSnapshot = { 
      url: '/admin/dashboard' 
    } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should allow access when no roles are required', () => {
    // No roles defined
    routeSnapshot.data = {};
    
    // Mock del rol del usuario
    authServiceMock.getUserRole.mockReturnValue('USER');

    TestBed.runInInjectionContext(() => {
      const result = roleGuard(routeSnapshot, stateSnapshot);
      
      // Verificar que permite el acceso
      expect(result).toBe(true);
      
      // Verificar que no intenta navegar
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  it('should allow access when user has the required role', () => {
    // Configurar roles requeridos
    routeSnapshot.data = { roles: ['ADMIN', 'MANAGER'] };
    
    // Mock del rol del usuario
    authServiceMock.getUserRole.mockReturnValue('ADMIN');

    TestBed.runInInjectionContext(() => {
      const result = roleGuard(routeSnapshot, stateSnapshot);
      
      // Verificar que permite el acceso
      expect(result).toBe(true);
      
      // Verificar que no intenta navegar
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  it('should deny access when user does not have the required role', () => {
    // Configurar roles requeridos
    routeSnapshot.data = { roles: ['ADMIN', 'MANAGER'] };
    
    // Mock del rol del usuario
    authServiceMock.getUserRole.mockReturnValue('USER');

    TestBed.runInInjectionContext(() => {
      const result = roleGuard(routeSnapshot, stateSnapshot);
      
      // Verificar que no permite el acceso
      expect(result).toBe(false);
      
      // Verificar que redirige a página de prohibido
      expect(routerMock.navigate).toHaveBeenCalledWith(['/forbidden']);
    });
  });

  it('should deny access when user has no role', () => {
    // Configurar roles requeridos
    routeSnapshot.data = { roles: ['ADMIN', 'MANAGER'] };
    
    // Mock sin rol (retorna cadena vacía)
    authServiceMock.getUserRole.mockReturnValue('');

    TestBed.runInInjectionContext(() => {
      const result = roleGuard(routeSnapshot, stateSnapshot);
      
      // Verificar que no permite el acceso
      expect(result).toBe(false);
      
      // Verificar que redirige a página de prohibido
      expect(routerMock.navigate).toHaveBeenCalledWith(['/forbidden']);
    });
  });
});
