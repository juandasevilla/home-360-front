import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CategoryFormComponent } from './category-form.component';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { Category } from 'src/app/shared/models/Category';
import { Component, Input } from '@angular/core';

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
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  @Input() maxLength: number = 0;
  @Input() showCharCount: boolean = false;
}

@Component({
  selector: 'app-textarea',
  template: '<textarea></textarea>'
})
class MockTextareaComponent {
  @Input() id: string = '';
  @Input() formControlName: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  @Input() maxLength: number = 0;
  @Input() showCharCount: boolean = false;
  @Input() currentLength: number = 0;
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

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let mockCategoryService: jest.Mocked<CategoryServiceService>;
  let mockToastrService: jest.Mocked<ToastrService>;

  beforeEach(() => {
    // Crear mocks para los servicios
    mockCategoryService = {
      createCategory: jest.fn()
    } as unknown as jest.Mocked<CategoryServiceService>;
    
    mockToastrService = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    TestBed.configureTestingModule({
      declarations: [
        CategoryFormComponent,
        MockFormFieldComponent,
        MockInputComponent,
        MockTextareaComponent,
        MockButtonComponent
      ],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: CategoryServiceService, useValue: mockCategoryService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.categoryForm).toBeDefined();
    expect(component.categoryForm.get('name')?.value).toBe('');
    expect(component.categoryForm.get('description')?.value).toBe('');
  });

  it('should have initial values for char counters', () => {
    expect(component.nameMaxLength).toBe(50);
    expect(component.descriptionMaxLength).toBe(90);
    expect(component.nameCharsRemaining).toBe(50);
    expect(component.descriptionCharsRemaining).toBe(90);
  });

  it('should update char counters when form values change', () => {
    // Simular entrada en el campo nombre
    component.categoryForm.get('name')?.setValue('Test Category');
    expect(component.nameCharsRemaining).toBe(38); // 50 - 12
    
    // Simular entrada en el campo descripción
    component.categoryForm.get('description')?.setValue('This is a test description');
    expect(component.descriptionCharsRemaining).toBe(64); // 90 - 26
  });

  it('should mark form as invalid when empty', () => {
    expect(component.categoryForm.valid).toBe(false);
  });

  it('should validate name is required', () => {
    const nameControl = component.categoryForm.get('name');
    expect(nameControl?.valid).toBe(false);
    expect(nameControl?.errors?.['required']).toBeTruthy();
    
    nameControl?.setValue('Test');
    expect(nameControl?.valid).toBe(true);
    expect(nameControl?.errors).toBeNull();
  });

  it('should validate description is required', () => {
    const descControl = component.categoryForm.get('description');
    expect(descControl?.valid).toBe(false);
    expect(descControl?.errors?.['required']).toBeTruthy();
    
    descControl?.setValue('Test Description');
    expect(descControl?.valid).toBe(true);
    expect(descControl?.errors).toBeNull();
  });

  it('should validate name max length', () => {
    const nameControl = component.categoryForm.get('name');
    // Crear un string más largo que el límite
    const longName = 'a'.repeat(51);
    
    nameControl?.setValue(longName);
    expect(nameControl?.valid).toBe(false);
    expect(nameControl?.errors?.['maxlength']).toBeTruthy();
  });

  it('should validate description max length', () => {
    const descControl = component.categoryForm.get('description');
    // Crear un string más largo que el límite
    const longDesc = 'a'.repeat(91);
    
    descControl?.setValue(longDesc);
    expect(descControl?.valid).toBe(false);
    expect(descControl?.errors?.['maxlength']).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    // El formulario comienza inválido (campos requeridos vacíos)
    component.onSubmit();
    
    // Verificar que el servicio no fue llamado
    expect(mockCategoryService.createCategory).not.toHaveBeenCalled();
    
    // Verificar que los controles fueron marcados como tocados
    expect(component.categoryForm.get('name')?.touched).toBe(true);
    expect(component.categoryForm.get('description')?.touched).toBe(true);
  });

  it('should submit when form is valid', () => {
    // Configurar respuesta exitosa
    mockCategoryService.createCategory.mockReturnValue(of({
      id: 1,
      name: 'Test Category',
      description: 'Test Description'
    }));
    
    // Completar el formulario con datos válidos
    component.categoryForm.setValue({
      name: 'Test Category',
      description: 'Test Description'
    });
    
    // Enviar el formulario
    component.onSubmit();
    
    // Verificar que isSubmitting fue true durante el envío
    expect(component.isSubmitting).toBe(false); // Debería volver a false después de completar
    
    // Verificar que el servicio fue llamado con los datos correctos
    expect(mockCategoryService.createCategory).toHaveBeenCalledWith({
      name: 'Test Category',
      description: 'Test Description'
    });
    
    // Verificar que se mostró un mensaje de éxito
    expect(mockToastrService.success).toHaveBeenCalled();
  });

  it('should handle errors on submit', () => {
    // Configurar respuesta de error
    mockCategoryService.createCategory.mockReturnValue(
      throwError(() => new Error('Server error'))
    );
    
    // Completar el formulario con datos válidos
    component.categoryForm.setValue({
      name: 'Test Category',
      description: 'Test Description'
    });
    
    // Enviar el formulario
    component.onSubmit();
    
    // Verificar que isSubmitting volvió a false
    expect(component.isSubmitting).toBe(false);
    
    // Verificar que se mostró un mensaje de error
    expect(mockToastrService.error).toHaveBeenCalled();
  });

  it('should reset form correctly', () => {
    // Primero configurar el formulario con algunos valores y errores
    component.categoryForm.setValue({
      name: 'Test',
      description: 'Description'
    });
    
    // Marcar controles como tocados
    component.categoryForm.get('name')?.markAsTouched();
    component.categoryForm.get('description')?.markAsTouched();
    
    // Simular algunos errores
    component.categoryForm.get('name')?.setErrors({ custom: true });
    
    // Llamar a resetForm
    component.resetForm();
    
    // Verificar que los valores se restablecieron
    expect(component.categoryForm.get('name')?.value).toBe('');
    expect(component.categoryForm.get('description')?.value).toBe('');
    
    // Verificar que los estados se restablecieron
    expect(component.categoryForm.get('name')?.touched).toBe(false);
    expect(component.categoryForm.get('name')?.errors).toBeNull();
    
    // Verificar que los contadores se restablecieron
    expect(component.nameCharsRemaining).toBe(50);
    expect(component.descriptionCharsRemaining).toBe(90);
  });

  it('should correctly identify controls with errors', () => {
    // Control sin errores y no tocado
    expect(component.hasError('name')).toBe(false);
    
    // Control con errores pero no tocado
    component.categoryForm.get('name')?.setErrors({ required: true });
    expect(component.hasError('name')).toBe(false);
    
    // Control con errores y tocado (debería retornar true)
    component.categoryForm.get('name')?.markAsTouched();
    expect(component.hasError('name')).toBe(true);
    
    // Control sin errores pero tocado
    component.categoryForm.get('name')?.setErrors(null);
    expect(component.hasError('name')).toBe(false);
  });

  it('should show appropriate error messages', () => {
    // Error de campo requerido
    component.categoryForm.get('name')?.setErrors({ required: true });
    expect(component.getErrorMessage('name')).toBe('El nombre es obligatorio');
    
    // Error de longitud máxima
    component.categoryForm.get('name')?.setErrors({ maxlength: true });
    expect(component.getErrorMessage('name')).toBe('El nombre no puede exceder los 50 caracteres');
    
    // Para el campo descripción
    component.categoryForm.get('description')?.setErrors({ required: true });
    expect(component.getErrorMessage('description')).toBe('La descripción es obligatoria');
    
    component.categoryForm.get('description')?.setErrors({ maxlength: true });
    expect(component.getErrorMessage('description')).toBe('La descripción no puede exceder los 90 caracteres');
  });
});
