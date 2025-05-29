import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { loginGuard } from './login.guard';
import { AuthService } from '../auth/auth.service';

describe('loginGuard', () => {
  let mockRouter: Partial<Router>;
  let mockAuthService: Partial<AuthService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn()
    };

    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      getUserRole: jest.fn().mockReturnValue('')
    };

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    it('should return true and allow navigation to login page', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it('should not call getUserRole when not authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockAuthService.getUserRole).not.toHaveBeenCalled();
    });

    it('should call isAuthenticated exactly once', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    });

    it('should return false and prevent navigation to login page', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it('should call getUserRole when authenticated', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockAuthService.getUserRole).toHaveBeenCalled();
      expect(mockAuthService.getUserRole).toHaveBeenCalledTimes(1);
    });

    it('should redirect ADMIN to admin dashboard', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it('should redirect SELLER to seller dashboard', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('SELLER');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/seller/dashboard']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it('should redirect other roles to home page', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('CLIENT');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it('should redirect empty role to home page', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should redirect null role to home page', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(null);

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should redirect undefined role to home page', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(undefined);

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should handle case sensitive roles correctly', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/admin/dashboard']);
      expect(result).toBe(false);
    });

    it('should handle case sensitive seller role correctly', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('seller');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/seller/dashboard']);
      expect(result).toBe(false);
    });

    it('should call services in correct order', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthService.getUserRole).toHaveBeenCalled();
    });
  });

  describe('edge cases and unusual roles', () => {
    beforeEach(() => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    });

    it('should handle special characters in role', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN@#$');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should handle numeric role', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('123');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should handle very long role string', () => {
      const longRole = 'A'.repeat(1000);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(longRole);

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should handle whitespace in role', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(' ADMIN ');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should handle mixed case role', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('Admin');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should handle role with underscores', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN_USER');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });

    it('should handle role with hyphens', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('SUPER-ADMIN');

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(result).toBe(false);
    });
  });

  describe('service dependencies', () => {
    it('should inject Router service correctly', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should inject AuthService correctly', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it('should work with different route and state objects', () => {
      const customRoute = { data: { test: 'value' } } as any;
      const customState = { url: '/test' } as any;

      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => 
        loginGuard(customRoute, customState)
      );

      expect(result).toBe(true);
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('navigation behavior', () => {
    beforeEach(() => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    });

    it('should navigate with correct array format for admin', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      expect(mockRouter.navigate).toHaveBeenCalledWith(expect.arrayContaining(['/admin/dashboard']));
    });

    it('should navigate with correct array format for seller', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('SELLER');

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/seller/dashboard']);
      expect(mockRouter.navigate).toHaveBeenCalledWith(expect.arrayContaining(['/seller/dashboard']));
    });

    it('should navigate with correct array format for home', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('OTHER');

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(mockRouter.navigate).toHaveBeenCalledWith(expect.arrayContaining(['/home']));
    });

    it('should not navigate when not authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate exactly once per execution', () => {
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');

      TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('return values', () => {
    it('should consistently return false for all authenticated users', () => {
      const roles = ['ADMIN', 'SELLER', 'CLIENT', '', null, undefined, 'UNKNOWN'];

      roles.forEach(role => {
        jest.clearAllMocks();
        (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
        (mockAuthService.getUserRole as jest.Mock).mockReturnValue(role);

        const result = TestBed.runInInjectionContext(() => 
          loginGuard(mockRoute, mockState)
        );

        expect(result).toBe(false);
      });
    });

    it('should consistently return true for non-authenticated users', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      const result1 = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );
      const result2 = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should return boolean values only', () => {
      // Test not authenticated
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
      const result1 = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      // Test authenticated
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('ADMIN');
      const result2 = TestBed.runInInjectionContext(() => 
        loginGuard(mockRoute, mockState)
      );

      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
    });
  });
});
