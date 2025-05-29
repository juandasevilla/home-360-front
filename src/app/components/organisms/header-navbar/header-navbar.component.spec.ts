import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderNavbarComponent } from './header-navbar.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderNavbarComponent', () => {
  let component: HeaderNavbarComponent;
  let fixture: ComponentFixture<HeaderNavbarComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      getUserRole: jest.fn().mockReturnValue(''),
      logout: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [HeaderNavbarComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderNavbarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize default properties', () => {
      expect(component.logoSrc).toBe('assets/images/logo360.png');
      expect(component.logoAlt).toBe('Hogar360');
      expect(component.buttonText).toBe('Ingresar');
      expect(component.buttonLink).toBe('/login');
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
    });

    it('should initialize navLinks array', () => {
      expect(component.navLinks).toEqual([
        { text: 'Compra', url: '/compra' },
        { text: 'Renta', url: '/renta' },
        { text: 'Vende', url: '/vende' }
      ]);
    });

    it('should have correct array length for navLinks', () => {
      expect(component.navLinks).toHaveLength(3);
    });

    it('should initialize with correct data types', () => {
      expect(typeof component.logoSrc).toBe('string');
      expect(typeof component.logoAlt).toBe('string');
      expect(typeof component.buttonText).toBe('string');
      expect(typeof component.buttonLink).toBe('string');
      expect(typeof component.isLoggedIn).toBe('boolean');
      expect(typeof component.userRole).toBe('string');
      expect(Array.isArray(component.navLinks)).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should call checkAuthStatus', () => {
      const checkAuthStatusSpy = jest.spyOn(component, 'checkAuthStatus' as any);

      component.ngOnInit();

      expect(checkAuthStatusSpy).toHaveBeenCalled();
      expect(checkAuthStatusSpy).toHaveBeenCalledTimes(1);
    });

    it('should set authentication state through checkAuthStatus', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');

      component.ngOnInit();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe('admin');
    });
  });

  describe('checkAuthStatus', () => {
    it('should set isLoggedIn to false when user is not authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      component['checkAuthStatus']();

      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
    });

    it('should set isLoggedIn to true when user is authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('user');

      component['checkAuthStatus']();

      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthService.getUserRole).toHaveBeenCalled();
      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe('user');
    });

    it('should set userRole to admin when user is authenticated with admin role', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');

      component['checkAuthStatus']();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe('admin');
    });

    it('should set userRole to client when user is authenticated with client role', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('client');

      component['checkAuthStatus']();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe('client');
    });

    it('should set userRole to empty string when user is not authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      component['checkAuthStatus']();

      expect(component.userRole).toBe('');
      expect(mockAuthService.getUserRole).not.toHaveBeenCalled();
    });

    it('should handle getUserRole returning empty string', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('');

      component['checkAuthStatus']();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe('');
    });

    it('should handle getUserRole returning null', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(null);

      component['checkAuthStatus']();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe(null);
    });

    it('should handle getUserRole returning undefined', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(undefined);

      component['checkAuthStatus']();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe(undefined);
    });

    it('should call both authService methods when authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('user');

      component['checkAuthStatus']();

      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthService.getUserRole).toHaveBeenCalled();
      expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthService.getUserRole).toHaveBeenCalledTimes(1);
    });

    it('should not call getUserRole if not authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      component['checkAuthStatus']();

      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockAuthService.getUserRole).not.toHaveBeenCalled();
    });
  });

  describe('onLogout', () => {
    beforeEach(() => {
      component.isLoggedIn = true;
      component.userRole = 'admin';
    });

    it('should call authService.logout()', () => {
      component.onLogout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('should set isLoggedIn to false', () => {
      component.onLogout();

      expect(component.isLoggedIn).toBe(false);
    });

    it('should set userRole to empty string', () => {
      component.onLogout();

      expect(component.userRole).toBe('');
    });

    it('should navigate to login page', () => {
      component.onLogout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should perform all logout operations', () => {
      component.onLogout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should work when already logged out', () => {
      component.isLoggedIn = false;
      component.userRole = '';

      component.onLogout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should work when userRole is already empty', () => {
      component.isLoggedIn = true;
      component.userRole = '';

      component.onLogout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Navigation Links', () => {
    it('should have correct structure for each navLink', () => {
      component.navLinks.forEach(link => {
        expect(link).toHaveProperty('text');
        expect(link).toHaveProperty('url');
        expect(typeof link.text).toBe('string');
        expect(typeof link.url).toBe('string');
        expect(link.text.length).toBeGreaterThan(0);
        expect(link.url.length).toBeGreaterThan(0);
      });
    });

    it('should have specific navigation links', () => {
      const expectedLinks = [
        { text: 'Compra', url: '/compra' },
        { text: 'Renta', url: '/renta' },
        { text: 'Vende', url: '/vende' }
      ];

      expect(component.navLinks).toEqual(expectedLinks);
    });

    it('should have all URLs starting with forward slash', () => {
      component.navLinks.forEach(link => {
        expect(link.url).toMatch(/^\/.*$/);
      });
    });

    it('should not have duplicate URLs', () => {
      const urls = component.navLinks.map(link => link.url);
      const uniqueUrls = [...new Set(urls)];
      expect(urls).toHaveLength(uniqueUrls.length);
    });

    it('should not have duplicate text values', () => {
      const texts = component.navLinks.map(link => link.text);
      const uniqueTexts = [...new Set(texts)];
      expect(texts).toHaveLength(uniqueTexts.length);
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should maintain state consistency during authentication flow', () => {
      // Initial state - not authenticated
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');

      // Simulate login
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');
      
      component['checkAuthStatus']();
      
      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe('admin');

      // Simulate logout
      component.onLogout();
      
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
    });

    it('should handle multiple role changes', () => {
      // First login as user
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('user');
      component['checkAuthStatus']();
      expect(component.userRole).toBe('user');

      // Change to admin
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');
      component['checkAuthStatus']();
      expect(component.userRole).toBe('admin');

      // Change to client
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('client');
      component['checkAuthStatus']();
      expect(component.userRole).toBe('client');
    });

    it('should preserve navLinks regardless of authentication state', () => {
      const originalNavLinks = [...component.navLinks];

      // Test when not authenticated
      component['checkAuthStatus']();
      expect(component.navLinks).toEqual(originalNavLinks);

      // Test when authenticated
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');
      component['checkAuthStatus']();
      expect(component.navLinks).toEqual(originalNavLinks);

      // Test after logout
      component.onLogout();
      expect(component.navLinks).toEqual(originalNavLinks);
    });

    it('should preserve static properties during component lifecycle', () => {
      const originalLogoSrc = component.logoSrc;
      const originalLogoAlt = component.logoAlt;
      const originalButtonText = component.buttonText;
      const originalButtonLink = component.buttonLink;

      // After ngOnInit
      component.ngOnInit();
      expect(component.logoSrc).toBe(originalLogoSrc);
      expect(component.logoAlt).toBe(originalLogoAlt);
      expect(component.buttonText).toBe(originalButtonText);
      expect(component.buttonLink).toBe(originalButtonLink);

      // After logout
      component.onLogout();
      expect(component.logoSrc).toBe(originalLogoSrc);
      expect(component.logoAlt).toBe(originalLogoAlt);
      expect(component.buttonText).toBe(originalButtonText);
      expect(component.buttonLink).toBe(originalButtonLink);
    });
  });

  describe('Edge Cases', () => {
    it('should maintain initial state when checkAuthStatus is not called', () => {
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
    });

    it('should handle special characters in user role', () => {
      const specialRole = 'super-admin_123!@#';
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(specialRole);

      component['checkAuthStatus']();

      expect(component.userRole).toBe(specialRole);
    });

    it('should handle very long user role string', () => {
      const longRole = 'a'.repeat(100);
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(longRole);

      component['checkAuthStatus']();

      expect(component.userRole).toBe(longRole);
      expect(component.userRole.length).toBe(100);
    });

    it('should handle numeric user role', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(123);

      component['checkAuthStatus']();

      expect(component.userRole).toBe(123);
    });

    it('should handle boolean user role', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue(true);

      component['checkAuthStatus']();

      expect(component.userRole).toBe(true);
    });
  });

  describe('Service Method Calls', () => {
    it('should call isAuthenticated exactly once per checkAuthStatus call', () => {
      component['checkAuthStatus']();
      expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);

      component['checkAuthStatus']();
      expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(2);
    });

    it('should call getUserRole only when authenticated', () => {
      // Not authenticated
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
      component['checkAuthStatus']();
      expect(mockAuthService.getUserRole).toHaveBeenCalledTimes(0);

      // Authenticated
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      component['checkAuthStatus']();
      expect(mockAuthService.getUserRole).toHaveBeenCalledTimes(1);
    });

    it('should call logout exactly once per onLogout call', () => {
      component.onLogout();
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);

      component.onLogout();
      expect(mockAuthService.logout).toHaveBeenCalledTimes(2);
    });

    it('should call router.navigate exactly once per onLogout call', () => {
      component.onLogout();
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);

      component.onLogout();
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    });

    it('should always navigate to login on logout', () => {
      component.onLogout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);

      component.onLogout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Property State Management', () => {
    it('should reset isLoggedIn correctly on logout', () => {
      component.isLoggedIn = true;
      component.onLogout();
      expect(component.isLoggedIn).toBe(false);

      component.isLoggedIn = true;
      component.onLogout();
      expect(component.isLoggedIn).toBe(false);
    });

    it('should reset userRole correctly on logout', () => {
      component.userRole = 'admin';
      component.onLogout();
      expect(component.userRole).toBe('');

      component.userRole = 'client';
      component.onLogout();
      expect(component.userRole).toBe('');
    });

    it('should update both properties when authenticated', () => {
      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (mockAuthService.getUserRole as jest.Mock).mockReturnValue('admin');

      component['checkAuthStatus']();

      expect(component.isLoggedIn).toBe(true);
      expect(component.userRole).toBe('admin');
    });

    it('should update both properties when not authenticated', () => {
      // Start with authenticated state
      component.isLoggedIn = true;
      component.userRole = 'admin';

      (mockAuthService.isAuthenticated as jest.Mock).mockReturnValue(false);

      component['checkAuthStatus']();

      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
    });
  });
});
