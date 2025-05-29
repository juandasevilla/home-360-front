import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CategoryFormComponent } from './category-form.component';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { ToastrService } from 'ngx-toastr';
import { Category } from 'src/app/shared/models/Category';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let mockCategoryService: Partial<CategoryServiceService>;
  let mockToastrService: Partial<ToastrService>;

  // Mock data
  const mockCategoryResponse: Category = {
    id: 1,
    name: 'Tecnología',
    description: 'Productos tecnológicos y electrónicos'
  };

  beforeEach(async () => {
    // Crear mocks de los servicios
    mockCategoryService = {
      createCategory: jest.fn(),
      getCategories: jest.fn()
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockCategoryService.createCategory as jest.Mock).mockReturnValue(of(mockCategoryResponse));

    await TestBed.configureTestingModule({
      declarations: [CategoryFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: CategoryServiceService, useValue: mockCategoryService },
        { provide: ToastrService, useValue: mockToastrService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // ✅ Ignorar errores de template
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFormComponent);
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

  // TEST 2: Verificar inicialización del formulario
  describe('Form Initialization', () => {
    it('should initialize form with correct structure', () => {
      component.ngOnInit(); // Llamar manualmente ngOnInit
      
      expect(component.categoryForm).toBeDefined();
      expect(component.categoryForm.get('name')).toBeTruthy();
      expect(component.categoryForm.get('description')).toBeTruthy();
    });

    it('should have empty initial values', () => {
      component.ngOnInit();
      
      expect(component.categoryForm.get('name')?.value).toBe('');
      expect(component.categoryForm.get('description')?.value).toBe('');
    });

    it('should initialize character counters correctly', () => {
      expect(component.nameCharsRemaining).toBe(50);
      expect(component.descriptionCharsRemaining).toBe(90);
      expect(component.nameMaxLength).toBe(50);
      expect(component.descriptionMaxLength).toBe(90);
    });

    it('should initialize isSubmitting as false', () => {
      expect(component.isSubmitting).toBe(false);
    });
  });

  // TEST 3: Verificar validaciones del formulario
  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when empty', () => {
      expect(component.categoryForm.valid).toBe(false);
    });

    it('should validate required fields', () => {
      const nameControl = component.categoryForm.get('name');
      const descriptionControl = component.categoryForm.get('description');

      expect(nameControl?.errors?.['required']).toBeTruthy();
      expect(descriptionControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate maxLength for name field', () => {
      const nameControl = component.categoryForm.get('name');
      const longName = 'a'.repeat(51); // Excede 50 caracteres
      
      nameControl?.setValue(longName);
      
      expect(nameControl?.errors?.['maxlength']).toBeTruthy();
      expect(nameControl?.errors?.['maxlength'].actualLength).toBe(51);
      expect(nameControl?.errors?.['maxlength'].requiredLength).toBe(50);
    });

    it('should validate maxLength for description field', () => {
      const descriptionControl = component.categoryForm.get('description');
      const longDescription = 'a'.repeat(91); // Excede 90 caracteres
      
      descriptionControl?.setValue(longDescription);
      
      expect(descriptionControl?.errors?.['maxlength']).toBeTruthy();
      expect(descriptionControl?.errors?.['maxlength'].actualLength).toBe(91);
      expect(descriptionControl?.errors?.['maxlength'].requiredLength).toBe(90);
    });

    it('should be valid with correct data', () => {
      component.categoryForm.setValue({
        name: 'Tecnología',
        description: 'Productos tecnológicos'
      });

      expect(component.categoryForm.valid).toBe(true);
    });
  });

  // TEST 4: Verificar contadores de caracteres
  describe('Character Counters', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should update nameCharsRemaining when name changes', () => {
      const nameControl = component.categoryForm.get('name');
      
      nameControl?.setValue('Tech');
      expect(component.nameCharsRemaining).toBe(46); // 50 - 4
      
      nameControl?.setValue('Tecnología');
      expect(component.nameCharsRemaining).toBe(40); // 50 - 10
      
      nameControl?.setValue('');
      expect(component.nameCharsRemaining).toBe(50);
    });

    it('should update descriptionCharsRemaining when description changes', () => {
      const descriptionControl = component.categoryForm.get('description');
      
      // ✅ Usar una cadena más fácil de contar
      descriptionControl?.setValue('Test description'); // 16 caracteres
      expect(component.descriptionCharsRemaining).toBe(74); // 90 - 16
      
      // O ser más explícito:
      descriptionControl?.setValue('12345'); // 5 caracteres
      expect(component.descriptionCharsRemaining).toBe(85); // 90 - 5
      
      descriptionControl?.setValue('');
      expect(component.descriptionCharsRemaining).toBe(90);
    });

    it('should handle null or undefined values in character counters', () => {
      const nameControl = component.categoryForm.get('name');
      const descriptionControl = component.categoryForm.get('description');
      
      nameControl?.setValue(null);
      expect(component.nameCharsRemaining).toBe(50);
      
      descriptionControl?.setValue(undefined);
      expect(component.descriptionCharsRemaining).toBe(90);
    });
  });

  // TEST 5: Verificar métodos helper
  describe('Helper Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('hasError', () => {
      it('should return false when control has no errors', () => {
        component.categoryForm.get('name')?.setValue('Valid Name');
        expect(component.hasError('name')).toBe(false);
      });

      it('should return false when control has errors but is not touched', () => {
        expect(component.hasError('name')).toBe(false);
      });

      it('should return true when control has errors and is touched', () => {
        component.categoryForm.get('name')?.markAsTouched();
        expect(component.hasError('name')).toBe(true);
      });

      it('should return false for non-existent control', () => {
        expect(component.hasError('nonExistent')).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should return empty string when control has no errors', () => {
        component.categoryForm.get('name')?.setValue('Valid Name');
        expect(component.getErrorMessage('name')).toBe('');
      });

      it('should return required message for required error', () => {
        const nameControl = component.categoryForm.get('name');
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Este campo es obligatorio');
      });

      it('should return maxlength message for maxlength error', () => {
        const control = component.categoryForm.get('name');
        control?.setValue('a'.repeat(51));
        control?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Debe tener máximo 50 caracteres');
      });

      it('should return minlength message for minlength error', () => {
        const control = component.categoryForm.get('name');
        control?.setErrors({ minlength: { requiredLength: 3, actualLength: 1 } });
        control?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Debe tener al menos 3 caracteres');
      });

      it('should return generic message for other errors', () => {
        const control = component.categoryForm.get('name');
        control?.setErrors({ customError: true });
        control?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Campo inválido');
      });

      it('should return empty string for non-existent control', () => {
        expect(component.getErrorMessage('nonExistent')).toBe('');
      });
    });
  });

  // TEST 6: Verificar envío del formulario
  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit invalid form', () => {
      component.onSubmit();

      expect(mockCategoryService.createCategory as jest.Mock).not.toHaveBeenCalled();
      expect(component.categoryForm.get('name')?.touched).toBe(true);
      expect(component.categoryForm.get('description')?.touched).toBe(true);
    });

    it('should submit valid form successfully', () => {
      (mockCategoryService.createCategory as jest.Mock).mockReturnValue(of(mockCategoryResponse));

      component.categoryForm.setValue({
        name: 'Tecnología',
        description: 'Productos tecnológicos y electrónicos'
      });

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();

      expect(mockCategoryService.createCategory as jest.Mock).toHaveBeenCalledWith({
        name: 'Tecnología',
        description: 'Productos tecnológicos y electrónicos'
      });
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith(
        'Categoría creada exitosamente',
        'Éxito'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error', () => {
      const errorMessage = 'Server error';
      (mockCategoryService.createCategory as jest.Mock).mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.categoryForm.setValue({
        name: 'Tecnología',
        description: 'Productos tecnológicos'
      });

      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'Error al crear la categoría',
        expect.any(Error)
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should set isSubmitting flag during submission', () => {
      (mockCategoryService.createCategory as jest.Mock).mockReturnValue(of(mockCategoryResponse));

      component.categoryForm.setValue({
        name: 'Tecnología',
        description: 'Productos tecnológicos'
      });

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();
      expect(component.isSubmitting).toBe(false); // Ya se completó la operación
    });

    it('should call resetForm after successful submission', () => {
      const resetSpy = jest.spyOn(component, 'resetForm');
      (mockCategoryService.createCategory as jest.Mock).mockReturnValue(of(mockCategoryResponse));

      component.categoryForm.setValue({
        name: 'Tecnología',
        description: 'Productos tecnológicos'
      });

      component.onSubmit();

      expect(resetSpy).toHaveBeenCalled();
    });
  });

  // TEST 7: Verificar reset del formulario
  describe('Form Reset', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset form correctly', () => {
      // Llenar formulario
      component.categoryForm.setValue({
        name: 'Test Category',
        description: 'Test Description'
      });

      // Marcar como tocado
      component.categoryForm.get('name')?.markAsTouched();
      component.categoryForm.get('description')?.markAsTouched();

      // Resetear
      component.resetForm();

      // Verificar valores
      expect(component.categoryForm.get('name')?.value).toBe('');
      expect(component.categoryForm.get('description')?.value).toBe('');

      // Verificar estado
      expect(component.categoryForm.get('name')?.touched).toBe(false);
      expect(component.categoryForm.get('description')?.touched).toBe(false);

      // Verificar contadores
      expect(component.nameCharsRemaining).toBe(50);
      expect(component.descriptionCharsRemaining).toBe(90);
    });

    it('should reset form and handle validation state correctly', () => {
      // Crear un escenario de validación natural
      component.categoryForm.setValue({
        name: 'a'.repeat(51), // Excede maxLength 
        description: 'b'.repeat(91) // Excede maxLength
      });

      // Marcar como tocado para que se muestren errores
      component.categoryForm.get('name')?.markAsTouched();
      component.categoryForm.get('description')?.markAsTouched();

      // Verificar que hay errores antes del reset
      expect(component.categoryForm.get('name')?.errors?.['maxlength']).toBeTruthy();
      expect(component.categoryForm.get('description')?.errors?.['maxlength']).toBeTruthy();

      // Resetear formulario
      component.resetForm();

      // Verificar que ya no está "touched" (esto es lo importante)
      expect(component.categoryForm.get('name')?.touched).toBe(false);
      expect(component.categoryForm.get('description')?.touched).toBe(false);

      // Verificar que los valores están vacíos
      expect(component.categoryForm.get('name')?.value).toBe('');
      expect(component.categoryForm.get('description')?.value).toBe('');

      // El formulario tendrá errores required porque está vacío,
      // pero no se mostrarán porque no están "touched"
      expect(component.hasError('name')).toBe(false);
      expect(component.hasError('description')).toBe(false);
    });
    
  });

  // TEST 8: Tests adicionales para cobertura completa
  describe('Additional Coverage', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should call initForm during ngOnInit', () => {
      const spy = jest.spyOn(component as any, 'initForm');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should call setupCharCounters during ngOnInit', () => {
      const spy = jest.spyOn(component as any, 'setupCharCounters');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should setup character counters correctly', () => {
      // ✅ Usar casting para acceder a método privado
      expect(() => (component as any).setupCharCounters()).not.toThrow();
      
      // Verificar que los contadores responden a cambios
      const nameControl = component.categoryForm.get('name');
      const descriptionControl = component.categoryForm.get('description');
      
      nameControl?.setValue('test');
      expect(component.nameCharsRemaining).toBe(46);
      
      descriptionControl?.setValue('test description');
      expect(component.descriptionCharsRemaining).toBe(74);
    });

    it('should handle form submission with exact category data structure', () => {
      component.categoryForm.setValue({
        name: 'Electronics',
        description: 'Electronic devices and accessories'
      });

      component.onSubmit();

      const expectedCategoryData: Category = {
        name: 'Electronics',
        description: 'Electronic devices and accessories'
      };

      expect(mockCategoryService.createCategory as jest.Mock).toHaveBeenCalledWith(expectedCategoryData);
    });

    it('should mark all fields as touched when form is invalid on submission', () => {
      // Dejar formulario vacío (inválido)
      component.categoryForm.setValue({
        name: '',
        description: ''
      });

      // Verificar que no están tocados inicialmente
      expect(component.categoryForm.get('name')?.touched).toBe(false);
      expect(component.categoryForm.get('description')?.touched).toBe(false);

      // Intentar enviar
      component.onSubmit();

      // Verificar que ahora están marcados como tocados
      expect(component.categoryForm.get('name')?.touched).toBe(true);
      expect(component.categoryForm.get('description')?.touched).toBe(true);
    });
  });
});
