import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RealState } from 'src/app/shared/models/RealState';
import { ToastrService } from 'ngx-toastr';
import { Location } from 'src/app/shared/models/Location';
import { Category } from 'src/app/shared/models/Category';
import { LocationService } from 'src/app/core/location/location.service';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { RealStateService } from 'src/app/core/RealState/real-state.service';

@Component({
  selector: 'app-real-state-form',
  templateUrl: './real-state-form.component.html',
  styleUrls: ['./real-state-form.component.scss']
})
export class RealStateFormComponent {
  realStateForm!: FormGroup;
  isSubmitting: boolean = false;
  nameMaxLength: number = 50;
  descriptionMaxLength: number = 90;
  nameCharsRemaining: number = this.nameMaxLength;
  descriptionCharsRemaining: number = this.descriptionMaxLength;
  locations: Location[] = [];
  categories: Category[] = [];
  minPublishDate: string; // Fecha actual
  maxPublishDate: string;

  constructor(
    private fb: FormBuilder,
    private realStateService: RealStateService,
    private locationService: LocationService,
    private categoryService: CategoryServiceService,
    private toastr: ToastrService
  ) {
    // Establecer la fecha mínima (hoy)
    const today = new Date();
    this.minPublishDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Establecer la fecha máxima (hoy + 1 año)
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    this.maxPublishDate = maxDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  ngOnInit(): void {
    this.initForm();
    this.setupCharCounters();
    this.loadLocations();
    this.loadCategories();
  }

  private loadLocations(): void {
    this.locationService.getLocations(0, 50).subscribe({
      next: (response) => {
        console.log('Ubicaciones cargadas:', response); 
        if (response && response.content) {
          this.locations = response.content;
        } else {
          console.error('Formato de respuesta inesperado:', response);
          this.locations = response.content;
        }
      },
      error: (error) => {
        console.error('Error al cargar ubicaciones:', error);
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories(0, 50).subscribe({
      next: (response) => {
        console.log('Categorías cargadas:', response); 
        if (response && response.content) {
          this.categories = response.content;
        } else {
          console.error('Formato de respuesta inesperado:', response);
          this.categories = response.content;
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  private setupCharCounters(): void {
    // Controlar contador de caracteres de nombre
    this.realStateForm.get('name')?.valueChanges.subscribe(value => {
      this.nameCharsRemaining = this.nameMaxLength - (value?.length || 0);
    });

    // Controlar contador de caracteres de descripción
    this.realStateForm.get('description')?.valueChanges.subscribe(value => {
      this.descriptionCharsRemaining = this.descriptionMaxLength - (value?.length || 0);
    });
  }
  
  private initForm(): void {
    this.realStateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(90)]],
      price: ['', [Validators.required, Validators.min(0)]],
      rooms: ['', [Validators.required, Validators.min(0)]],
      bathrooms: ['', [Validators.required, Validators.min(0)]],
      locationId: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      publishDate: [
        this.minPublishDate, // Valor inicial: fecha actual
        [
          Validators.required,
          this.dateRangeValidator(this.minPublishDate, this.maxPublishDate)
        ]
      ]
    });
  }

  onSubmit(): void {
    if (this.realStateForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.realStateForm.controls).forEach(key => {
        const control = this.realStateForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;

    const formData = this.realStateForm.value;

    const realStateData: RealState = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      rooms: Number(formData.rooms),
      bathrooms: Number(formData.bathrooms),
      locationId: Number(formData.locationId),
      categoryId: Number(formData.categoryId),
      publishDate: formData.publishDate
    };

    this.realStateService.createRealState(realStateData).subscribe({
      next: (response) => {
        console.log('Propiedad creada exitosamente:', response);
        this.isSubmitting = false;
        
        // Mostrar mensaje de éxito
        this.toastr.success('Propiedad creada exitosamente', 'Éxito');
        
        // Reiniciar el formulario
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al crear la propiedad:', error);
        this.isSubmitting = false;
        
        // Mostrar mensaje de error
        this.toastr.error(
          error.error?.message || 'Ocurrió un error al crear la propiedad', 
          'Error'
        );
      }
    });
  }

  resetForm(): void {
    this.realStateForm.reset();
    // Eliminar el estado de error/tocado de todos los controles
    Object.keys(this.realStateForm.controls).forEach(key => {
      const control = this.realStateForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
    });

    this.nameCharsRemaining = this.nameMaxLength;
    this.descriptionCharsRemaining = this.descriptionMaxLength;
    
    this.realStateForm.patchValue({
      name: '',
      description: ''
    });
  }

  //helper
  hasError(controlName: string): boolean {
    const control = this.realStateForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
  
  getErrorMessage(controlName: string): string {
    const control = this.realStateForm.get(controlName);
    
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

    if (controlName === 'publishDate') {
      if (control.errors['minDate']) {
        return 'La fecha no puede ser anterior a hoy';
      }
      if (control.errors['maxDate']) {
        return 'La fecha no puede exceder 30 días a partir de hoy';
      }
    }
    
    return 'Campo inválido';
  }

  dateRangeValidator(min: string, max: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null; // No validar si no hay valor (el required se encargará)
      }
      
      const dateValue = new Date(value);
      const minDate = new Date(min);
      const maxDate = new Date(max);
      
      // Reajustar horas para comparación correcta
      dateValue.setHours(0, 0, 0, 0);
      minDate.setHours(0, 0, 0, 0);
      maxDate.setHours(0, 0, 0, 0);
      
      if (dateValue < minDate) {
        return { 'minDate': { required: min, actual: value } };
      }
      
      if (dateValue > maxDate) {
        return { 'maxDate': { required: max, actual: value } };
      }
      
      return null;
    };
  }

}
