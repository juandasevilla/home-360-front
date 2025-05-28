import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserFormComponent } from './user-form.component';
import { UserService } from 'src/app/core/user/user.service';
import { Component, Input } from '@angular/core';
import { User } from 'src/app/shared/models/User';

// Componentes mock para evitar dependencias
@Component({
  selector: 'app-form-field',
  template: '<ng-content></ng-content>'
})
class MockFormFieldComponent {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';
}

@Component({
  selector: 'app-input',
  template: '<input />'
})
class MockInputComponent {
  @Input() id: string = '';
  @Input() formControlName: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() maxLength: number = 0;
  @Input() showCharCount: boolean = false;
}

@Component({
  selector: 'app-button',
  template: '<button></button>'
})
class MockButtonComponent {
  @Input() text: string = '';
  @Input() type: string = '';
  @Input() disabled: boolean = false;
}

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockUserService: jest.Mocked<UserService>;
  let mockToastrService: jest.Mocked<ToastrService>;

  beforeEach(() => {
    // Crear mocks para los servicios
    mockUserService = {
      createUser: jest.fn()
    } as unknown as jest.Mocked<UserService>;
    
    mockToastrService = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    TestBed.configureTestingModule({
      declarations: [
        UserFormComponent,
        MockFormFieldComponent,
        MockInputComponent,
        MockButtonComponent
      ],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: mockUserService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    component.ngOnInit(); // Llamar manualmente a ngOnInit para inicializar el formulario
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.get('name')?.value).toBe('');
    expect(component.userForm.get('lastName')?.value).toBe('');
    expect(component.userForm.get('identification')?.value).toBe('');
    expect(component.userForm.get('phone')?.value).toBe('');
    expect(component.userForm.get('email')?.value).toBe('');
    expect(component.userForm.get('password')?.value).toBe('');
    expect(component.userForm.get('birthDate')?.value).toBe('');
    expect(component.userForm.get('roleId')?.value).toBeNull();
  });

  it('should set maxBirthDate to 18 years ago', () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    const expectedDate = today.toISOString().split('T')[0];
    expect(component.maxBirthDate).toBe(expectedDate);
  });

  describe('form validation', () => {
    it('should validate required fields', () => {
      // Todos los campos deberían ser inválidos cuando están vacíos
      expect(component.userForm.get('name')?.valid).toBe(false);
      expect(component.userForm.get('lastName')?.valid).toBe(false);
      expect(component.userForm.get('identification')?.valid).toBe(false);
      expect(component.userForm.get('phone')?.valid).toBe(false);
      expect(component.userForm.get('email')?.valid).toBe(false);
      expect(component.userForm.get('password')?.valid).toBe(false);
      expect(component.userForm.get('birthDate')?.valid).toBe(false);
      expect(component.userForm.get('roleId')?.valid).toBe(false);
      
      // El formulario completo debería ser inválido
      expect(component.userForm.valid).toBe(false);
    });

    it('should validate name max length', () => {
      // Nombre demasiado largo
      const longName = 'a'.repeat(51);
      component.userForm.get('name')?.setValue(longName);
      
      expect(component.userForm.get('name')?.valid).toBe(false);
      expect(component.userForm.get('name')?.errors?.['maxlength']).toBeTruthy();
      
      // Nombre válido
      component.userForm.get('name')?.setValue('John');
      expect(component.userForm.get('name')?.valid).toBe(true);
    });

    it('should validate identification format', () => {
      // Identificación con letras (inválido)
      component.userForm.get('identification')?.setValue('12345A');
      
      expect(component.userForm.get('identification')?.valid).toBe(false);
      expect(component.userForm.get('identification')?.errors?.['pattern']).toBeTruthy();
      
      // Identificación válida
      component.userForm.get('identification')?.setValue('123456789');
      expect(component.userForm.get('identification')?.valid).toBe(true);
    });

    it('should validate phone format', () => {
      // Teléfono con letras (inválido)
      component.userForm.get('phone')?.setValue('123-456');
      
      expect(component.userForm.get('phone')?.valid).toBe(false);
      expect(component.userForm.get('phone')?.errors?.['pattern']).toBeTruthy();
      
      // Teléfono válido
      component.userForm.get('phone')?.setValue('3001234567');
      expect(component.userForm.get('phone')?.valid).toBe(true);
      
      // Teléfono con + válido
      component.userForm.get('phone')?.setValue('+573001234567');
      expect(component.userForm.get('phone')?.valid).toBe(true);
    });

    it('should validate email format', () => {
      // Email inválido
      component.userForm.get('email')?.setValue('invalid-email');
      
      expect(component.userForm.get('email')?.valid).toBe(false);
      expect(component.userForm.get('email')?.errors?.['email']).toBeTruthy();
      
      // Email válido
      component.userForm.get('email')?.setValue('test@example.com');
      expect(component.userForm.get('email')?.valid).toBe(true);
    });

    it('should validate password minimum length', () => {
      // Contraseña demasiado corta
      component.userForm.get('password')?.setValue('123');
      
      expect(component.userForm.get('password')?.valid).toBe(false);
      expect(component.userForm.get('password')?.errors?.['minlength']).toBeTruthy();
      
      // Contraseña válida
      component.userForm.get('password')?.setValue('password123');
      expect(component.userForm.get('password')?.valid).toBe(true);
    });
  });

  describe('birthDate validation', () => {
    it('should reject future dates', () => {
      // Fecha futura
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      component.userForm.get('birthDate')?.setValue(futureDate.toISOString().split('T')[0]);
      
      expect(component.userForm.get('birthDate')?.valid).toBe(false);
      expect(component.userForm.get('birthDate')?.errors?.['future']).toBeTruthy();
    });

    it('should reject dates less than 18 years ago', () => {
      // Fecha de hace 17 años
      const date17YearsAgo = new Date();
      date17YearsAgo.setFullYear(date17YearsAgo.getFullYear() - 17);
      
      component.userForm.get('birthDate')?.setValue(date17YearsAgo.toISOString().split('T')[0]);
      
      expect(component.userForm.get('birthDate')?.valid).toBe(false);
      expect(component.userForm.get('birthDate')?.errors?.['minAge']).toBeTruthy();
    });

    it('should reject dates more than 100 years ago', () => {
      // Fecha de hace 101 años
      const date101YearsAgo = new Date();
      date101YearsAgo.setFullYear(date101YearsAgo.getFullYear() - 101);
      
      component.userForm.get('birthDate')?.setValue(date101YearsAgo.toISOString().split('T')[0]);
      
      expect(component.userForm.get('birthDate')?.valid).toBe(false);
      expect(component.userForm.get('birthDate')?.errors?.['maxAge']).toBeTruthy();
    });

    it('should accept valid dates between 18 and 100 years ago', () => {
      // Fecha de hace 30 años
      const date30YearsAgo = new Date();
      date30YearsAgo.setFullYear(date30YearsAgo.getFullYear() - 30);
      
      component.userForm.get('birthDate')?.setValue(date30YearsAgo.toISOString().split('T')[0]);
      
      expect(component.userForm.get('birthDate')?.valid).toBe(true);
      expect(component.userForm.get('birthDate')?.errors).toBeNull();
    });
  });

  describe('chars remaining methods', () => {
    it('should calculate remaining characters for name', () => {
      component.userForm.get('name')?.setValue('John');
      expect(component.nameCharsRemaining).toBe(46); // 50 - 4
      
      component.userForm.get('name')?.setValue('');
      expect(component.nameCharsRemaining).toBe(50);
    });

    it('should calculate remaining characters for email', () => {
      component.userForm.get('email')?.setValue('test@example.com');
      expect(component.emailCharsRemaining).toBe(100 - 16); // 100 - 16
    });
  });

  describe('hasError and getErrorMessage methods', () => {
    it('should return false for hasError when field is valid', () => {
      component.userForm.get('name')?.setValue('John');
      expect(component.hasError('name')).toBe(false);
    });

    it('should return false for hasError when field has errors but is not touched', () => {
      // El campo está vacío (error) pero no ha sido tocado
      expect(component.hasError('name')).toBe(false);
    });

    it('should return true for hasError when field has errors and is touched', () => {
      // Marcar como tocado
      component.userForm.get('name')?.markAsTouched();
      expect(component.hasError('name')).toBe(true);
    });

    it('should return required error message', () => {
      component.userForm.get('name')?.markAsTouched();
      expect(component.getErrorMessage('name')).toBe('Este campo es obligatorio');
    });

    it('should return maxlength error message', () => {
      const longName = 'a'.repeat(51);
      component.userForm.get('name')?.setValue(longName);
      component.userForm.get('name')?.markAsTouched();
      
      expect(component.getErrorMessage('name')).toBe('Máximo 50 caracteres');
    });

    it('should return pattern error message for identification', () => {
      component.userForm.get('identification')?.setValue('123ABC');
      component.userForm.get('identification')?.markAsTouched();
      
      expect(component.getErrorMessage('identification')).toBe('Formato de identificación inválido. Solo números');
    });

    it('should return pattern error message for phone', () => {
      component.userForm.get('phone')?.setValue('123-456');
      component.userForm.get('phone')?.markAsTouched();
      
      expect(component.getErrorMessage('phone')).toBe('Formato de teléfono inválido. Use números o un + al inicio ');
    });

    it('should return email error message', () => {
      component.userForm.get('email')?.setValue('invalid-email');
      component.userForm.get('email')?.markAsTouched();
      
      expect(component.getErrorMessage('email')).toBe('Correo electrónico inválido');
    });

    it('should return minlength error message for password', () => {
      component.userForm.get('password')?.setValue('123');
      component.userForm.get('password')?.markAsTouched();
      
      expect(component.getErrorMessage('password')).toBe('La contraseña debe tener al menos 8 caracteres');
    });
  });

  describe('onSubmit method', () => {
    it('should not submit if form is invalid', () => {
      // El formulario está inicialmente vacío e inválido
      component.onSubmit();
      
      // Verificar que no se llamó al servicio
      expect(mockUserService.createUser).not.toHaveBeenCalled();
      
      // Verificar que los campos se marcaron como tocados
      expect(component.userForm.get('name')?.touched).toBe(true);
      expect(component.userForm.get('lastName')?.touched).toBe(true);
    });

    it('should submit valid form data and show success message', () => {
      // Configurar respuesta exitosa
      const mockUser: User = {
        name: 'John',
        lastName: 'Doe',
        identification: 123456789,
        phone: '3001234567',
        email: 'john@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      };
      
      mockUserService.createUser.mockReturnValue(of(mockUser));
      
      // Completar el formulario con datos válidos
      component.userForm.setValue({
        name: 'John',
        lastName: 'Doe',
        identification: '123456789',
        phone: '3001234567',
        email: 'john@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      });
      
      // Enviar el formulario
      component.onSubmit();
      
      // Verificar que se llamó al servicio con los datos correctos
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        name: 'John',
        lastName: 'Doe',
        identification: 123456789,
        phone: '3001234567',
        email: 'john@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      });
      
      // Verificar que se mostró un mensaje de éxito
      expect(mockToastrService.success).toHaveBeenCalled();
      
      // Verificar que isSubmitting volvió a false
      expect(component.isSubmitting).toBe(false);
      
      // Verificar que el formulario se reinició
      expect(component.userForm.get('name')?.value).toBe(null);
      expect(component.userForm.get('roleId')?.value).toBeNull();
    });

    it('should handle error on submit', () => {
      // Configurar respuesta de error
      mockUserService.createUser.mockReturnValue(
        throwError(() => ({ error: { message: 'Error de prueba' } }))
      );
      
      // Completar el formulario con datos válidos
      component.userForm.setValue({
        name: 'John',
        lastName: 'Doe',
        identification: '123456789',
        phone: '3001234567',
        email: 'john@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        roleId: 2
      });
      
      // Enviar el formulario
      component.onSubmit();
      
      // Verificar que se mostró un mensaje de error
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Error de prueba', 
        'Error'
      );
      
      // Verificar que isSubmitting volvió a false
      expect(component.isSubmitting).toBe(false);
    });
  });
});
