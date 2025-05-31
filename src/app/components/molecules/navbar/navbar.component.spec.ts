import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor and Initial State', () => {
    it('should initialize with default values', () => {
      expect(component.logoSrc).toBe('assets/images/logo360.png');
      expect(component.logoAlt).toBe('Hogar360');
      expect(component.buttonText).toBe('Ingresar');
      expect(component.buttonLink).toBe('/login');
      expect(component.isLoggedIn).toBe(false);
      expect(component.userRole).toBe('');
      expect(component.showDropdown).toBe(false);
    });

    it('should initialize navLinks with default values', () => {
      expect(component.navLinks).toEqual([
        { text: 'Compra', url: '/compra' },
        { text: 'Renta', url: '/renta' },
        { text: 'Vende', url: '/vende' }
      ]);
    });

    it('should have EventEmitter for logoutClicked', () => {
      expect(component.logoutClicked).toBeDefined();
      expect(typeof component.logoutClicked.emit).toBe('function');
    });
  });

  describe('onButtonClick', () => {
    it('should navigate to default buttonLink', () => {
      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to custom buttonLink', () => {
      component.buttonLink = '/register';

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to empty buttonLink', () => {
      component.buttonLink = '';

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to buttonLink with special characters', () => {
      component.buttonLink = '/path-with_special@chars';

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/path-with_special@chars']);
    });

    it('should navigate to buttonLink with query parameters', () => {
      component.buttonLink = '/login?redirect=/dashboard';

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login?redirect=/dashboard']);
    });

    it('should navigate to relative path', () => {
      component.buttonLink = 'relative/path';

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['relative/path']);
    });

    it('should navigate to root path', () => {
      component.buttonLink = '/';

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to deep nested path', () => {
      component.buttonLink = '/level1/level2/level3';

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/level1/level2/level3']);
    });

    it('should work when called multiple times', () => {
      component.onButtonClick();
      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/login']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/login']);
    });

    it('should work with different buttonLinks in sequence', () => {
      component.buttonLink = '/first';
      component.onButtonClick();

      component.buttonLink = '/second';
      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/first']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/second']);
    });

    it('should handle buttonLink set to null', () => {
      component.buttonLink = null as any;

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith([null]);
    });

    it('should handle buttonLink set to undefined', () => {
      component.buttonLink = undefined as any;

      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith([undefined]);
    });
  });

  describe('toggleDropdown', () => {
    it('should toggle showDropdown from false to true', () => {
      component.showDropdown = false;

      component.toggleDropdown();

      expect(component.showDropdown).toBe(true);
    });

    it('should toggle showDropdown from true to false', () => {
      component.showDropdown = true;

      component.toggleDropdown();

      expect(component.showDropdown).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      component.showDropdown = false;

      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);

      component.toggleDropdown();
      expect(component.showDropdown).toBe(false);

      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);
    });

    it('should work with initial state', () => {
      // showDropdown is false by default
      expect(component.showDropdown).toBe(false);

      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);
    });

    it('should handle rapid toggling', () => {
      component.showDropdown = false;

      for (let i = 0; i < 10; i++) {
        component.toggleDropdown();
      }

      expect(component.showDropdown).toBe(false); // Should be false after even number of toggles
    });

    it('should not affect other component properties', () => {
      const originalButtonLink = component.buttonLink;
      const originalIsLoggedIn = component.isLoggedIn;
      const originalUserRole = component.userRole;

      component.toggleDropdown();

      expect(component.buttonLink).toBe(originalButtonLink);
      expect(component.isLoggedIn).toBe(originalIsLoggedIn);
      expect(component.userRole).toBe(originalUserRole);
    });

    it('should work when showDropdown is explicitly set to boolean values', () => {
      component.showDropdown = true;
      component.toggleDropdown();
      expect(component.showDropdown).toBe(false);

      component.showDropdown = false;
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);
    });

    it('should handle truthy/falsy values correctly', () => {
      // Test with truthy value
      component.showDropdown = 'true' as any;
      component.toggleDropdown();
      expect(component.showDropdown).toBe(false);

      // Test with falsy value
      component.showDropdown = 0 as any;
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);
    });
  });

  describe('onLogout', () => {
    beforeEach(() => {
      jest.spyOn(component.logoutClicked, 'emit');
    });

    it('should set showDropdown to false', () => {
      component.showDropdown = true;

      component.onLogout();

      expect(component.showDropdown).toBe(false);
    });

    it('should emit logoutClicked event', () => {
      component.onLogout();

      expect(component.logoutClicked.emit).toHaveBeenCalled();
      expect(component.logoutClicked.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit logoutClicked with no parameters', () => {
      component.onLogout();

      expect(component.logoutClicked.emit).toHaveBeenCalledWith();
    });

    it('should perform both actions when showDropdown is true', () => {
      component.showDropdown = true;

      component.onLogout();

      expect(component.showDropdown).toBe(false);
      expect(component.logoutClicked.emit).toHaveBeenCalled();
    });

    it('should perform both actions when showDropdown is false', () => {
      component.showDropdown = false;

      component.onLogout();

      expect(component.showDropdown).toBe(false);
      expect(component.logoutClicked.emit).toHaveBeenCalled();
    });

    it('should work when called multiple times', () => {
      component.onLogout();
      component.onLogout();

      expect(component.showDropdown).toBe(false);
      expect(component.logoutClicked.emit).toHaveBeenCalledTimes(2);
    });

    it('should not affect other component properties', () => {
      const originalButtonLink = component.buttonLink;
      const originalIsLoggedIn = component.isLoggedIn;
      const originalUserRole = component.userRole;

      component.onLogout();

      expect(component.buttonLink).toBe(originalButtonLink);
      expect(component.isLoggedIn).toBe(originalIsLoggedIn);
      expect(component.userRole).toBe(originalUserRole);
    });

    it('should always set showDropdown to false regardless of initial value', () => {
      component.showDropdown = true;
      component.onLogout();
      expect(component.showDropdown).toBe(false);

      component.showDropdown = false;
      component.onLogout();
      expect(component.showDropdown).toBe(false);

      component.showDropdown = 'true' as any;
      component.onLogout();
      expect(component.showDropdown).toBe(false);
    });

    
  });

  describe('closeDropdown', () => {
    it('should set showDropdown to false when it is true', () => {
      component.showDropdown = true;

      component.closeDropdown();

      expect(component.showDropdown).toBe(false);
    });

    it('should keep showDropdown false when it is already false', () => {
      component.showDropdown = false;

      component.closeDropdown();

      expect(component.showDropdown).toBe(false);
    });

    it('should work with initial state', () => {
      // showDropdown is false by default
      expect(component.showDropdown).toBe(false);

      component.closeDropdown();

      expect(component.showDropdown).toBe(false);
    });

    it('should work when called multiple times', () => {
      component.showDropdown = true;

      component.closeDropdown();
      component.closeDropdown();
      component.closeDropdown();

      expect(component.showDropdown).toBe(false);
    });

    it('should not affect other component properties', () => {
      const originalButtonLink = component.buttonLink;
      const originalIsLoggedIn = component.isLoggedIn;
      const originalUserRole = component.userRole;

      component.closeDropdown();

      expect(component.buttonLink).toBe(originalButtonLink);
      expect(component.isLoggedIn).toBe(originalIsLoggedIn);
      expect(component.userRole).toBe(originalUserRole);
    });

    it('should not emit any events', () => {
      jest.spyOn(component.logoutClicked, 'emit');

      component.closeDropdown();

      expect(component.logoutClicked.emit).not.toHaveBeenCalled();
    });

    it('should handle truthy/falsy values correctly', () => {
      component.showDropdown = 'true' as any;
      component.closeDropdown();
      expect(component.showDropdown).toBe(false);

      component.showDropdown = 1 as any;
      component.closeDropdown();
      expect(component.showDropdown).toBe(false);

      component.showDropdown = [] as any;
      component.closeDropdown();
      expect(component.showDropdown).toBe(false);
    });

    it('should work in sequence with other dropdown methods', () => {
      // Open dropdown
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);

      // Close dropdown
      component.closeDropdown();
      expect(component.showDropdown).toBe(false);

      // Open again
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);

      // Close again
      component.closeDropdown();
      expect(component.showDropdown).toBe(false);
    });

    it('should be different from onLogout functionality', () => {
      jest.spyOn(component.logoutClicked, 'emit');
      component.showDropdown = true;

      component.closeDropdown();

      expect(component.showDropdown).toBe(false);
      expect(component.logoutClicked.emit).not.toHaveBeenCalled();
    });
  });

  describe('Integration between dropdown methods', () => {
    it('should work correctly when using toggleDropdown and closeDropdown together', () => {
      component.showDropdown = false;

      component.toggleDropdown(); // Should open
      expect(component.showDropdown).toBe(true);

      component.closeDropdown(); // Should close
      expect(component.showDropdown).toBe(false);

      component.toggleDropdown(); // Should open again
      expect(component.showDropdown).toBe(true);
    });

    it('should work correctly when using onLogout after toggleDropdown', () => {
      jest.spyOn(component.logoutClicked, 'emit');
      component.showDropdown = false;

      component.toggleDropdown(); // Open dropdown
      expect(component.showDropdown).toBe(true);

      component.onLogout(); // Should close and emit
      expect(component.showDropdown).toBe(false);
      expect(component.logoutClicked.emit).toHaveBeenCalled();
    });

    it('should maintain proper state through multiple operations', () => {
      jest.spyOn(component.logoutClicked, 'emit');

      // Initial state
      expect(component.showDropdown).toBe(false);

      // Open dropdown
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);

      // Close dropdown
      component.closeDropdown();
      expect(component.showDropdown).toBe(false);

      // Open dropdown again
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);

      // Logout (should close and emit)
      component.onLogout();
      expect(component.showDropdown).toBe(false);
      expect(component.logoutClicked.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input property interactions', () => {
    it('should not affect navigation when Input properties change', () => {
      component.buttonLink = '/original';
      component.onButtonClick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/original']);

      // Change input property
      component.buttonLink = '/changed';
      component.onButtonClick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/changed']);
    });

    it('should maintain dropdown state independently of other inputs', () => {
      component.showDropdown = true;
      
      // Change other inputs
      component.isLoggedIn = true;
      component.userRole = 'admin';
      component.buttonText = 'Changed';

      expect(component.showDropdown).toBe(true);

      component.closeDropdown();
      expect(component.showDropdown).toBe(false);
    });

    it('should handle navLinks input without affecting dropdown', () => {
      component.navLinks = [{ text: 'Test', url: '/test' }];
      
      component.toggleDropdown();
      expect(component.showDropdown).toBe(true);
      expect(component.navLinks).toEqual([{ text: 'Test', url: '/test' }]);
    });
  });

  describe('Router dependency', () => {
    it('should call router.navigate with array format', () => {
      component.buttonLink = '/test';
      component.onButtonClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(expect.any(Array));
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
    });

    it('should inject Router service correctly', () => {
      expect(component['router']).toBeDefined();
      expect(component['router']).toBe(mockRouter);
    });

    it('should not call router.navigate from dropdown methods', () => {
      component.toggleDropdown();
      component.closeDropdown();
      component.onLogout();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('EventEmitter functionality', () => {
    

    it('should only emit from onLogout method', () => {
      jest.spyOn(component.logoutClicked, 'emit');

      component.onButtonClick();
      component.toggleDropdown();
      component.closeDropdown();

      expect(component.logoutClicked.emit).not.toHaveBeenCalled();

      component.onLogout();
      expect(component.logoutClicked.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit without any parameters', () => {
      jest.spyOn(component.logoutClicked, 'emit');

      component.onLogout();

      expect(component.logoutClicked.emit).toHaveBeenCalledWith();
    });
  });
});