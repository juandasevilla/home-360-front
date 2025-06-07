import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { Location } from 'src/app/shared/models/Location';
import { City } from 'src/app/shared/models/City';
import { LocationService } from 'src/app/core/location/location.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss']
})
export class LocationFormComponent {
  locationForm!: FormGroup;
  isSubmitting: boolean = false;
  nameMaxLength: number = 50;
  descriptionMaxLength: number = 90;
  nameCharsRemaining: number = this.nameMaxLength;
  descriptionCharsRemaining: number = this.descriptionMaxLength;

  cities: City[] = [];
  filteredCities: Observable<City[]> = of([]);
  
  constructor(
    private fb: FormBuilder,
    private locationService: LocationService, 
    private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.setupCharCounters();
    this.setupFilters();
    
    // Cargar ciudades al iniciar
    this.loadCities();
  }

  private loadCities(): void {
  console.log('Iniciando carga de ciudades...');
  this.locationService.getCities(0, 50).subscribe({
    next: (response) => {
      console.log('Ciudades cargadas:', response); 
      
      if (response && response.content) {
        this.cities = response.content;
      } else {
        console.error('Formato de respuesta inesperado:', response);
        // Si la respuesta no tiene el formato esperado, intentar usarla directamente
        if (Array.isArray(response)) {
          this.cities = response;
        }
      }
      
      this.setupFilters();
    },
    error: (error) => {
      console.error('Error al cargar ciudades:', error);
    }
  });
}

  private setupFilters(): void {
  // Solo filtrar ciudades, ya que eliminaste el departamento
    if (this.locationForm.get('cityId')) {
      this.filteredCities = this.locationForm.get('cityId')!.valueChanges.pipe(
        startWith(''),
        map(value => {
          const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
          return this.cities.filter(city => 
            city.name.toLowerCase().includes(filterValue) || 
            city.department?.name.toLowerCase().includes(filterValue)
          );
        })
      );
    }
  }

  private setupCharCounters(): void {
    // Controlar contador de caracteres de nombre
    this.locationForm.get('name')?.valueChanges.subscribe(value => {
      this.nameCharsRemaining = this.nameMaxLength - (value?.length || 0);
    });

    // Controlar contador de caracteres de descripción
    this.locationForm.get('description')?.valueChanges.subscribe(value => {
      this.descriptionCharsRemaining = this.descriptionMaxLength - (value?.length || 0);
    });
  }
  
  private initForm(): void {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(this.nameMaxLength)]],
      description: ['', [Validators.required, Validators.maxLength(this.descriptionMaxLength)]],
      cityId: [null, Validators.required]
    });
  }
  
  displayFn(item:  City | null): string {
    return item ? item.name : '';
  }
  
  onSubmit(): void {
    if (this.locationForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.locationForm.controls).forEach(key => {
        const control = this.locationForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    // Obtener los valores del formulario
    const locationData: Location = {
      name: this.locationForm.value.name,
      description: this.locationForm.value.description,
      cityId: this.locationForm.value.cityId
    };

    this.locationService.createLocation(locationData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.resetForm();
        this.toastr.success('Ubicación creada exitosamente', 'Éxito');
      },
      error: (error) => {
        this.toastr.error('Error al crear la ubicación', error);
        this.isSubmitting = false;
      }
    });
    
  }
  
  resetForm(): void {
    this.locationForm.reset();
    // Eliminar el estado de error/tocado de todos los controles
    Object.keys(this.locationForm.controls).forEach(key => {
      const control = this.locationForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
    });

    // Resetear explícitamente los contadores de caracteres
    this.nameCharsRemaining = this.nameMaxLength;
    this.descriptionCharsRemaining = this.descriptionMaxLength;
    
    // Establecer valores vacíos explícitamente
    this.locationForm.patchValue({
      name: '',
      description: '',
      departmentId: null,
      cityId: null
    });
    
  }

  // Helper para las validaciones
  hasError(controlName: string): boolean {
    const control = this.locationForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
  
  getErrorMessage(controlName: string): string {
    const control = this.locationForm.get(controlName);
    
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
      return `Debe tener máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    
    return 'Campo inválido';
  }
}

