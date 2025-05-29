import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UserFormComponent } from './user-form.component';
import { UserService } from 'src/app/core/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/shared/models/User';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockUserService: Partial<UserService>;
  let mockToastrService: Partial<ToastrService>;

  // Mock data
  const mockUserResponse: User = {
    name: 'Juan',
    lastName: 'Pérez',
    identification: 12345678,
    phone: '+573123456789',
    email: 'juan.perez@email.com',
    password: 'password123',
    birthDate: '1990-01-01',
    roleId: 2
  };

  beforeEach(async () => {
    // Crear mocks de los servicios
    mockUserService = {
      createUser: jest.fn()
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockUserService.createUser as jest.Mock).mockReturnValue(of(mockUserResponse));

    await TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ToastrService, useValue: mockToastrService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // ✅ Ignorar errores de template
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
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
    it('should initialize maxBirthDate correctly', () => {
      const today = new Date();
      const expectedYear = today.getFullYear() - 18;
      
      expect(component.maxBirthDate).toContain(expectedYear.toString());
      expect(component.maxBirthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Formato YYYY-MM-DD
    });

    it('should initialize roles array', () => {
      expect(component.roles).toEqual([{ id: 2, name: 'Vendedor' }]);
    });

    it('should initialize maxLength properties', () => {
      expect(component.nameMaxLength).toBe(50);
      expect(component.lastNameMaxLength).toBe(50);
      expect(component.phoneMaxLength).toBe(13);
      expect(component.emailMaxLength).toBe(100);
      expect(component.passwordMaxLength).toBe(30);
    });

    it('should initialize isSubmitting as false', () => {
      expect(component.isSubmitting).toBe(false);
    });
  });

  // TEST 3: Verificar inicialización del formulario
  describe('Form Initialization', () => {
    it('should initialize form with correct structure', () => {
      component.ngOnInit(); // Llamar manualmente ngOnInit
      
      expect(component.userForm).toBeDefined();
      expect(component.userForm.get('name')).toBeTruthy();
      expect(component.userForm.get('lastName')).toBeTruthy();
      expect(component.userForm.get('identification')).toBeTruthy();
      expect(component.userForm.get('phone')).toBeTruthy();
      expect(component.userForm.get('email')).toBeTruthy();
      expect(component.userForm.get('password')).toBeTruthy();
      expect(component.userForm.get('birthDate')).toBeTruthy();
      expect(component.userForm.get('roleId')).toBeTruthy();
    });

    it('should have empty initial values', () => {
      component.ngOnInit();
      
      expect(component.userForm.get('name')?.value).toBe('');
      expect(component.userForm.get('lastName')?.value).toBe('');
      expect(component.userForm.get('identification')?.value).toBe('');
      expect(component.userForm.get('phone')?.value).toBe('');
      expect(component.userForm.get('email')?.value).toBe('');
      expect(component.userForm.get('password')?.value).toBe('');
      expect(component.userForm.get('birthDate')?.value).toBe('');
      expect(component.userForm.get('roleId')?.value).toBeNull();
    });
  });

  // TEST 4: Verificar validaciones del formulario
  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when empty', () => {
      expect(component.userForm.valid).toBe(false);
    });

    it('should validate required fields', () => {
      const requiredFields = ['name', 'lastName', 'identification', 'phone', 'email', 'password', 'birthDate', 'roleId'];
      
      requiredFields.forEach(field => {
        const control = component.userForm.get(field);
        expect(control?.errors?.['required']).toBeTruthy();
      });
    });

    it('should validate maxLength for name field', () => {
      const nameControl = component.userForm.get('name');
      const longName = 'a'.repeat(51); // Excede 50 caracteres
      
      nameControl?.setValue(longName);
      
      expect(nameControl?.errors?.['maxlength']).toBeTruthy();
      expect(nameControl?.errors?.['maxlength'].actualLength).toBe(51);
      expect(nameControl?.errors?.['maxlength'].requiredLength).toBe(50);
    });

    it('should validate maxLength for lastName field', () => {
      const lastNameControl = component.userForm.get('lastName');
      const longLastName = 'b'.repeat(51); // Excede 50 caracteres
      
      lastNameControl?.setValue(longLastName);
      
      expect(lastNameControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should validate pattern for identification field', () => {
      const identificationControl = component.userForm.get('identification');
      
      identificationControl?.setValue('12345abc'); // Contiene letras
      expect(identificationControl?.errors?.['pattern']).toBeTruthy();
      
      identificationControl?.setValue('12345678'); // Solo números
      expect(identificationControl?.errors?.['pattern']).toBeFalsy();
    });

    it('should validate phone pattern and maxLength', () => {
      const phoneControl = component.userForm.get('phone');
      
      // Excede longitud máxima
      phoneControl?.setValue('12345678901234'); // 14 caracteres
      expect(phoneControl?.errors?.['maxlength']).toBeTruthy();
      
      // Formato inválido
      phoneControl?.setValue('123-456-7890'); // Con guiones
      expect(phoneControl?.errors?.['pattern']).toBeTruthy();
      
      // Formato válido
      phoneControl?.setValue('+573123456789');
      expect(phoneControl?.errors?.['pattern']).toBeFalsy();
      expect(phoneControl?.errors?.['maxlength']).toBeFalsy();
    });

    it('should validate email format and maxLength', () => {
      const emailControl = component.userForm.get('email');
      
      // Email inválido
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      
      // Email válido
      emailControl?.setValue('test@example.com');
      expect(emailControl?.errors?.['email']).toBeFalsy();
      
      // Excede longitud
      const longEmail = 'a'.repeat(90) + '@example.com'; // Más de 100 caracteres
      emailControl?.setValue(longEmail);
      expect(emailControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should validate password length', () => {
      const passwordControl = component.userForm.get('password');
      
      // Muy corta
      passwordControl?.setValue('123');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();
      
      // Muy larga
      passwordControl?.setValue('a'.repeat(31)); // Excede 30 caracteres
      expect(passwordControl?.errors?.['maxlength']).toBeTruthy();
      
      // Longitud válida
      passwordControl?.setValue('password123');
      expect(passwordControl?.errors?.['minlength']).toBeFalsy();
      expect(passwordControl?.errors?.['maxlength']).toBeFalsy();
    });
  });

  // TEST 5: Verificar validación personalizada de fecha de nacimiento
  describe('Birth Date Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      const birthDateControl = component.userForm.get('birthDate');
      birthDateControl?.setValue(tomorrowString);
      
      expect(birthDateControl?.errors?.['future']).toBeTruthy();
    });

    it('should validate minimum age (18 years)', () => {
      const today = new Date();
      const recentDate = new Date();
      recentDate.setFullYear(today.getFullYear() - 17); // 17 años
      const recentDateString = recentDate.toISOString().split('T')[0];
      
      const birthDateControl = component.userForm.get('birthDate');
      birthDateControl?.setValue(recentDateString);
      
      expect(birthDateControl?.errors?.['minAge']).toBeTruthy();
    });

    it('should validate maximum age (100 years)', () => {
      const today = new Date();
      const veryOldDate = new Date();
      veryOldDate.setFullYear(today.getFullYear() - 101); // 101 años
      const veryOldDateString = veryOldDate.toISOString().split('T')[0];
      
      const birthDateControl = component.userForm.get('birthDate');
      birthDateControl?.setValue(veryOldDateString);
      
      expect(birthDateControl?.errors?.['maxAge']).toBeTruthy();
    });

    it('should accept valid birth date', () => {
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 25); // 25 años
      const validDateString = validDate.toISOString().split('T')[0];
      
      const birthDateControl = component.userForm.get('birthDate');
      birthDateControl?.setValue(validDateString);
      
      expect(birthDateControl?.errors?.['future']).toBeFalsy();
      expect(birthDateControl?.errors?.['minAge']).toBeFalsy();
      expect(birthDateControl?.errors?.['maxAge']).toBeFalsy();
    });

    it('should return null for empty value', () => {
      const result = component.validateBirthDate({ value: null } as any);
      expect(result).toBeNull();
    });
  });

  // TEST 6: Verificar getters de contadores de caracteres
  describe('Character Counters', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should calculate nameCharsRemaining correctly', () => {
      const nameControl = component.userForm.get('name');
      
      nameControl?.setValue('Juan');
      expect(component.nameCharsRemaining).toBe(46); // 50 - 4
      
      nameControl?.setValue('');
      expect(component.nameCharsRemaining).toBe(50);
      
      nameControl?.setValue(null);
      expect(component.nameCharsRemaining).toBe(50);
    });

    it('should calculate descriptionCharsRemaining correctly', () => {
      const lastNameControl = component.userForm.get('lastName');
      
      lastNameControl?.setValue('Pérez');
      expect(component.descriptionCharsRemaining).toBe(45); // 50 - 5
      
      lastNameControl?.setValue('');
      expect(component.descriptionCharsRemaining).toBe(50);
    });

    it('should calculate phoneCharsRemaining correctly', () => {
      const phoneControl = component.userForm.get('phone');
      
      phoneControl?.setValue('+573123456789');
      expect(component.phoneCharsRemaining).toBe(0); // 13 - 13
      
      phoneControl?.setValue('123');
      expect(component.phoneCharsRemaining).toBe(10); // 13 - 3
    });

    it('should calculate emailCharsRemaining correctly', () => {
      const emailControl = component.userForm.get('email');
      
      emailControl?.setValue('test@example.com');
      expect(component.emailCharsRemaining).toBe(84); // 100 - 16
    });

    it('should calculate passwordCharsRemaining correctly', () => {
      const passwordControl = component.userForm.get('password');
      
      passwordControl?.setValue('password123');
      expect(component.passwordCharsRemaining).toBe(19); // 30 - 12
    });
  });

  // TEST 7: Verificar métodos helper
  describe('Helper Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('hasError', () => {
      it('should return false when control has no errors', () => {
        component.userForm.get('name')?.setValue('Valid Name');
        expect(component.hasError('name')).toBe(false);
      });

      it('should return false when control has errors but is not touched or dirty', () => {
        expect(component.hasError('name')).toBe(false);
      });

      it('should return true when control has errors and is touched', () => {
        component.userForm.get('name')?.markAsTouched();
        expect(component.hasError('name')).toBe(true);
      });

      it('should return true when control has errors and is dirty', () => {
        component.userForm.get('name')?.markAsDirty();
        expect(component.hasError('name')).toBe(true);
      });

      it('should return false for non-existent control', () => {
        expect(component.hasError('nonExistent')).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should return empty string when control has no errors', () => {
        component.userForm.get('name')?.setValue('Valid Name');
        expect(component.getErrorMessage('name')).toBe('');
      });

      it('should return required message', () => {
        const nameControl = component.userForm.get('name');
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Este campo es obligatorio');
      });

      it('should return maxlength messages for different fields', () => {
        // Name
        const nameControl = component.userForm.get('name');
        nameControl?.setValue('a'.repeat(51));
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Máximo 50 caracteres');

        // Phone
        const phoneControl = component.userForm.get('phone');
        phoneControl?.setValue('a'.repeat(14));
        phoneControl?.markAsTouched();
        expect(component.getErrorMessage('phone')).toBe('Máximo 13 caracteres');
      });

      it('should return minlength message for password', () => {
        const passwordControl = component.userForm.get('password');
        passwordControl?.setValue('123');
        passwordControl?.markAsTouched();
        expect(component.getErrorMessage('password')).toBe('La contraseña debe tener al menos 8 caracteres');
      });

      it('should return pattern messages for specific fields', () => {
        // Phone pattern
        const phoneControl = component.userForm.get('phone');
        phoneControl?.setErrors({ pattern: true });
        phoneControl?.markAsTouched();
        expect(component.getErrorMessage('phone')).toBe('Formato de teléfono inválido. Use números o un + al inicio ');

        // Identification pattern
        const idControl = component.userForm.get('identification');
        idControl?.setErrors({ pattern: true });
        idControl?.markAsTouched();
        expect(component.getErrorMessage('identification')).toBe('Formato de identificación inválido. Solo números');
      });

      it('should return email error message', () => {
        const emailControl = component.userForm.get('email');
        emailControl?.setErrors({ email: true });
        emailControl?.markAsTouched();
        expect(component.getErrorMessage('email')).toBe('Correo electrónico inválido');
      });

      it('should return birth date error messages', () => {
        const birthDateControl = component.userForm.get('birthDate');
        
        // Future date
        birthDateControl?.setErrors({ future: true });
        birthDateControl?.markAsTouched();
        expect(component.getErrorMessage('birthDate')).toBe('La fecha no puede ser futura');

        // Min age
        birthDateControl?.setErrors({ minAge: true });
        expect(component.getErrorMessage('birthDate')).toBe('Debes tener al menos 18 años');

        // Max age
        birthDateControl?.setErrors({ maxAge: true });
        expect(component.getErrorMessage('birthDate')).toBe('La edad máxima permitida es 100 años');
      });

      it('should return generic message for unknown errors', () => {
        const nameControl = component.userForm.get('name');
        nameControl?.setErrors({ unknownError: true });
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Campo inválido');
      });
    });
  });

  // TEST 8: Verificar envío del formulario
  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit invalid form', () => {
      component.onSubmit();

      expect(mockUserService.createUser as jest.Mock).not.toHaveBeenCalled();
      expect(component.userForm.get('name')?.touched).toBe(true);
      expect(component.userForm.get('email')?.touched).toBe(true);
    });

    it('should submit valid form successfully', () => {
      const validFormData = {
        name: 'Juan',
        lastName: 'Pérez',
        identification: '12345678',
        phone: '+573123456789',
        email: 'juan@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      };

      component.userForm.setValue(validFormData);

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();

      const expectedUserData: User = {
        name: 'Juan',
        lastName: 'Pérez',
        identification: 12345678, // Convertido a número
        phone: '+573123456789',
        email: 'juan@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2 // Convertido a número
      };

      expect(mockUserService.createUser as jest.Mock).toHaveBeenCalledWith(expectedUserData);
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith(
        'Usuario creado exitosamente',
        'Éxito'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error', () => {
      const errorResponse = { error: { message: 'Email ya existe' } };
      (mockUserService.createUser as jest.Mock).mockReturnValue(
        throwError(() => errorResponse)
      );

      const validFormData = {
        name: 'Juan',
        lastName: 'Pérez',
        identification: '12345678',
        phone: '+573123456789',
        email: 'juan@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      };

      component.userForm.setValue(validFormData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'Email ya existe',
        'Error'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error without specific message', () => {
      (mockUserService.createUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const validFormData = {
        name: 'Juan',
        lastName: 'Pérez',
        identification: '12345678',
        phone: '+573123456789',
        email: 'juan@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      };

      component.userForm.setValue(validFormData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'Ocurrió un error al crear el usuario',
        'Error'
      );
    });

    it('should reset form after successful submission', () => {
      const validFormData = {
        name: 'Juan',
        lastName: 'Pérez',
        identification: '12345678',
        phone: '+573123456789',
        email: 'juan@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      };

      component.userForm.setValue(validFormData);
      component.onSubmit();

      // Verificar que el formulario se resetea
      expect(component.userForm.get('name')?.value).toBeNull();
      expect(component.userForm.get('roleId')?.value).toBeNull();
    });
  });

  // TEST 9: Tests adicionales para cobertura completa
  describe('Additional Coverage', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should call initForm during ngOnInit', () => {
      const spy = jest.spyOn(component, 'initForm');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should handle edge cases in character counters with undefined values', () => {
      // Simular valores undefined en los controles
      component.userForm.get('name')?.setValue(undefined);
      expect(component.nameCharsRemaining).toBe(50);

      component.userForm.get('lastName')?.setValue(undefined);
      expect(component.descriptionCharsRemaining).toBe(50);
    });

    it('should validate complete user form with all fields', () => {
      const completeFormData = {
        name: 'Juan Carlos',
        lastName: 'Pérez González',
        identification: '1234567890',
        phone: '+573123456789',
        email: 'juan.carlos@example.com',
        password: 'securePassword123',
        birthDate: '1985-06-15',
        roleId: 2
      };

      component.userForm.setValue(completeFormData);
      expect(component.userForm.valid).toBe(true);
    });

    it('should mark all fields as touched when form is invalid on submission', () => {
      // Dejar formulario vacío (inválido)
      const allFields = ['name', 'lastName', 'identification', 'phone', 'email', 'password', 'birthDate', 'roleId'];
      
      // Verificar que no están tocados inicialmente
      allFields.forEach(field => {
        expect(component.userForm.get(field)?.touched).toBe(false);
      });

      // Intentar enviar
      component.onSubmit();

      // Verificar que ahora están marcados como tocados
      allFields.forEach(field => {
        expect(component.userForm.get(field)?.touched).toBe(true);
      });
    });
  });
});