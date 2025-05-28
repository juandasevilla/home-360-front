import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LocationFormComponent } from './location-form.component';
import { LocationService } from 'src/app/core/location/location.service';
import { Component, Input } from '@angular/core';
import { Location } from 'src/app/shared/models/Location';

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

describe('LocationFormComponent', () => {
  let component: LocationFormComponent;
  let fixture: ComponentFixture<LocationFormComponent>;
  let mockLocationService: jest.Mocked<LocationService>;
  let mockToastrService: jest.Mocked<ToastrService>;

  beforeEach(() => {
    // Crear mocks para los servicios
    mockLocationService = {
      createLocation: jest.fn(),
      getCities: jest.fn().mockReturnValue(of({ content: [] })),
      getDepartments: jest.fn().mockReturnValue(of({ content: [] }))
    } as unknown as jest.Mocked<LocationService>;
    
    mockToastrService = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    TestBed.configureTestingModule({
      declarations: [
        LocationFormComponent,
        MockFormFieldComponent,
        MockInputComponent,
        MockTextareaComponent,
        MockButtonComponent
      ],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: LocationService, useValue: mockLocationService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.locationForm).toBeDefined();
    expect(component.locationForm.get('name')?.value).toBe('');
    expect(component.locationForm.get('description')?.value).toBe('');
    expect(component.locationForm.get('cityId')?.value).toBeNull();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.locationForm.valid).toBe(false);
  });

  it('should validate required fields', () => {
    // Comprobar que los campos requeridos están marcados como inválidos cuando están vacíos
    const nameControl = component.locationForm.get('name');
    const descriptionControl = component.locationForm.get('description');
    const cityIdControl = component.locationForm.get('cityId');
    
    expect(nameControl?.valid).toBe(false);
    expect(descriptionControl?.valid).toBe(false);
    expect(cityIdControl?.valid).toBe(false);
    expect(nameControl?.errors?.['required']).toBeTruthy();
    expect(descriptionControl?.errors?.['required']).toBeTruthy();
    expect(cityIdControl?.errors?.['required']).toBeTruthy();
    
    // Rellenar los campos y comprobar que ahora son válidos
    nameControl?.setValue('Test Location');
    descriptionControl?.setValue('Test Description');
    cityIdControl?.setValue(1);
    
    expect(nameControl?.valid).toBe(true);
    expect(descriptionControl?.valid).toBe(true);
    expect(cityIdControl?.valid).toBe(true);
  });

  describe('hasError method', () => {
    it('should return false when control has no errors', () => {
      // Establecer un valor válido
      component.locationForm.get('name')?.setValue('Test Location');
      expect(component.hasError('name')).toBe(false);
    });

    it('should return false when control has errors but is not touched', () => {
      // El control tiene errores (requerido) pero no está tocado
      expect(component.hasError('name')).toBe(false);
    });

    it('should return true when control has errors and is touched', () => {
      // Marcar como tocado
      component.locationForm.get('name')?.markAsTouched();
      expect(component.hasError('name')).toBe(true);
    });
  });

  describe('getErrorMessage method', () => {
    it('should return empty string when control has no errors', () => {
      component.locationForm.get('name')?.setValue('Test Location');
      expect(component.getErrorMessage('name')).toBe('');
    });

    it('should return required message for required error', () => {
      component.locationForm.get('name')?.markAsTouched();
      expect(component.getErrorMessage('name')).toBe('Este campo es obligatorio');
    });

    it('should return minlength message for minlength error', () => {
      const control = component.locationForm.get('name');
      control?.setValue('A'); // Muy corto
      control?.setErrors({ minlength: { requiredLength: 3 } });
      expect(component.getErrorMessage('name')).toBe('Debe tener al menos 3 caracteres');
    });

    it('should return maxlength message for maxlength error', () => {
      const control = component.locationForm.get('name');
      control?.setErrors({ maxlength: { requiredLength: 50 } });
      expect(component.getErrorMessage('name')).toBe('Debe tener máximo 50 caracteres');
    });

    it('should return generic message for other errors', () => {
      const control = component.locationForm.get('name');
      control?.setErrors({ custom: true });
      expect(component.getErrorMessage('name')).toBe('Campo inválido');
    });
  });

  it('should call createLocation when submitting the form', () => {
    // Configurar respuesta exitosa
    const mockLocation: Location = {
      id: 1,
      name: 'Test Location',
      description: 'Test Description',
      cityId: 101
    };
    
    mockLocationService.createLocation.mockReturnValue(of(mockLocation));
    
    // Rellenar el formulario con los campos correctos según el modelo
    component.locationForm.setValue({
      name: 'Test Location',
      description: 'Test Description',
      cityId: 101
    });
    
    // Enviar el formulario
    component.onSubmit();
    
    // Verificar que se llamó al método correcto con los datos correctos
    expect(mockLocationService.createLocation).toHaveBeenCalledWith({
      name: 'Test Location',
      description: 'Test Description',
      cityId: 101
    });
    
    // Verificar que se mostró un mensaje de éxito
    expect(mockToastrService.success).toHaveBeenCalled();
  });

  it('should handle error when form submission fails', () => {
    // Configurar respuesta de error
    mockLocationService.createLocation.mockReturnValue(
      throwError(() => new Error('Server error'))
    );
    
    // Rellenar el formulario con los campos correctos según el modelo
    component.locationForm.setValue({
      name: 'Test Location',
      description: 'Test Description',
      cityId: 101
    });
    
    // Enviar el formulario
    component.onSubmit();
    
    // Verificar que se mostró un mensaje de error
    expect(mockToastrService.error).toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  });
});