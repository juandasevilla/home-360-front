import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitService } from 'src/app/core/visit/visit.service';
import { Schedule } from 'src/app/shared/models/Schedule';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-visit-form',
  templateUrl: './visit-form.component.html',
  styleUrls: ['./visit-form.component.scss']
})
export class VisitFormComponent {
  @Input() selectedVisit: Schedule | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  visitForm!: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private visitService: VisitService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.visitForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  onSubmit(): void {
    if (this.visitForm.invalid) {
      Object.keys(this.visitForm.controls).forEach(key => {
        const control = this.visitForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    if (!this.selectedVisit) {
      this.toastr.error('No hay visita seleccionada', 'Error');
      return;
    }
    this.isSubmitting = true;

    const payload = {
      schedule: this.selectedVisit,
      email: this.visitForm.value.email,
    };

    this.visitService.confirmVisit(payload).subscribe({
      next: (response) => {
        console.log('✅ Visita confirmada exitosamente:', response);
        this.isSubmitting = false;
        this.toastr.success(
          `Visita confirmada para el ${new Date(this.selectedVisit!.initialDate).toLocaleDateString('es-ES')}`,
          'Visita Confirmada'
        );
        this.resetForm();
        this.formSubmitted.emit(); // Notificar al padre
      },
      error: (error) => {
        console.error('❌ Error confirmando visita:', error);
        this.isSubmitting = false;
        
        if (error.status === 409) {
          this.toastr.error('Esta visita ya no está disponible', 'Error');
        } else if (error.status === 400) {
          this.toastr.error('Datos inválidos', 'Error');
        } else {
          this.toastr.error('Error al confirmar la visita', 'Error');
        }
      }
    });
  }

  private resetForm(): void {
    this.visitForm.reset();
    Object.keys(this.visitForm.controls).forEach(key => {
      const control = this.visitForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
    });
  }

  hasError(controlName: string): boolean {
    const control = this.visitForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  getErrorMessage(controlName: string): string {
    const control = this.visitForm.get(controlName);
    
    if (!control || !control.errors) {
      return '';
    }
    
    if (control.errors['required']) {
      return 'El correo electrónico es obligatorio';
    }
    
    if (control.errors['email']) {
      return 'Ingresa un correo electrónico válido';
    }

    return 'Correo electrónico inválido';
  }

}
