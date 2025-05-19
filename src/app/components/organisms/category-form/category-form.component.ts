import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { Category } from 'src/app/shared/models/Category';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isSubmitting: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryServiceService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }
  
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    const formData: Category = this.categoryForm.value;
    
    this.categoryService.createCategory(formData).subscribe({
      next: (newCategory) => {
        console.log('Categoría creada con éxito:', newCategory);
        this.isSubmitting = false;
        this.categoryForm.reset(); // Limpiar el formulario
        // Podrías mostrar un mensaje de éxito aquí
      },
      error: (error) => {
        console.error('Error al crear la categoría:', error);
        this.isSubmitting = false;
        // Podrías mostrar un mensaje de error aquí
      }
    });
  }
  
  // Helper para las validaciones
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
    
    return 'Campo inválido';
  }
}