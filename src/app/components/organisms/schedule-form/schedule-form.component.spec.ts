import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ScheduleFormComponent } from './schedule-form.component';
import { VisitService } from 'src/app/core/visit/visit.service';
import { ToastrService } from 'ngx-toastr';
import { RealStateService } from 'src/app/core/RealState/real-state.service';
import { Page } from 'src/app/shared/models/Page';
import { RealState } from 'src/app/shared/models/RealState';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ScheduleFormComponent', () => {
  let component: ScheduleFormComponent;
  let fixture: ComponentFixture<ScheduleFormComponent>;
  let mockVisitService: Partial<VisitService>;
  let mockToastrService: Partial<ToastrService>;
  let mockRealStateService: Partial<RealStateService>;

  // Mock data
  const mockRealStatesPage: Page<RealState> = {
    content: [
      { id: 1, name: 'Casa Centro', description: 'Casa en el centro', price: 150000000, rooms: 3, bathrooms: 2, locationId: 1, categoryId: 1, publishDate: '2024-01-01', status: 'available' },
      { id: 2, name: 'Apartamento Norte', description: 'Apartamento moderno', price: 80000000, rooms: 2, bathrooms: 1, locationId: 2, categoryId: 2, publishDate: '2024-01-02', status: 'available' }
    ],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  const mockScheduleResponse = {
    id: 1,
    realStateId: 1,
    userId: 2,
    initialDate: '2024-06-01T10:00:00',
    finalDate: '2024-06-01T11:00:00',
    status: 'scheduled'
  };

  beforeEach(async () => {
    // Crear mocks de los servicios
    mockVisitService = {
      createSchedule: jest.fn()
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn()
    };

    mockRealStateService = {
      getRealStates: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockVisitService.createSchedule as jest.Mock).mockReturnValue(of(mockScheduleResponse));
    (mockRealStateService.getRealStates as jest.Mock).mockReturnValue(of(mockRealStatesPage));

    await TestBed.configureTestingModule({
      declarations: [ScheduleFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: VisitService, useValue: mockVisitService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: RealStateService, useValue: mockRealStateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleFormComponent);
    component = fixture.componentInstance;

    // Mockear console
    jest.spyOn(console, 'error').mockImplementation(() => {});
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
    it('should initialize minScheduleDate as today', () => {
      const today = new Date();
      const expectedDate = today.toISOString().split('T')[0];
      
      expect(component.minScheduleDate).toBe(expectedDate);
      expect(component.minScheduleDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should initialize properties', () => {
      expect(component.isSubmitting).toBe(false);
      expect(component.realStates).toEqual([]);
    });
  });

  // TEST 3: Verificar ngOnInit
  describe('ngOnInit', () => {
    it('should call initForm and loadRealStates', () => {
      const initFormSpy = jest.spyOn(component, 'initForm');
      const loadRealStatesSpy = jest.spyOn(component, 'loadRealStates');

      component.ngOnInit();

      expect(initFormSpy).toHaveBeenCalled();
      expect(loadRealStatesSpy).toHaveBeenCalled();
    });
  });

  // TEST 4: Verificar inicialización del formulario
  describe('Form Initialization', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should initialize form with correct structure', () => {
      expect(component.scheduleForm).toBeDefined();
      expect(component.scheduleForm.get('realStateId')).toBeTruthy();
      expect(component.scheduleForm.get('initialDate')).toBeTruthy();
      expect(component.scheduleForm.get('initialTime')).toBeTruthy();
      expect(component.scheduleForm.get('finalDate')).toBeTruthy();
      expect(component.scheduleForm.get('finalTime')).toBeTruthy();
    });

    it('should have correct initial values', () => {
      expect(component.scheduleForm.get('realStateId')?.value).toBeNull();
      expect(component.scheduleForm.get('initialDate')?.value).toBe('');
      expect(component.scheduleForm.get('initialTime')?.value).toBe('');
      expect(component.scheduleForm.get('finalDate')?.value).toBe('');
      expect(component.scheduleForm.get('finalTime')?.value).toBe('');
    });

    it('should be invalid when empty', () => {
      expect(component.scheduleForm.valid).toBe(false);
    });
  });

  // TEST 5: Verificar carga de propiedades
  describe('loadRealStates', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load real states successfully', () => {
      expect(mockRealStateService.getRealStates as jest.Mock).toHaveBeenCalled();
      expect(component.realStates).toEqual(mockRealStatesPage.content);
      expect(component.realStates.length).toBe(2);
    });

    it('should handle error when loading real states', () => {
      (mockRealStateService.getRealStates as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      component.loadRealStates();

      expect(console.error).toHaveBeenCalledWith('Error al cargar propiedades:', expect.any(Error));
      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'No se pudieron cargar las propiedades',
        'Error'
      );
    });

    it('should handle empty response', () => {
      (mockRealStateService.getRealStates as jest.Mock).mockReturnValue(
        of({ content: null })
      );

      component.loadRealStates();

      expect(component.realStates).toEqual([]);
    });
  });

  // TEST 6: Verificar validador personalizado de rango de fechas
  describe('dateTimeRangeValidator', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return null when fields are empty', () => {
      const result = component.dateTimeRangeValidator(component.scheduleForm);
      expect(result).toBeNull();
    });

    it('should return null when only some fields have values', () => {
      component.scheduleForm.patchValue({
        initialDate: '2024-06-01',
        initialTime: '10:00'
        // finalDate y finalTime quedan vacíos
      });

      const result = component.dateTimeRangeValidator(component.scheduleForm);
      expect(result).toBeNull();
    });

    it('should return error when final datetime is before initial datetime', () => {
      component.scheduleForm.patchValue({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '09:00' // Hora anterior
      });

      const result = component.dateTimeRangeValidator(component.scheduleForm);
      expect(result).toEqual({ invalidDateRange: true });
    });

    it('should return error when final datetime equals initial datetime', () => {
      component.scheduleForm.patchValue({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '10:00' // Misma hora
      });

      const result = component.dateTimeRangeValidator(component.scheduleForm);
      expect(result).toEqual({ invalidDateRange: true });
    });

    it('should return null when final datetime is after initial datetime', () => {
      component.scheduleForm.patchValue({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00' // Hora posterior
      });

      const result = component.dateTimeRangeValidator(component.scheduleForm);
      expect(result).toBeNull();
    });

    it('should handle different dates correctly', () => {
      component.scheduleForm.patchValue({
        initialDate: '2024-06-01',
        initialTime: '23:00',
        finalDate: '2024-06-02',
        finalTime: '01:00' // Día siguiente
      });

      const result = component.dateTimeRangeValidator(component.scheduleForm);
      expect(result).toBeNull();
    });
  });

  // TEST 7: Verificar métodos helper
  describe('Helper Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('hasError', () => {
      it('should return false when control has no errors', () => {
        component.scheduleForm.get('realStateId')?.setValue(1);
        expect(component.hasError('realStateId')).toBe(false);
      });

      it('should return false when control has errors but is not touched', () => {
        expect(component.hasError('realStateId')).toBe(false);
      });

      it('should return true when control has errors and is touched', () => {
        component.scheduleForm.get('realStateId')?.markAsTouched();
        expect(component.hasError('realStateId')).toBe(true);
      });

      it('should return false for non-existent control', () => {
        expect(component.hasError('nonExistent')).toBe(false);
      });
    });

    describe('getErrorMessage', () => {
      it('should return empty string when control has no errors', () => {
        component.scheduleForm.get('realStateId')?.setValue(1);
        expect(component.getErrorMessage('realStateId')).toBe('');
      });

      it('should return required message', () => {
        const control = component.scheduleForm.get('realStateId');
        control?.markAsTouched();
        expect(component.getErrorMessage('realStateId')).toBe('Este campo es obligatorio');
      });

      it('should return generic message for unknown errors', () => {
        const control = component.scheduleForm.get('realStateId');
        control?.setErrors({ unknownError: true });
        control?.markAsTouched();
        
        expect(component.getErrorMessage('realStateId')).toBe('Campo inválido');
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

      expect(mockVisitService.createSchedule as jest.Mock).not.toHaveBeenCalled();
      expect(component.scheduleForm.get('realStateId')?.touched).toBe(true);
      expect(component.scheduleForm.get('initialDate')?.touched).toBe(true);
    });

    it('should submit valid form successfully', () => {
      const validFormData = {
        realStateId: 1,
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      };

      component.scheduleForm.setValue(validFormData);
      component.onSubmit();

      const expectedScheduleData = {
        realStateId: 1,
        userId: 2,
        initialDate: '2024-06-01T10:00:00',
        finalDate: '2024-06-01T11:00:00'
      };

      expect(mockVisitService.createSchedule as jest.Mock).toHaveBeenCalledWith(expectedScheduleData);
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalledWith(
        'Cita agendada exitosamente',
        'Éxito'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error with specific message', () => {
      const errorResponse = { error: { message: 'Horario no disponible' } };
      (mockVisitService.createSchedule as jest.Mock).mockReturnValue(
        throwError(() => errorResponse)
      );

      const validFormData = {
        realStateId: 1,
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      };

      component.scheduleForm.setValue(validFormData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'Horario no disponible',
        'Error'
      );
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error without specific message', () => {
      (mockVisitService.createSchedule as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const validFormData = {
        realStateId: 1,
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      };

      component.scheduleForm.setValue(validFormData);
      component.onSubmit();

      expect(mockToastrService.error as jest.Mock).toHaveBeenCalledWith(
        'Error al agendar la cita',
        'Error'
      );
    });

    it('should reset form after successful submission', () => {
      const resetSpy = jest.spyOn(component.scheduleForm, 'reset');
      
      const validFormData = {
        realStateId: 1,
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      };

      component.scheduleForm.setValue(validFormData);
      component.onSubmit();

      expect(resetSpy).toHaveBeenCalled();
    });
  });

  // TEST 9: Verificar integración completa
  describe('Integration Tests', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should perform complete schedule workflow', () => {
      // 1. Verificar que se cargaron las propiedades
      expect(component.realStates.length).toBeGreaterThan(0);

      // 2. Llenar formulario válido
      const scheduleData = {
        realStateId: 1,
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      };

      component.scheduleForm.setValue(scheduleData);
      expect(component.scheduleForm.valid).toBe(true);

      // 3. Enviar formulario
      component.onSubmit();
      expect(mockVisitService.createSchedule as jest.Mock).toHaveBeenCalled();
      expect(mockToastrService.success as jest.Mock).toHaveBeenCalled();
    });

    it('should handle validation errors properly', () => {
      // Formulario con rango de fechas inválido
      component.scheduleForm.setValue({
        realStateId: 1,
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '09:00' // Hora anterior
      });

      expect(component.scheduleForm.valid).toBe(false);
      expect(component.scheduleForm.hasError('invalidDateRange')).toBe(true);

      component.onSubmit();
      expect(mockVisitService.createSchedule as jest.Mock).not.toHaveBeenCalled();
    });
  });
});
