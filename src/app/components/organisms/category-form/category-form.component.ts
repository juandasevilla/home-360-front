import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { Category } from 'src/app/shared/models/Category';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isSubmitting: boolean = false;
  nameMaxLength: number = 50;
  descriptionMaxLength: number = 90;
  nameCharsRemaining: number = this.nameMaxLength;
  descriptionCharsRemaining: number = this.descriptionMaxLength;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryServiceService,
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.setupCharCounters();
  }

  private setupCharCounters(): void {
    // Controlar contador de caracteres de nombre
    this.categoryForm.get('name')?.valueChanges.subscribe(value => {
      this.nameCharsRemaining = this.nameMaxLength - (value?.length || 0);
    });

    // Controlar contador de caracteres de descripción
    this.categoryForm.get('description')?.valueChanges.subscribe(value => {
      this.descriptionCharsRemaining = this.descriptionMaxLength - (value?.length || 0);
    });
  }
  
  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(90)]]
    });
  }
  
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.categoryForm.controls).forEach(key => {
        const control = this.categoryForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    // Obtener los valores del formulario
    const categoryData: Category = {
      name: this.categoryForm.value.name,
      description: this.categoryForm.value.description
    };
    
    // Llamar al servicio para crear la categoría
    this.categoryService.createCategory(categoryData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.resetForm();
        this.toastr.success('Categoría creada exitosamente', 'Éxito');
      },
      error: (error) => {
        this.toastr.error('Error al crear la categoría', error);
        this.isSubmitting = false;
        // TODO: Mostrar mensaje de error
      }
    });
  }
  
  /**
   * Limpia el formulario completamente, incluyendo estados de error
   */
  resetForm(): void {
    this.categoryForm.reset();
    // Eliminar el estado de error/tocado de todos los controles
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
    });

    this.nameCharsRemaining = this.nameMaxLength;
    this.descriptionCharsRemaining = this.descriptionMaxLength;
    
    this.categoryForm.patchValue({
      name: '',
      description: ''
    });
  }

  //helper
  hasError(controlName: string): boolean {
    const control = this.categoryForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
  
  getErrorMessage(controlName: string): string {
    const control = this.categoryForm.get(controlName);
    
    if (!control || !control.errors) {
      return '';
    }
    
    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
    return `Debe tener máximo ${control.errors['maxlength'].requiredLength} caracteres`; // Corregido
    }
    
    return 'Campo inválido';
  }
}