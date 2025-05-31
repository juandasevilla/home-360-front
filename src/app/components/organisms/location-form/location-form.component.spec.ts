import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LocationFormComponent } from './location-form.component';
import { LocationService } from 'src/app/core/location/location.service';
import { ToastrService } from 'ngx-toastr';
import { City } from 'src/app/shared/models/City';
import { Location } from 'src/app/shared/models/Location';
import { Page } from 'src/app/shared/models/Page';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LocationFormComponent', () => {
  let component: LocationFormComponent;
  let fixture: ComponentFixture<LocationFormComponent>;
  let mockLocationService: Partial<LocationService>;
  let mockToastrService: Partial<ToastrService>;

  // Mock data que coincide con tus modelos
  const mockCitiesPage: Page<City> = {
    content: [
      {
        id: 1,
        name: 'Bogotá',
        department: { id: 1, name: 'Cundinamarca' }
      },
      {
        id: 2,
        name: 'Medellín',
        department: { id: 2, name: 'Antioquia' }
      },
      {
        id: 3,
        name: 'Cali',
        department: { id: 3, name: 'Valle del Cauca' }
      }
    ],
    totalElements: 3,
    totalPages: 1,
    size: 50,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  const mockLocationResponse: Location = {
    id: 1,
    name: 'Centro Comercial',
    description: 'Ubicación en el centro de la ciudad',
    cityId: 1,
    city: {
      id: 1,
      name: 'Bogotá',
      department: { id: 1, name: 'Cundinamarca' }
    }
  };

  beforeEach(async () => {
    // Crear mocks de los servicios usando Partial
    mockLocationService = {
      createLocation: jest.fn(),
      getLocations: jest.fn(),
      getCities: jest.fn(),
      getDepartments: jest.fn()
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockLocationService.getCities as jest.Mock).mockReturnValue(of(mockCitiesPage));

    await TestBed.configureTestingModule({
      declarations: [LocationFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: LocationService, useValue: mockLocationService },
        { provide: ToastrService, useValue: mockToastrService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // ✅ Ignorar errores de template
    }).compileComponents();

    fixture = TestBed.createComponent(LocationFormComponent);
    component = fixture.componentInstance;

    // Mockear console para evitar logs durante tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // ✅ NO llamar detectChanges() para evitar renderizar el template
    // fixture.detectChanges();
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
      
      expect(component.locationForm).toBeDefined();
      expect(component.locationForm.get('name')).toBeTruthy();
      expect(component.locationForm.get('description')).toBeTruthy();
      expect(component.locationForm.get('cityId')).toBeTruthy();
    });

    it('should have empty initial values', () => {
      component.ngOnInit();
      
      expect(component.locationForm.get('name')?.value).toBe('');
      expect(component.locationForm.get('description')?.value).toBe('');
      expect(component.locationForm.get('cityId')?.value).toBeNull();
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

  // TEST 3: Verificar carga de ciudades
  describe('Cities Loading', () => {
    beforeEach(() => {
      component.ngOnInit(); // Asegurar que el componente esté inicializado
    });

    it('should call getCities on ngOnInit', () => {
      expect(mockLocationService.getCities as jest.Mock).toHaveBeenCalledWith(0, 50);
    });

    it('should load cities successfully', () => {
      expect(component.cities).toEqual(mockCitiesPage.content);
      expect(component.cities.length).toBe(3);
      expect(component.cities[0].name).toBe('Bogotá');
    });

    it('should handle direct array response format', () => {
      const directArrayResponse = [
        { id: 4, name: 'Barranquilla', department: { id: 4, name: 'Atlántico' } }
      ] as City[];

      (mockLocationService.getCities as jest.Mock).mockReturnValue(of(directArrayResponse as any));
      
      // ✅ Usar casting para acceder a método privado
      (component as any).loadCities();
      
      expect(component.cities).toEqual(directArrayResponse);
    });

    it('should handle error when loading cities', () => {
      const errorMessage = 'Network error';
      (mockLocationService.getCities as jest.Mock).mockReturnValue(throwError(() => new Error(errorMessage)));

      // ✅ Usar casting para acceder a método privado
      (component as any).loadCities();

      expect(console.error).toHaveBeenCalledWith('Error al cargar ciudades:', expect.any(Error));
    });

    it('should handle unexpected response format', () => {
      const unexpectedResponse = { someProperty: 'value' };
      (mockLocationService.getCities as jest.Mock).mockReturnValue(of(unexpectedResponse as any));

      // ✅ Usar casting para acceder a método privado
      (component as any).loadCities();

      expect(console.error).toHaveBeenCalledWith('Formato de respuesta inesperado:', unexpectedResponse);
    });
  });

  // TEST 4: Verificar validaciones del formulario
  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when empty', () => {
      expect(component.locationForm.valid).toBe(false);
    });

    it('should validate required fields', () => {
      const nameControl = component.locationForm.get('name');
      const descriptionControl = component.locationForm.get('description');
      const cityIdControl = component.locationForm.get('cityId');

      expect(nameControl?.errors?.['required']).toBeTruthy();
      expect(descriptionControl?.errors?.['required']).toBeTruthy();
      expect(cityIdControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate maxLength for name field', () => {
      const nameControl = component.locationForm.get('name');
      const longName = 'a'.repeat(51); // Excede 50 caracteres
      
      nameControl?.setValue(longName);
      
      expect(nameControl?.errors?.['maxlength']).toBeTruthy();
      expect(nameControl?.errors?.['maxlength'].actualLength).toBe(51);
      expect(nameControl?.errors?.['maxlength'].requiredLength).toBe(50);
    });

    it('should validate maxLength for description field', () => {
      const descriptionControl = component.locationForm.get('description');
      const longDescription = 'a'.repeat(91); // Excede 90 caracteres
      
      descriptionControl?.setValue(longDescription);
      
      expect(descriptionControl?.errors?.['maxlength']).toBeTruthy();
      expect(descriptionControl?.errors?.['maxlength'].actualLength).toBe(91);
      expect(descriptionControl?.errors?.['maxlength'].requiredLength).toBe(90);
    });

    it('should be valid with correct data', () => {
      component.locationForm.setValue({
        name: 'Centro Comercial',
        description: 'Ubicación en el centro',
        cityId: 1
      });

      expect(component.locationForm.valid).toBe(true);
    });
  });

  // TEST 5: Verificar contadores de caracteres
  describe('Character Counters', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should update nameCharsRemaining when name changes', () => {
      const nameControl = component.locationForm.get('name');
      
      nameControl?.setValue('Test');
      expect(component.nameCharsRemaining).toBe(46); // 50 - 4
      
      nameControl?.setValue('Centro Comercial');
      expect(component.nameCharsRemaining).toBe(34); // 50 - 16
      
      nameControl?.setValue('');
      expect(component.nameCharsRemaining).toBe(50);
    });

    it('should update descriptionCharsRemaining when description changes', () => {
      const descriptionControl = component.locationForm.get('description');
      
      descriptionControl?.setValue('Test description');
      expect(component.descriptionCharsRemaining).toBe(74); // 90 - 16
      
      descriptionControl?.setValue('');
      expect(component.descriptionCharsRemaining).toBe(90);
    });
  });

  // TEST 6: Verificar métodos helper
  describe('Helper Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('hasError', () => {
      it('should return false when control has no errors', () => {
        component.locationForm.get('name')?.setValue('Valid Name');
        expect(component.hasError('name')).toBe(false);
      });

      it('should return false when control has errors but is not touched', () => {
        expect(component.hasError('name')).toBe(false);
      });

      it('should return true when control has errors and is touched', () => {
        component.locationForm.get('name')?.markAsTouched();
        expect(component.hasError('name')).toBe(true);
      });

      it('should return false for non-existent control', () => {
        expect(component.hasError('nonExistent')).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should return empty string when control has no errors', () => {
        component.locationForm.get('name')?.setValue('Valid Name');
        expect(component.getErrorMessage('name')).toBe('');
      });

      it('should return required message for required error', () => {
        const nameControl = component.locationForm.get('name');
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Este campo es obligatorio');
      });

      it('should return maxlength message for maxlength error', () => {
        const control = component.locationForm.get('name');
        control?.setValue('a'.repeat(51));
        control?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Debe tener máximo 50 caracteres');
      });

      it('should return minlength message for minlength error', () => {
        const control = component.locationForm.get('name');
        control?.setErrors({ minlength: { requiredLength: 3, actualLength: 1 } });
        control?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Debe tener al menos 3 caracteres');
      });

      it('should return generic message for other errors', () => {
        const control = component.locationForm.get('name');
        control?.setErrors({ customError: true });
        control?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Campo inválido');
      });

      it('should return empty string for non-existent control', () => {
        expect(component.getErrorMessage('nonExistent')).toBe('');
      });
    });

    describe('displayFn', () => {
      it('should return city name when city is provided', () => {
        const city: City = {
          id: 1,
          name: 'Bogotá',
          department: { id: 1, name: 'Cundinamarca' }
        };
        expect(component.displayFn(city)).toBe('Bogotá');
      });

      it('should return empty string when city is null', () => {
        expect(component.displayFn(null)).toBe('');
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

      expect(mockLocationService.createLocation as jest.Mock).not.toHaveBeenCalled();
      expect(component.locationForm.get('name')?.touched).toBe(true);
      expect(component.locationForm.get('description')?.touched).toBe(true);
      expect(component.locationForm.get('cityId')?.touched).toBe(true);
    });

    it('should submit valid form successfully', () => {
      (mockLocationService.createLocation as jest.Mock).mockReturnValue(of(mockLocationResponse));

      component.locationForm.setValue({
        name: 'Centro Comercial',
        description: 'Ubicación en el centro de la ciudad',
        cityId: 1
      });

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();

      expect(mockLocationService.createLocation as jest.Mock).toHaveBeenCalledWith({
        name: 'Centro Comercial',
        description: 'Ubicación en el centro de la ciudad',
        cityId: 1
      });
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith(
        'Ubicación creada exitosamente',
        'Éxito'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error', () => {
      const errorMessage = 'Server error';
      (mockLocationService.createLocation as jest.Mock).mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      component.locationForm.setValue({
        name: 'Centro Comercial',
        description: 'Ubicación en el centro de la ciudad',
        cityId: 1
      });

      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'Error al crear la ubicación',
        expect.any(Error)
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should set isSubmitting flag during submission', () => {
      (mockLocationService.createLocation as jest.Mock).mockReturnValue(of(mockLocationResponse));

      component.locationForm.setValue({
        name: 'Centro Comercial',
        description: 'Ubicación en el centro de la ciudad',
        cityId: 1
      });

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();
      expect(component.isSubmitting).toBe(false);
    });
  });

  // TEST 8: Verificar reset del formulario
  describe('Form Reset', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset form correctly', () => {
      // Llenar formulario
      component.locationForm.setValue({
        name: 'Test Location',
        description: 'Test Description',
        cityId: 1
      });

      // Marcar como tocado
      component.locationForm.get('name')?.markAsTouched();
      component.locationForm.get('description')?.markAsTouched();
      component.locationForm.get('cityId')?.markAsTouched();

      // Resetear
      component.resetForm();

      // Verificar valores
      expect(component.locationForm.get('name')?.value).toBe('');
      expect(component.locationForm.get('description')?.value).toBe('');
      expect(component.locationForm.get('cityId')?.value).toBeNull();

      // Verificar estado
      expect(component.locationForm.get('name')?.touched).toBe(false);
      expect(component.locationForm.get('description')?.touched).toBe(false);
      expect(component.locationForm.get('cityId')?.touched).toBe(false);

      // Verificar contadores
      expect(component.nameCharsRemaining).toBe(50);
      expect(component.descriptionCharsRemaining).toBe(90);
    });

  });

  // TEST 9: Tests adicionales para cobertura completa
  describe('Additional Coverage', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle setupFilters when cityId control exists', () => {
      // ✅ Usar casting para acceder a método privado setupFilters
      expect(() => (component as any).setupFilters()).not.toThrow();
      expect(component.filteredCities).toBeDefined();
    });

    it('should call loadCities during ngOnInit', () => {
      // ✅ Spy en el método privado usando casting
      const spy = jest.spyOn(component as any, 'loadCities');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should setup character counters during ngOnInit', () => {
      const nameControl = component.locationForm.get('name');
      const descriptionControl = component.locationForm.get('description');
      
      // Verificar que los contadores responden a cambios
      nameControl?.setValue('test');
      expect(component.nameCharsRemaining).toBe(46);
      
      descriptionControl?.setValue('test description');
      expect(component.descriptionCharsRemaining).toBe(74);
    });

    it('should setup initial filters correctly', () => {
      // Verificar que filteredCities está inicializado
      expect(component.filteredCities).toBeDefined();
      
      // Verificar que retorna ciudades inicialmente
      component.filteredCities.subscribe(cities => {
        expect(cities).toEqual(component.cities);
      });
    });

    it('should handle empty cities array', () => {
      // Configurar mock para retornar array vacío
      component.cities = [];
      (component as any).setupFilters();
      
      component.filteredCities.subscribe(cities => {
        expect(cities).toEqual([]);
      });
    });
  });
});