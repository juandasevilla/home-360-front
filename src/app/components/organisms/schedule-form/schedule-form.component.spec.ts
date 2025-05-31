import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { of, throwError, Observable } from 'rxjs';
import { ScheduleFormComponent } from './schedule-form.component';
import { VisitService } from 'src/app/core/visit/visit.service';
import { ToastrService } from 'ngx-toastr';
import { RealStateService } from 'src/app/core/RealState/real-state.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ScheduleFormComponent', () => {
  let component: ScheduleFormComponent;
  let fixture: ComponentFixture<ScheduleFormComponent>;
  let mockVisitService: Partial<VisitService>;
  let mockToastrService: Partial<ToastrService>;
  let mockRealStateService: Partial<RealStateService>;

  const mockRealStatesResponse = {
    content: [
      { id: 1, name: 'Casa Centro' },
      { id: 2, name: 'Apartamento Norte' }
    ]
  };

  const mockScheduleResponse = {
    id: 1,
    realStateId: 1,
    initialDate: '2024-06-01T10:00:00',
    finalDate: '2024-06-01T11:00:00'
  };

  beforeEach(async () => {
    mockVisitService = {
      createSchedule: jest.fn().mockReturnValue(of(mockScheduleResponse))
    };

    mockToastrService = {
      success: jest.fn(),
      error: jest.fn()
    };

    mockRealStateService = {
      getRealStates: jest.fn().mockReturnValue(of(mockRealStatesResponse))
    };

    await TestBed.configureTestingModule({
      declarations: [ScheduleFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: VisitService, useValue: mockVisitService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: RealStateService, useValue: mockRealStateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleFormComponent);
    component = fixture.componentInstance;

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize minScheduleDate as today', () => {
      const today = new Date();
      const expectedDate = today.toISOString().split('T')[0];
      expect(component.minScheduleDate).toBe(expectedDate);
    });

    it('should initialize maxScheduleDate as 21 days from today', () => {
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 21);
      const expectedDate = maxDate.toISOString().split('T')[0];
      expect(component.maxScheduleDate).toBe(expectedDate);
    });

    it('should initialize default properties', () => {
      expect(component.isSubmitting).toBe(false);
      expect(component.realStates).toEqual([]);
    });
  });

  describe('ngOnInit', () => {
    it('should call initForm and loadRealStates', () => {
      const initFormSpy = jest.spyOn(component, 'initForm');
      const loadRealStatesSpy = jest.spyOn(component, 'loadRealStates');

      component.ngOnInit();

      expect(initFormSpy).toHaveBeenCalled();
      expect(loadRealStatesSpy).toHaveBeenCalled();
    });
  });

  describe('initForm', () => {
    it('should initialize form with all required controls', () => {
      component.initForm();

      expect(component.scheduleForm).toBeDefined();
      expect(component.scheduleForm.get('realStateId')).toBeTruthy();
      expect(component.scheduleForm.get('initialDate')).toBeTruthy();
      expect(component.scheduleForm.get('initialTime')).toBeTruthy();
      expect(component.scheduleForm.get('finalDate')).toBeTruthy();
      expect(component.scheduleForm.get('finalTime')).toBeTruthy();
    });

    it('should set initial values correctly', () => {
      component.initForm();

      expect(component.scheduleForm.get('realStateId')?.value).toBeNull();
      expect(component.scheduleForm.get('initialDate')?.value).toBe('');
      expect(component.scheduleForm.get('initialTime')?.value).toBe('');
      expect(component.scheduleForm.get('finalDate')?.value).toBe('');
      expect(component.scheduleForm.get('finalTime')?.value).toBe('');
    });

    it('should add required validators to all controls', () => {
      component.initForm();

      expect(component.scheduleForm.get('realStateId')?.hasError('required')).toBe(true);
      expect(component.scheduleForm.get('initialDate')?.hasError('required')).toBe(true);
      expect(component.scheduleForm.get('initialTime')?.hasError('required')).toBe(true);
      expect(component.scheduleForm.get('finalDate')?.hasError('required')).toBe(true);
      expect(component.scheduleForm.get('finalTime')?.hasError('required')).toBe(true);
    });
  });

  describe('minDateValidator', () => {
    it('should return null for null value', () => {
      const control = new FormControl(null);
      const result = component['minDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const control = new FormControl('');
      const result = component['minDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      const result = component['minDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return error for past date', () => {
      const control = new FormControl('2020-01-01');
      const result = component['minDateValidator'](control);
      expect(result).toEqual({ minDate: true });
    });

    

    it('should return null for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const control = new FormControl(futureDate.toISOString().split('T')[0]);
      const result = component['minDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should handle yesterday date correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const control = new FormControl(yesterday.toISOString().split('T')[0]);
      const result = component['minDateValidator'](control);
      expect(result).toEqual({ minDate: true });
    });
  });

  describe('maxDateValidator', () => {
    it('should return null for null value', () => {
      const control = new FormControl(null);
      const result = component['maxDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const control = new FormControl('');
      const result = component['maxDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      const result = component['maxDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return null for date within 21 days', () => {
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 10);
      const control = new FormControl(validDate.toISOString().split('T')[0]);
      const result = component['maxDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return null for exactly 21 days from today', () => {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 21);
      const control = new FormControl(maxDate.toISOString().split('T')[0]);
      const result = component['maxDateValidator'](control);
      expect(result).toBeNull();
    });

    it('should return error for date beyond 21 days', () => {
      const tooFarDate = new Date();
      tooFarDate.setDate(tooFarDate.getDate() + 25);
      const control = new FormControl(tooFarDate.toISOString().split('T')[0]);
      const result = component['maxDateValidator'](control);
      expect(result).toEqual({ maxDate: true });
    });

    it('should return error for date far in the future', () => {
      const control = new FormControl('2030-12-31');
      const result = component['maxDateValidator'](control);
      expect(result).toEqual({ maxDate: true });
    });

    it('should return error for date next year', () => {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const control = new FormControl(nextYear.toISOString().split('T')[0]);
      const result = component['maxDateValidator'](control);
      expect(result).toEqual({ maxDate: true });
    });
  });

  describe('dateTimeRangeValidator', () => {
    it('should return null when all fields are empty', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '',
        initialTime: '',
        finalDate: '',
        finalTime: ''
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });

    it('should return null when initialDate is missing', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });

    it('should return null when initialTime is missing', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });

    it('should return null when finalDate is missing', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '',
        finalTime: '11:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });

    it('should return null when finalTime is missing', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: ''
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });

    it('should return error when final datetime equals initial datetime', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '10:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toEqual({ invalidDateRange: true });
    });

    it('should return error when final datetime is before initial datetime', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '09:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toEqual({ invalidDateRange: true });
    });

    it('should return error when final date is before initial date', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-02',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '10:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toEqual({ invalidDateRange: true });
    });

    it('should return null when final datetime is after initial datetime (same day)', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '10:00',
        finalDate: '2024-06-01',
        finalTime: '11:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });

    it('should return null when final date is after initial date (different days)', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '15:00',
        finalDate: '2024-06-02',
        finalTime: '10:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });

    it('should return null for multi-day appointments', () => {
      const fb = new FormBuilder();
      const testForm = fb.group({
        initialDate: '2024-06-01',
        initialTime: '23:00',
        finalDate: '2024-06-03',
        finalTime: '01:00'
      });

      const result = component.dateTimeRangeValidator(testForm);
      expect(result).toBeNull();
    });
  });

  describe('loadRealStates', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should load real states successfully with content', () => {
      expect(component.realStates).toEqual(mockRealStatesResponse.content);
      expect(mockRealStateService.getRealStates).toHaveBeenCalled();
    });

    it('should handle successful response with empty content', () => {
      const emptyResponse = { content: [] };
      (mockRealStateService.getRealStates as jest.Mock).mockReturnValue(of(emptyResponse));

      component.loadRealStates();

      expect(component.realStates).toEqual([]);
    });

    it('should handle successful response without content property', () => {
      const responseWithoutContent = { data: [] };
      (mockRealStateService.getRealStates as jest.Mock).mockReturnValue(of(responseWithoutContent));

      component.loadRealStates();

      expect(component.realStates).toEqual([]);
    });

    

    

    it('should handle error and show toast message', () => {
      const error = new Error('Network error');
      (mockRealStateService.getRealStates as jest.Mock).mockReturnValue(throwError(() => error));

      component.loadRealStates();

      expect(console.error).toHaveBeenCalledWith('Error al cargar propiedades:', error);
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'No se pudieron cargar las propiedades',
        'Error'
      );
    });

    it('should handle error with custom message', () => {
      const customError = { message: 'Custom error message' };
      (mockRealStateService.getRealStates as jest.Mock).mockReturnValue(throwError(() => customError));

      component.loadRealStates();

      expect(console.error).toHaveBeenCalledWith('Error al cargar propiedades:', customError);
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'No se pudieron cargar las propiedades',
        'Error'
      );
    });
  });

  describe('hasError', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return false for non-existent control', () => {
      expect(component.hasError('nonExistentControl')).toBe(false);
    });

    it('should return false when control is valid and not touched', () => {
      const control = component.scheduleForm.get('realStateId');
      control?.setValue(1);
      expect(component.hasError('realStateId')).toBe(false);
    });

    it('should return false when control is valid but touched', () => {
      const control = component.scheduleForm.get('realStateId');
      control?.setValue(1);
      control?.markAsTouched();
      expect(component.hasError('realStateId')).toBe(false);
    });

    it('should return false when control is invalid but not touched', () => {
      expect(component.hasError('realStateId')).toBe(false);
    });

    it('should return true when control is invalid and touched', () => {
      const control = component.scheduleForm.get('realStateId');
      control?.markAsTouched();
      expect(component.hasError('realStateId')).toBe(true);
    });

    it('should handle control that exists but is null', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue(null);
      expect(component.hasError('testControl')).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return empty string for non-existent control', () => {
      expect(component.getErrorMessage('nonExistentControl')).toBe('');
    });

    it('should return empty string when control is null', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue(null);
      expect(component.getErrorMessage('testControl')).toBe('');
    });

    it('should return empty string when control has no errors', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: null
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('');
    });

    it('should return required message', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { required: true }
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('Este campo es obligatorio');
    });

    it('should return minDate error message', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { minDate: true }
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('La fecha no puede ser anterior a hoy');
    });

    it('should return maxDate error message', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { maxDate: true }
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('La fecha no puede ser mayor a 3 semanas desde hoy');
    });

    it('should return invalidDateRange message for finalDate', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: {}
      } as any);
      jest.spyOn(component.scheduleForm, 'hasError').mockReturnValue(true);
      
      expect(component.getErrorMessage('finalDate')).toBe('La fecha/hora final debe ser posterior a la inicial');
    });

    it('should return invalidDateRange message for finalTime', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: {}
      } as any);
      jest.spyOn(component.scheduleForm, 'hasError').mockReturnValue(true);
      
      expect(component.getErrorMessage('finalTime')).toBe('La fecha/hora final debe ser posterior a la inicial');
    });

    it('should not return invalidDateRange message for initialDate', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { someOtherError: true }
      } as any);
      jest.spyOn(component.scheduleForm, 'hasError').mockReturnValue(true);
      
      expect(component.getErrorMessage('initialDate')).toBe('Campo inválido');
    });

    it('should return generic message for unknown errors', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { unknownError: true }
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('Campo inválido');
    });

    it('should prioritize required error over other errors', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { required: true, minDate: true, maxDate: true }
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('Este campo es obligatorio');
    });

    it('should prioritize minDate over maxDate and other errors', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { minDate: true, maxDate: true, otherError: true }
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('La fecha no puede ser anterior a hoy');
    });

    it('should prioritize maxDate over other errors (except required and minDate)', () => {
      jest.spyOn(component.scheduleForm, 'get').mockReturnValue({
        errors: { maxDate: true, otherError: true }
      } as any);
      expect(component.getErrorMessage('testControl')).toBe('La fecha no puede ser mayor a 3 semanas desde hoy');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit when form is invalid', () => {
      component.onSubmit();

      expect(mockVisitService.createSchedule).not.toHaveBeenCalled();
      expect(component.isSubmitting).toBe(false);
    });

    it('should mark all controls as touched when form is invalid', () => {
      const markAsTouchedSpy = jest.fn();
      jest.spyOn(component.scheduleForm, 'get').mockImplementation((controlName) => ({
        markAsTouched: markAsTouchedSpy
      } as any));

      component.onSubmit();

      expect(markAsTouchedSpy).toHaveBeenCalledTimes(5); // 5 controls
    });

    it('should call createSchedule when form is valid', () => {
      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: 1,
          initialDate: '2024-06-01',
          initialTime: '10:00',
          finalDate: '2024-06-01',
          finalTime: '11:00'
        })
      });

      component.onSubmit();

      expect(mockVisitService.createSchedule).toHaveBeenCalledWith({
        realStateId: 1,
        initialDate: '2024-06-01T10:00:00',
        finalDate: '2024-06-01T11:00:00'
      });
    });

    it('should set isSubmitting to true during submission', () => {
      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: 1,
          initialDate: '2024-06-01',
          initialTime: '10:00',
          finalDate: '2024-06-01',
          finalTime: '11:00'
        })
      });

      // Mock observable que no se resuelve inmediatamente
      const neverResolvingObservable = new Observable(subscriber => {
        // No emite valor, simula petición en progreso
      });
      (mockVisitService.createSchedule as jest.Mock).mockReturnValue(neverResolvingObservable);

      component.onSubmit();

      expect(component.isSubmitting).toBe(true);
    });

    it('should handle successful submission', () => {
      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: 1,
          initialDate: '2024-06-01',
          initialTime: '10:00',
          finalDate: '2024-06-01',
          finalTime: '11:00'
        })
      });

      const resetSpy = jest.spyOn(component.scheduleForm, 'reset');

      component.onSubmit();

      expect(mockToastrService.success).toHaveBeenCalledWith('Cita agendada exitosamente', 'Éxito');
      expect(component.isSubmitting).toBe(false);
      expect(resetSpy).toHaveBeenCalled();
    });

    it('should handle submission error with custom message', () => {
      const errorResponse = { error: { message: 'Horario no disponible' } };
      (mockVisitService.createSchedule as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: 1,
          initialDate: '2024-06-01',
          initialTime: '10:00',
          finalDate: '2024-06-01',
          finalTime: '11:00'
        })
      });

      component.onSubmit();

      expect(mockToastrService.error).toHaveBeenCalledWith('Horario no disponible', 'Error');
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error without custom message', () => {
      const errorResponse = {};
      (mockVisitService.createSchedule as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: 1,
          initialDate: '2024-06-01',
          initialTime: '10:00',
          finalDate: '2024-06-01',
          finalTime: '11:00'
        })
      });

      component.onSubmit();

      expect(mockToastrService.error).toHaveBeenCalledWith('Error al agendar la cita', 'Error');
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle submission error with null error object', () => {
      const errorResponse = { error: null };
      (mockVisitService.createSchedule as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: 1,
          initialDate: '2024-06-01',
          initialTime: '10:00',
          finalDate: '2024-06-01',
          finalTime: '11:00'
        })
      });

      component.onSubmit();

      expect(mockToastrService.error).toHaveBeenCalledWith('Error al agendar la cita', 'Error');
      expect(component.isSubmitting).toBe(false);
    });

    it('should create correct ISO date format for different times', () => {
      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: 2,
          initialDate: '2024-12-25',
          initialTime: '14:30',
          finalDate: '2024-12-25',
          finalTime: '16:45'
        })
      });

      component.onSubmit();

      expect(mockVisitService.createSchedule).toHaveBeenCalledWith({
        realStateId: 2,
        initialDate: '2024-12-25T14:30:00',
        finalDate: '2024-12-25T16:45:00'
      });
    });

    it('should handle different realStateId types', () => {
      Object.defineProperty(component.scheduleForm, 'invalid', { get: () => false });
      Object.defineProperty(component.scheduleForm, 'value', { 
        get: () => ({
          realStateId: '123',
          initialDate: '2024-06-01',
          initialTime: '10:00',
          finalDate: '2024-06-01',
          finalTime: '11:00'
        })
      });

      component.onSubmit();

      expect(mockVisitService.createSchedule).toHaveBeenCalledWith({
        realStateId: '123',
        initialDate: '2024-06-01T10:00:00',
        finalDate: '2024-06-01T11:00:00'
      });
    });
  });
});