import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { Location } from 'src/app/shared/models/Location';
import { Department } from 'src/app/shared/models/Department';
import { City } from 'src/app/shared/models/City';
import { LocationService } from 'src/app/core/location/location.service';

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

  // Listas para los selects
  departments: Department[] = [];
  filteredDepartments: Observable<Department[]> = of([]);
  
  cities: City[] = [];
  filteredCities: Observable<City[]> = of([]);
  
  constructor(
    private fb: FormBuilder,
    private locationService: LocationService // Reemplazar con el servicio real
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.setupCharCounters();
    this.setupFilters();
    
    // Cargar los departamentos al iniciar
    this.loadDepartments();
    this.loadCities();
    
    // Observador para cambios en el departamento seleccionado
    
  }

  // Ejemplo: cargar departamentos (esto será reemplazado por llamadas al servicio)
  private loadDepartments(): void {
  this.locationService.getDepartments(0, 50).subscribe({
    next: (response) => {
      console.log('Departamentos cargados:', response); // Log para depuración
      
      if (response && response.content) {
        this.departments = response.content;
      } else {
        console.error('Formato de respuesta inesperado:', response);
        // Si la respuesta no tiene el formato esperado, intentar usarla directamente
        if (Array.isArray(response)) {
          this.departments = response;
        }
      }
      
      // Actualizar el filtrado después de cargar los datos
      
    },
    error: (error) => {
      console.error('Error al cargar departamentos:', error);
    }
  });
}
  
  // Ejemplo: cargar ciudades por departamento (esto será reemplazado por llamadas al servicio)
  private loadCities(): void {
  this.locationService.getCities(0, 50).subscribe({
    next: (response) => {
      console.log('Ciudades cargadas:', response); // Log para depuración
      
      if (response && response.content) {
        this.cities = response.content;
      } else {
        console.error('Formato de respuesta inesperado:', response);
        // Si la respuesta no tiene el formato esperado, intentar usarla directamente
        if (Array.isArray(response)) {
          this.cities = response;
        }
      }
      
      // Actualizar el filtrado después de cargar los datos
      this.setupFilters();
    },
    error: (error) => {
      console.error('Error al cargar ciudades:', error);
    }
  });
}

  private setupFilters(): void {
    // Filtrado para departamentos
    this.filteredDepartments = this.locationForm.get('departmentId')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
        return this.departments.filter(department => 
          department.name.toLowerCase().includes(filterValue)
        );
      })
    );
    
    // Filtrado para ciudades
    this.filteredCities = this.locationForm.get('cityId')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
        return this.cities.filter(city => 
          city.name.toLowerCase().includes(filterValue)
        );
      })
    );
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
      departmentId: [null, Validators.required],
      cityId: [null, Validators.required]
    });
  }
  
  displayFn(item: Department | City | null): string {
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
      departmentId: this.locationForm.value.departmentId,
      cityId: this.locationForm.value.cityId
    };

    // Implementación real con servicio
    this.locationService.createLocation(locationData).subscribe({
      next: (response) => {
        console.log('Ubicación creada exitosamente:', response);
        this.isSubmitting = false;
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al crear la ubicación:', error);
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

