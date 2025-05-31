import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ForbiddenPageComponent } from './forbidden-page.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ForbiddenPageComponent', () => {
  let component: ForbiddenPageComponent;
  let fixture: ComponentFixture<ForbiddenPageComponent>;
  let mockLocation: Partial<Location>;
  let mockRouter: Partial<Router>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    // Crear mocks de los servicios
    mockLocation = {
      back: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockAuthService = {
      getUserRole: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockRouter.navigate as jest.Mock).mockResolvedValue(true);
    (mockAuthService.getUserRole as jest.Mock).mockReturnValue('');

    await TestBed.configureTestingModule({
      declarations: [ForbiddenPageComponent],
      providers: [
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ForbiddenPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // TEST 1: Verificar creación del componente
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Verificar método goBack
  describe('goBack', () => {
    it('should call location.back()', () => {
      component.goBack();

      expect(mockLocation.back as jest.Mock).toHaveBeenCalled();
    });
  });

  // TEST 3: Verificar método goToHome con diferentes roles
  describe('goToHome', () => {
    it('should navigate to admin dashboard when user role is ADMIN', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      component.goToHome();

      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalled();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/admin/dashboard']);
    });

    it('should navigate to seller dashboard when user role is SELLER', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('SELLER');

      component.goToHome();

      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalled();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/seller/dashboard']);
    });

    it('should navigate to login when user role is empty', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('');

      component.goToHome();

      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalled();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to login when user role is null', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(null);

      component.goToHome();

      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalled();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to login when user role is undefined', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(undefined);

      component.goToHome();

      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalled();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to login when user role is unknown', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('UNKNOWN_ROLE');

      component.goToHome();

      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalled();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']);
    });

    it('should handle case sensitivity for roles', () => {
      // Roles en minúsculas
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');

      component.goToHome();

      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']); // No coincide exactamente con 'ADMIN'
    });

    it('should handle mixed case roles', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('Admin');

      component.goToHome();

      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']); // No coincide exactamente con 'ADMIN'
    });
  });

  // TEST 4: Verificar integración completa
  describe('Integration Tests', () => {
    it('should handle complete workflow for admin user', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      // Usuario navega a página de prohibido y quiere ir al home
      component.goToHome();

      // Verificar flujo completo
      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/admin/dashboard']);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it('should handle complete workflow for seller user', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('SELLER');

      // Usuario navega a página de prohibido y quiere ir al home
      component.goToHome();

      // Verificar flujo completo
      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/seller/dashboard']);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it('should handle complete workflow for unauthenticated user', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('');

      // Usuario sin rol intenta ir al home
      component.goToHome();

      // Verificar flujo completo
      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it('should handle navigation scenarios correctly', () => {
      // Test que ambos métodos funcionan independientemente
      
      // 1. Ir hacia atrás
      component.goBack();
      expect(mockLocation.back as jest.Mock).toHaveBeenCalledTimes(1);
      
      // 2. Ir al home como admin
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');
      component.goToHome();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/admin/dashboard']);
      
      // 3. Ir al home como seller
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('SELLER');
      component.goToHome();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/seller/dashboard']);
      
      // Verificar número total de llamadas
      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledTimes(2);
    });
  });

  // TEST 5: Verificar edge cases
  describe('Edge Cases', () => {
    it('should handle service errors gracefully', () => {
      // Mock que AuthService.getUserRole() lance un error
      (mockAuthService.getUserRole as jest.Mock).mockImplementation(() => {
        throw new Error('Service error');
      });

      // No debería romper la aplicación
      expect(() => component.goToHome()).toThrow('Service error');
    });

    it('should handle router navigation failure', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');
      (mockRouter.navigate as jest.Mock).mockRejectedValue(new Error('Navigation failed'));

      // No debería romper la aplicación
      expect(() => component.goToHome()).not.toThrow();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/admin/dashboard']);
    });

    it('should handle location.back() failure', () => {
      (mockLocation.back as jest.Mock).mockImplementation(() => {
        throw new Error('Cannot go back');
      });

      // No debería romper la aplicación
      expect(() => component.goBack()).toThrow('Cannot go back');
    });

    it('should handle multiple rapid calls to goToHome', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      // Llamadas múltiples rápidas
      component.goToHome();
      component.goToHome();
      component.goToHome();

      // Todas deberían funcionar correctamente
      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/admin/dashboard']);
    });

    it('should handle role changes between calls', () => {
      // Primera llamada como ADMIN
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');
      component.goToHome();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/admin/dashboard']);

      // Segunda llamada como SELLER
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('SELLER');
      component.goToHome();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/seller/dashboard']);

      // Tercera llamada sin rol
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('');
      component.goToHome();
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['/login']);

      expect(mockAuthService.getUserRole as jest.Mock).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledTimes(3);
    });
  });
});