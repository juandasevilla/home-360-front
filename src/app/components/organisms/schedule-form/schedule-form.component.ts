import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors  } from '@angular/forms';
import { VisitService } from 'src/app/core/visit/visit.service';
import { ToastrService } from 'ngx-toastr';
import { RealStateService } from 'src/app/core/RealState/real-state.service';

@Component({
  selector: 'app-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.scss']
})
export class ScheduleFormComponent {
  scheduleForm!: FormGroup;
  isSubmitting = false;
  minScheduleDate: string;
  maxScheduleDate: string;
  realStates: any[] = []; // Cambiar el tipo según tu modelo RealState
  
  
  constructor(
    private fb: FormBuilder,
    private visitService: VisitService,
    private toastr: ToastrService,
    private realStateService: RealStateService,
  ) {
    const today = new Date();
    today.setDate(today.getDate() + 1); 
    this.minScheduleDate = today.toISOString().split('T')[0];

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 21);
    this.maxScheduleDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForm();
    this.loadRealStates();
  }

  loadRealStates(): void {
    // Asume un método en tu servicio para obtener propiedades
    this.realStateService.getRealStates().subscribe({
      next: (response) => {
        this.realStates = response.content || [];
      },
      error: (error) => {
        console.error('Error al cargar propiedades:', error);
        this.toastr.error('No se pudieron cargar las propiedades', 'Error');
      }
    });
  }
  
  initForm(): void {
    this.scheduleForm = this.fb.group({
      realStateId: [null, Validators.required],
      initialDate: ['', Validators.required,this.minDateValidator.bind(this), this.maxDateValidator.bind(this)],
      initialTime: ['', Validators.required],
      finalDate: ['', Validators.required, this.minDateValidator.bind(this), this.maxDateValidator.bind(this)],
      finalTime: ['', Validators.required]
    }, { validators: this.dateTimeRangeValidator });
  }

  private minDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Si está vacío, lo maneja 'required'
    }

    const inputDate = new Date(control.value);
    const today = new Date();
    today.setDate(today.getDate() + 1); // Mínimo un día después de hoy
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    if (inputDate < today) {
      return { minDate: true };
    }

    return null;
  }

  // ✅ NUEVO: Validador para fecha máxima (3 semanas)
  private maxDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Si está vacío, lo maneja 'required'
    }

    const inputDate = new Date(control.value);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 21); // 3 semanas
    maxDate.setHours(23, 59, 59, 999); // Final del día

    if (inputDate > maxDate) {
      return { maxDate: true };
    }

    return null;
  }

  dateTimeRangeValidator(formGroup: FormGroup) {
    const initialDate = formGroup.get('initialDate')?.value;
    const initialTime = formGroup.get('initialTime')?.value;
    const finalDate = formGroup.get('finalDate')?.value;
    const finalTime = formGroup.get('finalTime')?.value;
    
    // Solo validar si todos los campos tienen valor
    if (!initialDate || !initialTime || !finalDate || !finalTime) {
      return null;
    }
    
    // Crear objetos Date para comparación
    const initialDateTime = new Date(`${initialDate}T${initialTime}:00`);
    const finalDateTime = new Date(`${finalDate}T${finalTime}:00`);
    
    if (finalDateTime <= initialDateTime) {
      return { invalidDateRange: true };
    }
    
    return null;
  }

  hasError(controlName: string): boolean {
    const control = this.scheduleForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
  
  getErrorMessage(controlName: string): string {
    const control = this.scheduleForm.get(controlName);
    
    if (!control || !control.errors) {
      return '';
    }
    
    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (control.errors['minDate']) {
      return 'La fecha no puede ser anterior a hoy';
    }

    if (control.errors['maxDate']) {
      return 'La fecha no puede ser mayor a 3 semanas desde hoy';
    }
    
    if (controlName === 'finalDate' || controlName === 'finalTime') {
      if (this.scheduleForm.hasError('invalidDateRange')) {
        return 'La fecha/hora final debe ser posterior a la inicial';
      }
    }
    
    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      Object.keys(this.scheduleForm.controls).forEach(key => {
        this.scheduleForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    // Combinar fecha y hora para crear los timestamps ISO
    const formValues = this.scheduleForm.value;
    const scheduleData = {
      realStateId: formValues.realStateId,
      initialDate: `${formValues.initialDate}T${formValues.initialTime}:00`,
      finalDate: `${formValues.finalDate}T${formValues.finalTime}:00`
    };
    
    this.visitService.createSchedule(scheduleData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.toastr.success('Cita agendada exitosamente', 'Éxito');
        this.scheduleForm.reset();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error(
          error.error?.message || 'Error al agendar la cita', 
          'Error'
        );
      }
    });
  }
}
