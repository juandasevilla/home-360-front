import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RealStateFormComponent } from './real-state-form.component';
import { RealStateService } from 'src/app/core/RealState/real-state.service';
import { LocationService } from 'src/app/core/location/location.service';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { ToastrService } from 'ngx-toastr';
import { RealState } from 'src/app/shared/models/RealState';
import { Location } from 'src/app/shared/models/Location';
import { Category } from 'src/app/shared/models/Category';
import { Page } from 'src/app/shared/models/Page';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RealStateFormComponent', () => {
  let component: RealStateFormComponent;
  let fixture: ComponentFixture<RealStateFormComponent>;
  let mockRealStateService: Partial<RealStateService>;
  let mockLocationService: Partial<LocationService>;
  let mockCategoryService: Partial<CategoryServiceService>;
  let mockToastrService: Partial<ToastrService>;

  // Mock data
  const mockLocationsPage: Page<Location> = {
    content: [
      { id: 1, name: 'Centro Comercial', description: 'Ubicación en el centro', cityId: 1 },
      { id: 2, name: 'Zona Norte', description: 'Ubicación al norte', cityId: 2 },
      { id: 3, name: 'Sector Sur', description: 'Ubicación al sur', cityId: 3 }
    ],
    totalElements: 3,
    totalPages: 1,
    size: 50,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  const mockCategoriesPage: Page<Category> = {
    content: [
      { id: 1, name: 'Casa', description: 'Casas familiares' },
      { id: 2, name: 'Apartamento', description: 'Apartamentos urbanos' },
      { id: 3, name: 'Local Comercial', description: 'Locales para negocios' }
    ],
    totalElements: 3,
    totalPages: 1,
    size: 50,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  const mockRealStateResponse: RealState = {
    id: 1,
    name: 'Casa de Campo',
    description: 'Hermosa casa en el campo',
    price: 250000000,
    rooms: 4,
    bathrooms: 3,
    locationId: 1,
    categoryId: 1,
    publishDate: '2024-01-15',
    status: 'available'
  };

  beforeEach(async () => {
    // Crear mocks de los servicios
    mockRealStateService = {
      createRealState: jest.fn()
    };

    mockLocationService = {
      getLocations: jest.fn()
    };

    mockCategoryService = {
      getCategories: jest.fn()
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockRealStateService.createRealState as jest.Mock).mockReturnValue(of(mockRealStateResponse));
    (mockLocationService.getLocations as jest.Mock).mockReturnValue(of(mockLocationsPage));
    (mockCategoryService.getCategories as jest.Mock).mockReturnValue(of(mockCategoriesPage));

    await TestBed.configureTestingModule({
      declarations: [RealStateFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: RealStateService, useValue: mockRealStateService },
        { provide: LocationService, useValue: mockLocationService },
        { provide: CategoryServiceService, useValue: mockCategoryService },
        { provide: ToastrService, useValue: mockToastrService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // ✅ Ignorar errores de template
    }).compileComponents();

    fixture = TestBed.createComponent(RealStateFormComponent);
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
    it('should initialize date properties correctly', () => {
      const today = new Date();
      const expectedMinDate = today.toISOString().split('T')[0];
      
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 30);
      const expectedMaxDate = maxDate.toISOString().split('T')[0];

      expect(component.minPublishDate).toBe(expectedMinDate);
      expect(component.maxPublishDate).toBe(expectedMaxDate);
      expect(component.minPublishDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(component.maxPublishDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should initialize maxLength properties', () => {
      expect(component.nameMaxLength).toBe(50);
      expect(component.descriptionMaxLength).toBe(90);
      expect(component.nameCharsRemaining).toBe(50);
      expect(component.descriptionCharsRemaining).toBe(90);
    });

    it('should initialize arrays and flags', () => {
      expect(component.locations).toEqual([]);
      expect(component.categories).toEqual([]);
      expect(component.isSubmitting).toBe(false);
    });
  });

  // TEST 3: Verificar ngOnInit
  describe('ngOnInit', () => {
    it('should call all initialization methods', () => {
      const initFormSpy = jest.spyOn(component as any, 'initForm');
      const setupCharCountersSpy = jest.spyOn(component as any, 'setupCharCounters');
      const loadLocationsSpy = jest.spyOn(component as any, 'loadLocations');
      const loadCategoriesSpy = jest.spyOn(component as any, 'loadCategories');

      component.ngOnInit();

      expect(initFormSpy).toHaveBeenCalled();
      expect(setupCharCountersSpy).toHaveBeenCalled();
      expect(loadLocationsSpy).toHaveBeenCalled();
      expect(loadCategoriesSpy).toHaveBeenCalled();
    });
  });

  // TEST 4: Verificar inicialización del formulario
  describe('Form Initialization', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should initialize form with correct structure', () => {
      expect(component.realStateForm).toBeDefined();
      expect(component.realStateForm.get('name')).toBeTruthy();
      expect(component.realStateForm.get('description')).toBeTruthy();
      expect(component.realStateForm.get('price')).toBeTruthy();
      expect(component.realStateForm.get('rooms')).toBeTruthy();
      expect(component.realStateForm.get('bathrooms')).toBeTruthy();
      expect(component.realStateForm.get('locationId')).toBeTruthy();
      expect(component.realStateForm.get('categoryId')).toBeTruthy();
      expect(component.realStateForm.get('publishDate')).toBeTruthy();
    });

    it('should have correct initial values', () => {
      expect(component.realStateForm.get('name')?.value).toBe('');
      expect(component.realStateForm.get('description')?.value).toBe('');
      expect(component.realStateForm.get('price')?.value).toBe('');
      expect(component.realStateForm.get('rooms')?.value).toBe('');
      expect(component.realStateForm.get('bathrooms')?.value).toBe('');
      expect(component.realStateForm.get('locationId')?.value).toBeNull();
      expect(component.realStateForm.get('categoryId')?.value).toBeNull();
      expect(component.realStateForm.get('publishDate')?.value).toBe(component.minPublishDate);
    });
  });

  // TEST 5: Verificar carga de ubicaciones
  describe('loadLocations', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load locations successfully', () => {
      expect(mockLocationService.getLocations as jest.Mock).toHaveBeenCalledWith(0, 50);
      expect(component.locations).toEqual(mockLocationsPage.content);
      expect(component.locations.length).toBe(3);
      expect(component.locations[0].name).toBe('Centro Comercial');
    });

    it('should handle unexpected response format', () => {
      const unexpectedResponse = { someProperty: 'value' };
      (mockLocationService.getLocations as jest.Mock).mockReturnValue(of(unexpectedResponse as any));

      (component as any).loadLocations();

      expect(console.error).toHaveBeenCalledWith('Formato de respuesta inesperado:', unexpectedResponse);
    });

    it('should handle error when loading locations', () => {
      const errorMessage = 'Network error';
      (mockLocationService.getLocations as jest.Mock).mockReturnValue(throwError(() => new Error(errorMessage)));

      (component as any).loadLocations();

      expect(console.error).toHaveBeenCalledWith('Error al cargar ubicaciones:', expect.any(Error));
    });
  });

  // TEST 6: Verificar carga de categorías
  describe('loadCategories', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load categories successfully', () => {
      expect(mockCategoryService.getCategories as jest.Mock).toHaveBeenCalledWith(0, 50);
      expect(component.categories).toEqual(mockCategoriesPage.content);
      expect(component.categories.length).toBe(3);
      expect(component.categories[0].name).toBe('Casa');
    });

    it('should handle unexpected response format', () => {
      const unexpectedResponse = { someProperty: 'value' };
      (mockCategoryService.getCategories as jest.Mock).mockReturnValue(of(unexpectedResponse as any));

      (component as any).loadCategories();

      expect(console.error).toHaveBeenCalledWith('Formato de respuesta inesperado:', unexpectedResponse);
    });

    it('should handle error when loading categories', () => {
      const errorMessage = 'Network error';
      (mockCategoryService.getCategories as jest.Mock).mockReturnValue(throwError(() => new Error(errorMessage)));

      (component as any).loadCategories();

      expect(console.error).toHaveBeenCalledWith('Error al cargar categorías:', expect.any(Error));
    });
  });

  // TEST 7: Verificar contadores de caracteres
  describe('Character Counters', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should update nameCharsRemaining when name changes', () => {
      const nameControl = component.realStateForm.get('name');
      
      nameControl?.setValue('Casa');
      expect(component.nameCharsRemaining).toBe(46); // 50 - 4
      
      nameControl?.setValue('Casa de Campo');
      expect(component.nameCharsRemaining).toBe(37); // 50 - 14
      
      nameControl?.setValue('');
      expect(component.nameCharsRemaining).toBe(50);
    });

    it('should update descriptionCharsRemaining when description changes', () => {
      const descriptionControl = component.realStateForm.get('description');
      
      descriptionControl?.setValue('Hermosa casa');
      expect(component.descriptionCharsRemaining).toBe(78); // 90 - 13
      
      descriptionControl?.setValue('');
      expect(component.descriptionCharsRemaining).toBe(90);
    });

    it('should handle null and undefined values in character counters', () => {
      const nameControl = component.realStateForm.get('name');
      const descriptionControl = component.realStateForm.get('description');
      
      nameControl?.setValue(null);
      expect(component.nameCharsRemaining).toBe(50);
      
      descriptionControl?.setValue(undefined);
      expect(component.descriptionCharsRemaining).toBe(90);
    });
  });

  // TEST 8: Verificar validaciones del formulario
  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when empty', () => {
      expect(component.realStateForm.valid).toBe(false);
    });

    it('should validate required fields', () => {
      const requiredFields = ['name', 'description', 'price', 'rooms', 'bathrooms', 'locationId', 'categoryId', 'publishDate'];
      
      requiredFields.forEach(field => {
        const control = component.realStateForm.get(field);
        if (field !== 'publishDate') { // publishDate tiene valor inicial
          expect(control?.errors?.['required']).toBeTruthy();
        }
      });
    });

    it('should validate maxLength for name and description', () => {
      const nameControl = component.realStateForm.get('name');
      const descriptionControl = component.realStateForm.get('description');
      
      nameControl?.setValue('a'.repeat(51));
      expect(nameControl?.errors?.['maxlength']).toBeTruthy();
      
      descriptionControl?.setValue('b'.repeat(91));
      expect(descriptionControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should validate min values for numeric fields', () => {
      const priceControl = component.realStateForm.get('price');
      const roomsControl = component.realStateForm.get('rooms');
      const bathroomsControl = component.realStateForm.get('bathrooms');
      
      priceControl?.setValue(-100);
      expect(priceControl?.errors?.['min']).toBeTruthy();
      
      roomsControl?.setValue(-1);
      expect(roomsControl?.errors?.['min']).toBeTruthy();
      
      bathroomsControl?.setValue(-1);
      expect(bathroomsControl?.errors?.['min']).toBeTruthy();
    });

    it('should be valid with correct data', () => {
      component.realStateForm.setValue({
        name: 'Casa de Campo',
        description: 'Hermosa casa en el campo',
        price: 250000000,
        rooms: 4,
        bathrooms: 3,
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      });

      expect(component.realStateForm.valid).toBe(true);
    });
  });

  // TEST 9: Verificar validación personalizada de fecha
  describe('Date Range Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate dates within valid range', () => {
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 15); // 15 días desde hoy
      const validDateString = validDate.toISOString().split('T')[0];
      
      const publishDateControl = component.realStateForm.get('publishDate');
      publishDateControl?.setValue(validDateString);
      
      expect(publishDateControl?.errors?.['minDate']).toBeFalsy();
      expect(publishDateControl?.errors?.['maxDate']).toBeFalsy();
    });

    it('should invalidate dates before minimum date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      const publishDateControl = component.realStateForm.get('publishDate');
      publishDateControl?.setValue(yesterdayString);
      
      expect(publishDateControl?.errors?.['minDate']).toBeTruthy();
    });

    it('should invalidate dates after maximum date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 31); // Más de 30 días
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const publishDateControl = component.realStateForm.get('publishDate');
      publishDateControl?.setValue(futureDateString);
      
      expect(publishDateControl?.errors?.['maxDate']).toBeTruthy();
    });

    it('should return null for empty date value', () => {
      const result = component.dateRangeValidator('2024-01-01', '2024-12-31')({ value: null } as any);
      expect(result).toBeNull();
    });

    it('should handle edge case of exact minimum date', () => {
      const publishDateControl = component.realStateForm.get('publishDate');
      publishDateControl?.setValue(component.minPublishDate);
      
      expect(publishDateControl?.errors?.['minDate']).toBeFalsy();
    });

    it('should handle edge case of exact maximum date', () => {
      const publishDateControl = component.realStateForm.get('publishDate');
      publishDateControl?.setValue(component.maxPublishDate);
      
      expect(publishDateControl?.errors?.['maxDate']).toBeFalsy();
    });
  });

  // TEST 10: Verificar métodos helper
  describe('Helper Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('hasError', () => {
      it('should return false when control has no errors', () => {
        component.realStateForm.get('name')?.setValue('Valid Name');
        expect(component.hasError('name')).toBe(false);
      });

      it('should return false when control has errors but is not touched', () => {
        expect(component.hasError('name')).toBe(false);
      });

      it('should return true when control has errors and is touched', () => {
        component.realStateForm.get('name')?.markAsTouched();
        expect(component.hasError('name')).toBe(true);
      });

      it('should return false for non-existent control', () => {
        expect(component.hasError('nonExistent')).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should return empty string when control has no errors', () => {
        component.realStateForm.get('name')?.setValue('Valid Name');
        expect(component.getErrorMessage('name')).toBe('');
      });

      it('should return required message', () => {
        const nameControl = component.realStateForm.get('name');
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Este campo es obligatorio');
      });

      it('should return maxlength message', () => {
        const nameControl = component.realStateForm.get('name');
        nameControl?.setValue('a'.repeat(51));
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Debe tener máximo 50 caracteres');
      });

      it('should return minlength message', () => {
        const nameControl = component.realStateForm.get('name');
        nameControl?.setErrors({ minlength: { requiredLength: 3, actualLength: 1 } });
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Debe tener al menos 3 caracteres');
      });

      it('should return date-specific error messages', () => {
        const publishDateControl = component.realStateForm.get('publishDate');
        publishDateControl?.markAsTouched();
        
        // Min date error
        publishDateControl?.setErrors({ minDate: { required: '2024-01-01', actual: '2023-12-31' } });
        expect(component.getErrorMessage('publishDate')).toBe('La fecha no puede ser anterior a hoy');
        
        // Max date error
        publishDateControl?.setErrors({ maxDate: { required: '2024-12-31', actual: '2025-01-01' } });
        expect(component.getErrorMessage('publishDate')).toBe('La fecha no puede exceder 30 días a partir de hoy');
      });

      it('should return generic message for unknown errors', () => {
        const nameControl = component.realStateForm.get('name');
        nameControl?.setErrors({ unknownError: true });
        nameControl?.markAsTouched();
        expect(component.getErrorMessage('name')).toBe('Campo inválido');
      });
    });
  });

  // TEST 11: Verificar envío del formulario
  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit invalid form', () => {
      component.onSubmit();

      expect(mockRealStateService.createRealState as jest.Mock).not.toHaveBeenCalled();
      expect(component.realStateForm.get('name')?.touched).toBe(true);
      expect(component.realStateForm.get('description')?.touched).toBe(true);
    });

    it('should submit valid form successfully', () => {
      const validFormData = {
        name: 'Casa de Campo',
        description: 'Hermosa casa en el campo',
        price: '250000000',
        rooms: '4',
        bathrooms: '3',
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      };

      component.realStateForm.setValue(validFormData);

      expect(component.isSubmitting).toBe(false);
      component.onSubmit();

      const expectedRealStateData: RealState = {
        name: 'Casa de Campo',
        description: 'Hermosa casa en el campo',
        price: 250000000, // Convertido a número
        rooms: 4, // Convertido a número
        bathrooms: 3, // Convertido a número
        locationId: 1, // Convertido a número
        categoryId: 1, // Convertido a número
        publishDate: component.minPublishDate
      };

      expect(mockRealStateService.createRealState as jest.Mock).toHaveBeenCalledWith(expectedRealStateData);
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith(
        'Propiedad creada exitosamente',
        'Éxito'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error with specific message', () => {
      const errorResponse = { error: { message: 'La propiedad ya existe' } };
      (mockRealStateService.createRealState as jest.Mock).mockReturnValue(
        throwError(() => errorResponse)
      );

      const validFormData = {
        name: 'Casa de Campo',
        description: 'Hermosa casa en el campo',
        price: '250000000',
        rooms: '4',
        bathrooms: '3',
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      };

      component.realStateForm.setValue(validFormData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'La propiedad ya existe',
        'Error'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error without specific message', () => {
      (mockRealStateService.createRealState as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const validFormData = {
        name: 'Casa de Campo',
        description: 'Hermosa casa en el campo',
        price: '250000000',
        rooms: '4',
        bathrooms: '3',
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      };

      component.realStateForm.setValue(validFormData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'Ocurrió un error al crear la propiedad',
        'Error'
      );
    });

    it('should reset form after successful submission', () => {
      const resetSpy = jest.spyOn(component, 'resetForm');
      
      const validFormData = {
        name: 'Casa de Campo',
        description: 'Hermosa casa en el campo',
        price: '250000000',
        rooms: '4',
        bathrooms: '3',
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      };

      component.realStateForm.setValue(validFormData);
      component.onSubmit();

      expect(resetSpy).toHaveBeenCalled();
    });
  });

  // TEST 12: Verificar resetForm
  describe('resetForm', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset form correctly', () => {
      // Llenar formulario
      component.realStateForm.setValue({
        name: 'Test Property',
        description: 'Test Description',
        price: '100000000',
        rooms: '3',
        bathrooms: '2',
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      });

      // Marcar como tocado
      component.realStateForm.get('name')?.markAsTouched();
      component.realStateForm.get('description')?.markAsTouched();

      // Resetear
      component.resetForm();

      // Verificar valores específicos que se establecen explícitamente
      expect(component.realStateForm.get('name')?.value).toBe('');
      expect(component.realStateForm.get('description')?.value).toBe('');

      // Verificar estado
      expect(component.realStateForm.get('name')?.touched).toBe(false);
      expect(component.realStateForm.get('description')?.touched).toBe(false);

      // Verificar contadores
      expect(component.nameCharsRemaining).toBe(50);
      expect(component.descriptionCharsRemaining).toBe(90);
    });

  });

  // TEST 13: Tests adicionales para cobertura completa
  describe('Additional Coverage', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle complete workflow: load data -> fill form -> submit', () => {
      // 1. Verificar que se cargaron los datos
      expect(component.locations.length).toBeGreaterThan(0);
      expect(component.categories.length).toBeGreaterThan(0);

      // 2. Llenar formulario completo
      const completeFormData = {
        name: 'Villa de Lujo',
        description: 'Villa de lujo con piscina y jardín',
        price: '500000000',
        rooms: '5',
        bathrooms: '4',
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      };

      component.realStateForm.setValue(completeFormData);
      expect(component.realStateForm.valid).toBe(true);

      // 3. Enviar formulario
      component.onSubmit();
      expect(mockRealStateService.createRealState as jest.Mock).toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid on submission', () => {
      // Dejar formulario vacío (inválido)
      const allFields = ['name', 'description', 'price', 'rooms', 'bathrooms', 'locationId', 'categoryId'];
      
      // Verificar que no están tocados inicialmente
      allFields.forEach(field => {
        expect(component.realStateForm.get(field)?.touched).toBe(false);
      });

      // Intentar enviar
      component.onSubmit();

      // Verificar que ahora están marcados como tocados
      allFields.forEach(field => {
        expect(component.realStateForm.get(field)?.touched).toBe(true);
      });
    });

    it('should handle number conversion in form submission', () => {
      const formData = {
        name: 'Test Property',
        description: 'Test Description',
        price: '1000000', // String
        rooms: '3', // String
        bathrooms: '2', // String
        locationId: 1,
        categoryId: 1,
        publishDate: component.minPublishDate
      };

      component.realStateForm.setValue(formData);
      component.onSubmit();

      // Verificar que los números se convirtieron correctamente
      const expectedData = expect.objectContaining({
        price: 1000000, // Number
        rooms: 3, // Number
        bathrooms: 2, // Number
        locationId: 1, // Number
        categoryId: 1 // Number
      });

      expect(mockRealStateService.createRealState as jest.Mock).toHaveBeenCalledWith(expectedData);
    });
  });
});