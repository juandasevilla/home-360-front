import { Component } from '@angular/core';
import { TableColumn } from 'src/app/shared/models/TableColumn';
import { Page } from 'src/app/shared/models/Page';
import { RealState } from 'src/app/shared/models/RealState';
import { RealStateService } from 'src/app/core/RealState/real-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RealStateFilter } from 'src/app/shared/models/RealStateFilter';

@Component({
  selector: 'app-real-state-table',
  templateUrl: './real-state-table.component.html',
  styleUrls: ['./real-state-table.component.scss']
})
export class RealStateTableComponent {
  columns: TableColumn[] = [
      { key: 'id', header: 'ID', width: '80px' },
      { key: 'name', header: 'Nombre', width: '25%' },
      { key: 'rooms', header: 'Habitaciones' },
      { key: 'bathrooms', header: 'Baños' },
      { key: 'price', header: 'Precio' },
      { key: 'location.city.name', header: 'Ciudad' },
      { key: 'category.name', header: 'Categoria' },
    ];

    realStates: RealState[] = [];
    loading: boolean = false;
    currentPage: number = 0;
    totalPages: number = 0;
    totalElements: number = 0;
    pageSize: number = 10;
    orderAsc: boolean = false;
    filterForm: FormGroup;
    showFilters: boolean = false;

    constructor(
      private realStateService: RealStateService,
      private fb: FormBuilder
    ) {
      this.filterForm = this.fb.group({
        categoryName: [''],
        bathrooms: [null],
        rooms: [null],
        locationName: [''],
        minPrice: [null],
        maxPrice: [null]
      });
    }

    ngOnInit(): void {
      this.loadRealStates();
    }
    
    loadRealStates(): void {
      this.loading = true;

      const filters: RealStateFilter = {};
    
      const formValues = this.filterForm.value;
      if (formValues.categoryName) filters.categoryName = formValues.categoryName;
      if (formValues.bathrooms) filters.bathrooms = formValues.bathrooms;
      if (formValues.rooms) filters.rooms = formValues.rooms;
      if (formValues.locationName) filters.locationName = formValues.locationName;
      if (formValues.minPrice) filters.minPrice = formValues.minPrice;
      if (formValues.maxPrice) filters.maxPrice = formValues.maxPrice;
      
      this.realStateService.getRealStates(this.currentPage, this.pageSize, false, filters).subscribe({
        next: (response: Page<RealState>) => {
          this.realStates = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar categorías:', error);
          this.loading = false;
        }
      });
    }

    onSearch(): void {
    this.currentPage = 0; // Reset a la primera página al buscar
    this.loadRealStates();
    }
    
    onPageChange(page: number): void {
      this.currentPage = page;
      this.loadRealStates();
    }
    
    onRealStateSelect(realState: RealState): void {
      console.log('Categoría seleccionada:', location);
      // Aquí podrías implementar la edición o vista detalle
    }

    toggleSort(): void {
      this.orderAsc = !this.orderAsc;
      this.loadRealStates();
    }

    clearFilters(): void {
      this.filterForm.reset({
        categoryName: '',
        bathrooms: null,
        rooms: null,
        locationName: '',
        minPrice: null,
        maxPrice: null
      });
      this.currentPage = 0;
      this.loadRealStates();
    }
    
    toggleFilters(): void {
      this.showFilters = !this.showFilters;
    }

}
