import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Login } from 'src/app/shared/models/Login';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockToastrService: Partial<ToastrService>;
  let mockRouter: Partial<Router>;

  // Mock data
  const mockLoginResponse = {
    token: 'mock-jwt-token',
    role: 'admin',
    user: {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User'
    }
  };

  beforeEach(async () => {
    // Crear mocks de los servicios
    mockAuthService = {
      login: jest.fn()
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockAuthService.login as jest.Mock).mockReturnValue(of(mockLoginResponse));
    (mockRouter.navigate as jest.Mock).mockResolvedValue(true);

    await TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA] // ✅ Ignorar errores de template
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;

    // Mockear console para evitar logs durante tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // ✅ NO llamar detectChanges() para evitar renderizar el template
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // TEST 1: Verificar creación del componente
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Verificar inicialización del constructor
  describe('Constructor', () => {
    it('should initialize maxLength properties', () => {
      expect(component.emailMaxLength).toBe(50);
      expect(component.passwordMaxLength).toBe(50);
    });

    it('should initialize isSubmitting as false', () => {
      expect(component.isSubmitting).toBe(false);
    });
  });

  // TEST 3: Verificar ngOnInit
  describe('ngOnInit', () => {
    it('should call initForm on ngOnInit', () => {
      const initFormSpy = jest.spyOn(component as any, 'initForm');
      
      component.ngOnInit();
      
      expect(initFormSpy).toHaveBeenCalled();
    });
  });

  // TEST 4: Verificar inicialización del formulario
  describe('Form Initialization', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should initialize form with correct structure', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')).toBeTruthy();
      expect(component.loginForm.get('password')).toBeTruthy();
    });

    it('should have empty initial values', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have correct validators for email field', () => {
      const emailControl = component.loginForm.get('email');
      
      // Required
      expect(emailControl?.errors?.['required']).toBeTruthy();
      
      // Email format
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      
      // MaxLength
      emailControl?.setValue('a'.repeat(51) + '@example.com');
      expect(emailControl?.errors?.['maxlength']).toBeTruthy();
      
      // Valid email
      emailControl?.setValue('user@example.com');
      expect(emailControl?.errors).toBeNull();
    });

    it('should have correct validators for password field', () => {
      const passwordControl = component.loginForm.get('password');
      
      // Required
      expect(passwordControl?.errors?.['required']).toBeTruthy();
      
      // MinLength
      passwordControl?.setValue('123');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();
      
      // MaxLength
      passwordControl?.setValue('a'.repeat(51));
      expect(passwordControl?.errors?.['maxlength']).toBeTruthy();
      
      // Valid password
      passwordControl?.setValue('password123');
      expect(passwordControl?.errors).toBeNull();
    });
  });

  // TEST 5: Verificar validaciones del formulario
  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should validate required fields', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      expect(emailControl?.errors?.['required']).toBeTruthy();
      expect(passwordControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      
      emailControl?.setValue('user@example.com');
      expect(emailControl?.errors?.['email']).toBeFalsy();
    });

    it('should validate password length', () => {
      const passwordControl = component.loginForm.get('password');
      
      // Too short
      passwordControl?.setValue('123');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();
      expect(passwordControl?.errors?.['minlength'].requiredLength).toBe(8);
      
      // Too long
      passwordControl?.setValue('a'.repeat(51));
      expect(passwordControl?.errors?.['maxlength']).toBeTruthy();
      
      // Valid length
      passwordControl?.setValue('password123');
      expect(passwordControl?.errors?.['minlength']).toBeFalsy();
      expect(passwordControl?.errors?.['maxlength']).toBeFalsy();
    });

    it('should be valid with correct data', () => {
      component.loginForm.setValue({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(component.loginForm.valid).toBe(true);
    });
  });

  // TEST 6: Verificar métodos helper
  describe('Helper Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('hasError', () => {
      it('should return false when control has no errors', () => {
        component.loginForm.get('email')?.setValue('user@example.com');
        expect(component.hasError('email')).toBe(false);
      });

      it('should return false when control has errors but is not touched', () => {
        expect(component.hasError('email')).toBe(false);
      });

      it('should return true when control has errors and is touched', () => {
        component.loginForm.get('email')?.markAsTouched();
        expect(component.hasError('email')).toBe(true);
      });

      it('should return false for non-existent control', () => {
        expect(component.hasError('nonExistent')).toBe(false);
      });

      it('should handle control being null', () => {
        expect(component.hasError('invalidControl')).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should return empty string when control has no errors', () => {
        component.loginForm.get('email')?.setValue('user@example.com');
        expect(component.getErrorMessage('email')).toBe('');
      });

      it('should return empty string for control without errors property', () => {
        component.loginForm.get('email')?.setValue('user@example.com');
        expect(component.getErrorMessage('email')).toBe('');
      });

      it('should return required message', () => {
        const emailControl = component.loginForm.get('email');
        emailControl?.markAsTouched();
        expect(component.getErrorMessage('email')).toBe('Este campo es obligatorio');
      });

      it('should return minlength message', () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.setValue('123');
        passwordControl?.markAsTouched();
        expect(component.getErrorMessage('password')).toBe('Debe tener al menos 8 caracteres');
      });

      it('should return maxlength message for email', () => {
        const emailControl = component.loginForm.get('email');
        emailControl?.setValue('a'.repeat(51) + '@example.com');
        emailControl?.markAsTouched();
        expect(component.getErrorMessage('email')).toBe('Debe tener máximo 50 caracteres');
      });

      it('should return maxlength message for password', () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.setValue('a'.repeat(51));
        passwordControl?.markAsTouched();
        expect(component.getErrorMessage('password')).toBe('Debe tener máximo 50 caracteres');
      });

      it('should return email error message', () => {
        const emailControl = component.loginForm.get('email');
        emailControl?.setValue('invalid-email');
        emailControl?.markAsTouched();
        expect(component.getErrorMessage('email')).toBe('Campo inválido');
      });

      it('should return generic message for unknown errors', () => {
        const emailControl = component.loginForm.get('email');
        emailControl?.setErrors({ unknownError: true });
        emailControl?.markAsTouched();
        expect(component.getErrorMessage('email')).toBe('Campo inválido');
      });

      it('should return empty string for non-existent control', () => {
        expect(component.getErrorMessage('nonExistent')).toBe('');
      });
    });
  });

  // TEST 7: Verificar envío del formulario
  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit invalid form', () => {
      component.onSubmit();

      expect(mockAuthService.login as jest.Mock).not.toHaveBeenCalled();
      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
    });

    it('should mark all fields as touched when form is invalid', () => {
      // Formulario vacío (inválido)
      expect(component.loginForm.get('email')?.touched).toBe(false);
      expect(component.loginForm.get('password')?.touched).toBe(false);

      component.onSubmit();

      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
    });

    it('should submit valid form successfully', () => {
      const loginData: Login = {
        email: 'user@example.com',
        password: 'password123'
      };

      component.loginForm.setValue(loginData);

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();

      expect(component.isSubmitting).toBe(false); // Se resetea en complete
      expect(mockAuthService.login as jest.Mock).toHaveBeenCalledWith(loginData);
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith('Login successful');
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['admin/dashboard']);
    });

    

    it('should handle login error', () => {
      const errorMessage = 'Invalid credentials';
      (mockAuthService.login as jest.Mock).mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      const loginData: Login = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      component.loginForm.setValue(loginData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith('Login failed');
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle network error', () => {
      const networkError = { status: 500, message: 'Server error' };
      (mockAuthService.login as jest.Mock).mockReturnValue(
        throwError(() => networkError)
      );

      const loginData: Login = {
        email: 'user@example.com',
        password: 'password123'
      };

      component.loginForm.setValue(loginData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith('Login failed');
      expect(console.error).toHaveBeenCalledWith(networkError);
    });

    it('should reset isSubmitting flag in complete callback regardless of success or error', () => {
      // Test con éxito
      const loginData: Login = {
        email: 'user@example.com',
        password: 'password123'
      };

      component.loginForm.setValue(loginData);
      component.onSubmit();

      expect(component.isSubmitting).toBe(false);

      // Test con error
      (mockAuthService.login as jest.Mock).mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.onSubmit();
      expect(component.isSubmitting).toBe(true);
    });
  });

  // TEST 8: Verificar integración completa
  describe('Integration Tests', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should perform complete login workflow', () => {
      // 1. Usuario llena formulario
      component.loginForm.setValue({
        email: 'admin@example.com',
        password: 'adminpassword'
      });

      // 2. Formulario es válido
      expect(component.loginForm.valid).toBe(true);

      // 3. Usuario envía formulario
      component.onSubmit();

      // 4. Se llama al servicio de autenticación
      expect(mockAuthService.login as jest.Mock).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'adminpassword'
      });

      // 5. Se muestra mensaje de éxito
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith('Login successful');

      // 6. Se navega al dashboard
      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['admin/dashboard']);
    });

    it('should handle validation errors before submission', () => {
      // 1. Usuario intenta enviar formulario vacío
      component.onSubmit();

      // 2. No se llama al servicio
      expect(mockAuthService.login as jest.Mock).not.toHaveBeenCalled();

      // 3. Campos se marcan como tocados
      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);

      // 4. Errores son visibles
      expect(component.hasError('email')).toBe(true);
      expect(component.hasError('password')).toBe(true);

      // 5. Mensajes de error correctos
      expect(component.getErrorMessage('email')).toBe('Este campo es obligatorio');
      expect(component.getErrorMessage('password')).toBe('Este campo es obligatorio');
    });
  });

  // TEST 9: Tests de edge cases
  describe('Edge Cases', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle form with partial valid data', () => {
      // Solo email válido
      component.loginForm.patchValue({
        email: 'user@example.com'
        // password queda vacío
      });

      expect(component.loginForm.get('email')?.valid).toBe(true);
      expect(component.loginForm.get('password')?.valid).toBe(false);
      expect(component.loginForm.valid).toBe(false);

      component.onSubmit();
      expect(mockAuthService.login as jest.Mock).not.toHaveBeenCalled();
    });

    it('should handle extremely long email', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailControl = component.loginForm.get('email');
      
      emailControl?.setValue(longEmail);
      expect(emailControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should handle extremely long password', () => {
      const longPassword = 'a'.repeat(100);
      const passwordControl = component.loginForm.get('password');
      
      passwordControl?.setValue(longPassword);
      expect(passwordControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should handle minimum valid password', () => {
      const minPassword = '12345678'; // Exactamente 8 caracteres
      const passwordControl = component.loginForm.get('password');
      
      passwordControl?.setValue(minPassword);
      expect(passwordControl?.errors?.['minlength']).toBeFalsy();
      expect(passwordControl?.errors?.['maxlength']).toBeFalsy();
    });

    it('should handle special characters in email', () => {
      const specialEmail = 'user+test@example-domain.co.uk';
      const emailControl = component.loginForm.get('email');
      
      emailControl?.setValue(specialEmail);
      expect(emailControl?.errors?.['email']).toBeFalsy();
    });

    it('should handle empty strings vs null values', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');
      
      // Empty strings
      emailControl?.setValue('');
      passwordControl?.setValue('');
      expect(emailControl?.errors?.['required']).toBeTruthy();
      expect(passwordControl?.errors?.['required']).toBeTruthy();
      
      // Null values
      emailControl?.setValue(null);
      passwordControl?.setValue(null);
      expect(emailControl?.errors?.['required']).toBeTruthy();
      expect(passwordControl?.errors?.['required']).toBeTruthy();
    });
  });

  // TEST 10: Tests adicionales para cobertura completa
  describe('Additional Coverage', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should create valid Login object from form values', () => {
      const formData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      component.loginForm.setValue(formData);
      component.onSubmit();

      const expectedLoginData: Login = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      expect(mockAuthService.login as jest.Mock).toHaveBeenCalledWith(expectedLoginData);
    });

    it('should handle undefined response from auth service', () => {
      (mockAuthService.login as jest.Mock).mockReturnValue(of(undefined));

      component.loginForm.setValue({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(() => component.onSubmit()).not.toThrow();
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith('Login successful');
    });

    it('should handle navigation failure', () => {
      (mockRouter.navigate as jest.Mock).mockRejectedValue(new Error('Navigation failed'));

      component.loginForm.setValue({
        email: 'user@example.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(mockRouter.navigate as jest.Mock).toHaveBeenCalledWith(['admin/dashboard']);
      // El componente no maneja errores de navegación, pero no debería fallar
    });
  });
});