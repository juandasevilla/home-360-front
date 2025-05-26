import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  realStates: any[] = []; // Cambiar el tipo según tu modelo RealState
  
  
  constructor(
    private fb: FormBuilder,
    private visitService: VisitService,
    private toastr: ToastrService,
    private realStateService: RealStateService,
  ) {
    // Establecer fecha mínima como hoy
    const today = new Date();
    this.minScheduleDate = today.toISOString().split('T')[0];
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
      initialDate: ['', Validators.required],
      initialTime: ['', Validators.required],
      finalDate: ['', Validators.required],
      finalTime: ['', Validators.required]
    }, { validators: this.dateTimeRangeValidator });
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
      userId: 2, // quemado mientras, cuando autenticacion desde el back lo tomo
      initialDate: `${formValues.initialDate}T${formValues.initialTime}:00`,
      finalDate: `${formValues.finalDate}T${formValues.finalTime}:00`
    };
    
    console.log('Datos a enviar:', scheduleData);
    
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
