import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchCriteria } from 'src/app/shared/models/SearchCriteria';
import { FormBuilder, FormGroup } from '@angular/forms';
import { faFilter, faX } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-bar-home',
  templateUrl: './search-bar-home.component.html',
  styleUrls: ['./search-bar-home.component.scss']
})
export class SearchBarHomeComponent {
  faFilter = faFilter;
  faX = faX;
  @Input() categories: any[] = [];
  @Input() isLoading: boolean = false;

  @Output() search = new EventEmitter<SearchCriteria>();

  searchForm: FormGroup;
  showAdvancedFilters: boolean = false;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      categoryName: [''],
      locationName: [''],
      rooms: [null],
      bathrooms: [null],
      minPrice: [null],
      maxPrice: [null]
    });
  }

  onSearch(): void {
    const formValues = this.searchForm.value;
    
    const criteria: SearchCriteria = {};
    
    if (formValues.categoryName) criteria.categoryName = formValues.categoryName;
    if (formValues.locationName) criteria.locationName = formValues.locationName;
    if (formValues.rooms) criteria.rooms = formValues.rooms;
    if (formValues.bathrooms) criteria.bathrooms = formValues.bathrooms;
    if (formValues.minPrice) criteria.minPrice = formValues.minPrice;
    if (formValues.maxPrice) criteria.maxPrice = formValues.maxPrice;
    
    this.search.emit(criteria);
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // ← AGREGAR: Limpiar filtros avanzados
  clearAdvancedFilters(): void {
    this.searchForm.patchValue({
      rooms: null,
      bathrooms: null,
      minPrice: null,
      maxPrice: null
    });
    this.onSearch(); // Aplicar inmediatamente
  }

  // ← AGREGAR: Verificar si hay filtros avanzados activos
  hasActiveAdvancedFilters(): boolean {
    const values = this.searchForm.value;
    return !!(values.rooms || values.bathrooms || values.minPrice || values.maxPrice);
  }

  getActiveFiltersCount(): number {
  const values = this.searchForm.value;
  let count = 0;
  
  if (values.rooms) count++;
  if (values.bathrooms) count++;
  if (values.minPrice) count++;
  if (values.maxPrice) count++;
  
  return count;
}

}
